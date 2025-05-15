from flask import Blueprint, request, jsonify
from datetime import datetime
from .models import DispatchUnit, AlarmDispatch, DispatchLog
from ..alarm_unified_access.models import AlarmRecord
from .. import db

bp = Blueprint('alarm_dispatch_down', __name__)

def create_dispatch_log(dispatch_id, action, status, operator, operator_id, details=None):
    """创建下发日志"""
    log = DispatchLog(
        dispatch_id=dispatch_id,
        action=action,
        status=status,
        operator=operator,
        operator_id=operator_id,
        details=details
    )
    db.session.add(log)
    return log

@bp.route('/units', methods=['GET'])
def list_dispatch_units():
    """获取下发单位列表"""
    level = request.args.get('level')
    status = request.args.get('status')
    
    query = DispatchUnit.query
    
    if level:
        query = query.filter(DispatchUnit.level == level)
    if status:
        query = query.filter(DispatchUnit.status == status)
    
    units = query.all()
    return jsonify([unit.to_dict() for unit in units]), 200

@bp.route('/units/<int:unit_id>', methods=['GET'])
def get_dispatch_unit(unit_id):
    """获取特定下发单位信息"""
    unit = DispatchUnit.query.get(unit_id)
    if unit:
        return jsonify(unit.to_dict()), 200
    return jsonify({'error': 'Dispatch unit not found'}), 404

@bp.route('/units', methods=['POST'])
def create_dispatch_unit():
    """创建新的下发单位"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    required_fields = ['name', 'code', 'level']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    try:
        unit = DispatchUnit(
            name=data['name'],
            code=data['code'],
            level=data['level'],
            parent_id=data.get('parent_id'),
            status=data.get('status', 'active')
        )
        db.session.add(unit)
        db.session.commit()
        return jsonify(unit.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/units/<int:unit_id>', methods=['PUT'])
def update_dispatch_unit(unit_id):
    """更新下发单位信息"""
    unit = DispatchUnit.query.get(unit_id)
    if not unit:
        return jsonify({'error': 'Dispatch unit not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    try:
        if 'name' in data:
            unit.name = data['name']
        if 'code' in data:
            unit.code = data['code']
        if 'level' in data:
            unit.level = data['level']
        if 'parent_id' in data:
            unit.parent_id = data['parent_id']
        if 'status' in data:
            unit.status = data['status']
        
        db.session.commit()
        return jsonify(unit.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/dispatch', methods=['POST'])
def create_dispatch():
    """创建新的警情下发记录"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    required_fields = ['alarm_record_id', 'unit_id']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # 检查警情记录是否存在
    alarm = AlarmRecord.query.get(data['alarm_record_id'])
    if not alarm:
        return jsonify({'error': 'Alarm record not found'}), 404
    
    # 检查下发单位是否存在
    unit = DispatchUnit.query.get(data['unit_id'])
    if not unit:
        return jsonify({'error': 'Dispatch unit not found'}), 404
    
    try:
        dispatch = AlarmDispatch(
            alarm_record_id=data['alarm_record_id'],
            unit_id=data['unit_id'],
            status='pending'
        )
        db.session.add(dispatch)
        db.session.commit()
        
        # 创建下发日志
        create_dispatch_log(
            dispatch.id,
            'create',
            'pending',
            data.get('operator', 'system'),
            data.get('operator_id', 0),
            '创建警情下发记录'
        )
        db.session.commit()
        
        return jsonify(dispatch.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/dispatch/<int:dispatch_id>', methods=['GET'])
def get_dispatch(dispatch_id):
    """获取特定警情下发记录"""
    dispatch = AlarmDispatch.query.get(dispatch_id)
    if dispatch:
        return jsonify(dispatch.to_dict()), 200
    return jsonify({'error': 'Dispatch record not found'}), 404

@bp.route('/dispatch/<int:dispatch_id>/status', methods=['PUT'])
def update_dispatch_status(dispatch_id):
    """更新警情下发状态"""
    dispatch = AlarmDispatch.query.get(dispatch_id)
    if not dispatch:
        return jsonify({'error': 'Dispatch record not found'}), 404
    
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    try:
        old_status = dispatch.status
        dispatch.status = data['status']
        
        # 根据状态更新相应的时间字段
        now = datetime.utcnow()
        if data['status'] == 'sent':
            dispatch.dispatch_time = now
        elif data['status'] == 'received':
            dispatch.receive_time = now
        elif data['status'] == 'completed':
            dispatch.complete_time = now
        
        # 创建状态更新日志
        create_dispatch_log(
            dispatch.id,
            'update',
            data['status'],
            data.get('operator', 'system'),
            data.get('operator_id', 0),
            f'状态从 {old_status} 更新为 {data["status"]}'
        )
        
        db.session.commit()
        return jsonify(dispatch.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/dispatch/<int:dispatch_id>/feedback', methods=['POST'])
def add_dispatch_feedback(dispatch_id):
    """添加警情下发反馈"""
    dispatch = AlarmDispatch.query.get(dispatch_id)
    if not dispatch:
        return jsonify({'error': 'Dispatch record not found'}), 404
    
    data = request.get_json()
    if not data or 'feedback' not in data:
        return jsonify({'error': 'Feedback content is required'}), 400
    
    try:
        dispatch.feedback = data['feedback']
        dispatch.feedback_time = datetime.utcnow()
        
        # 创建反馈日志
        create_dispatch_log(
            dispatch.id,
            'feedback',
            dispatch.status,
            data.get('operator', 'system'),
            data.get('operator_id', 0),
            '添加处理反馈'
        )
        
        db.session.commit()
        return jsonify(dispatch.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/dispatch', methods=['GET'])
def list_dispatches():
    """获取警情下发记录列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # 构建查询
    query = AlarmDispatch.query
    
    # 添加过滤条件
    alarm_id = request.args.get('alarm_record_id')
    unit_id = request.args.get('unit_id')
    status = request.args.get('status')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if alarm_id:
        query = query.filter(AlarmDispatch.alarm_record_id == alarm_id)
    if unit_id:
        query = query.filter(AlarmDispatch.unit_id == unit_id)
    if status:
        query = query.filter(AlarmDispatch.status == status)
    if start_date:
        query = query.filter(AlarmDispatch.dispatch_time >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(AlarmDispatch.dispatch_time <= datetime.fromisoformat(end_date))
    
    # 执行分页查询
    pagination = query.order_by(AlarmDispatch.dispatch_time.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@bp.route('/dispatch/<int:dispatch_id>/logs', methods=['GET'])
def get_dispatch_logs(dispatch_id):
    """获取警情下发日志"""
    dispatch = AlarmDispatch.query.get(dispatch_id)
    if not dispatch:
        return jsonify({'error': 'Dispatch record not found'}), 404
    
    logs = DispatchLog.query.filter_by(dispatch_id=dispatch_id).order_by(DispatchLog.created_at.desc()).all()
    return jsonify([log.to_dict() for log in logs]), 200
