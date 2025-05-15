from flask import Blueprint, request, jsonify
from datetime import datetime
import json
from .models import (
    PoliceOfficer, DispatchTask, DispatchGroup,
    DispatchGroupMember, DispatchLog
)
from ..alarm_unified_access.models import AlarmRecord
from .. import db

bp = Blueprint('alarm_dispatching', __name__)

def create_dispatch_log(task_id=None, group_id=None, action=None, status=None, operator=None, operator_id=None, details=None):
    """创建派警日志"""
    log = DispatchLog(
        task_id=task_id,
        group_id=group_id,
        action=action,
        status=status,
        operator=operator,
        operator_id=operator_id,
        details=details
    )
    db.session.add(log)
    return log

@bp.route('/officers', methods=['GET'])
def list_officers():
    """获取警员列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # 构建查询
    query = PoliceOfficer.query
    
    # 添加过滤条件
    unit_id = request.args.get('unit_id')
    status = request.args.get('status')
    skill = request.args.get('skill')
    
    if unit_id:
        query = query.filter(PoliceOfficer.unit_id == unit_id)
    if status:
        query = query.filter(PoliceOfficer.status == status)
    if skill:
        query = query.filter(PoliceOfficer.skills.contains(skill))
    
    # 执行分页查询
    pagination = query.order_by(PoliceOfficer.name).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@bp.route('/officers/<int:officer_id>', methods=['GET'])
def get_officer(officer_id):
    """获取特定警员信息"""
    officer = PoliceOfficer.query.get(officer_id)
    if officer:
        return jsonify(officer.to_dict()), 200
    return jsonify({'error': 'Officer not found'}), 404

@bp.route('/officers', methods=['POST'])
def create_officer():
    """创建新的警员信息"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    required_fields = ['name', 'badge_number', 'unit_id']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    try:
        officer = PoliceOfficer(
            name=data['name'],
            badge_number=data['badge_number'],
            unit_id=data['unit_id'],
            position=data.get('position'),
            rank=data.get('rank'),
            skills=json.dumps(data.get('skills', [])) if data.get('skills') else None,
            status=data.get('status', 'available')
        )
        db.session.add(officer)
        db.session.commit()
        return jsonify(officer.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/officers/<int:officer_id>', methods=['PUT'])
def update_officer(officer_id):
    """更新警员信息"""
    officer = PoliceOfficer.query.get(officer_id)
    if not officer:
        return jsonify({'error': 'Officer not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    try:
        if 'name' in data:
            officer.name = data['name']
        if 'badge_number' in data:
            officer.badge_number = data['badge_number']
        if 'unit_id' in data:
            officer.unit_id = data['unit_id']
        if 'position' in data:
            officer.position = data['position']
        if 'rank' in data:
            officer.rank = data['rank']
        if 'skills' in data:
            officer.skills = json.dumps(data['skills'])
        if 'status' in data:
            officer.status = data['status']
        if 'current_location' in data:
            officer.current_location = data['current_location']
        if 'latitude' in data:
            officer.latitude = data['latitude']
        if 'longitude' in data:
            officer.longitude = data['longitude']
        if any(key in data for key in ['current_location', 'latitude', 'longitude']):
            officer.last_location_update = datetime.utcnow()
        
        db.session.commit()
        return jsonify(officer.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/tasks', methods=['POST'])
def create_dispatch_task():
    """创建派警任务"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    required_fields = ['alarm_record_id', 'officer_id']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # 检查警情记录是否存在
    alarm = AlarmRecord.query.get(data['alarm_record_id'])
    if not alarm:
        return jsonify({'error': 'Alarm record not found'}), 404
    
    # 检查警员是否存在
    officer = PoliceOfficer.query.get(data['officer_id'])
    if not officer:
        return jsonify({'error': 'Officer not found'}), 404
    
    try:
        task = DispatchTask(
            alarm_record_id=data['alarm_record_id'],
            officer_id=data['officer_id'],
            priority=data.get('priority', 'normal')
        )
        db.session.add(task)
        db.session.commit()
        
        # 创建任务日志
        create_dispatch_log(
            task_id=task.id,
            action='create',
            status='pending',
            operator=data.get('operator', 'system'),
            operator_id=data.get('operator_id', 0),
            details='创建派警任务'
        )
        db.session.commit()
        
        return jsonify(task.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_dispatch_task(task_id):
    """获取特定派警任务"""
    task = DispatchTask.query.get(task_id)
    if task:
        return jsonify(task.to_dict()), 200
    return jsonify({'error': 'Dispatch task not found'}), 404

@bp.route('/tasks/<int:task_id>/status', methods=['PUT'])
def update_task_status(task_id):
    """更新派警任务状态"""
    task = DispatchTask.query.get(task_id)
    if not task:
        return jsonify({'error': 'Dispatch task not found'}), 404
    
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    try:
        old_status = task.status
        task.status = data['status']
        
        # 根据状态更新相应的时间字段
        now = datetime.utcnow()
        if data['status'] == 'accepted':
            task.accepted_time = now
        elif data['status'] == 'in_progress':
            task.start_time = now
        elif data['status'] == 'completed':
            task.complete_time = now
        elif data['status'] == 'cancelled':
            task.cancel_time = now
            task.cancel_reason = data.get('cancel_reason')
        
        # 创建状态更新日志
        create_dispatch_log(
            task_id=task.id,
            action='update',
            status=data['status'],
            operator=data.get('operator', 'system'),
            operator_id=data.get('operator_id', 0),
            details=f'状态从 {old_status} 更新为 {data["status"]}'
        )
        
        db.session.commit()
        return jsonify(task.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/tasks/<int:task_id>/feedback', methods=['POST'])
def add_task_feedback(task_id):
    """添加派警任务反馈"""
    task = DispatchTask.query.get(task_id)
    if not task:
        return jsonify({'error': 'Dispatch task not found'}), 404
    
    data = request.get_json()
    if not data or 'feedback' not in data:
        return jsonify({'error': 'Feedback content is required'}), 400
    
    try:
        task.feedback = data['feedback']
        
        # 创建反馈日志
        create_dispatch_log(
            task_id=task.id,
            action='feedback',
            status=task.status,
            operator=data.get('operator', 'system'),
            operator_id=data.get('operator_id', 0),
            details='添加任务反馈'
        )
        
        db.session.commit()
        return jsonify(task.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/tasks', methods=['GET'])
def list_dispatch_tasks():
    """获取派警任务列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # 构建查询
    query = DispatchTask.query
    
    # 添加过滤条件
    alarm_id = request.args.get('alarm_record_id')
    officer_id = request.args.get('officer_id')
    status = request.args.get('status')
    priority = request.args.get('priority')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if alarm_id:
        query = query.filter(DispatchTask.alarm_record_id == alarm_id)
    if officer_id:
        query = query.filter(DispatchTask.officer_id == officer_id)
    if status:
        query = query.filter(DispatchTask.status == status)
    if priority:
        query = query.filter(DispatchTask.priority == priority)
    if start_date:
        query = query.filter(DispatchTask.assigned_time >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(DispatchTask.assigned_time <= datetime.fromisoformat(end_date))
    
    # 执行分页查询
    pagination = query.order_by(DispatchTask.assigned_time.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@bp.route('/groups', methods=['POST'])
def create_dispatch_group():
    """创建派警任务组"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    required_fields = ['alarm_record_id', 'members']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # 检查警情记录是否存在
    alarm = AlarmRecord.query.get(data['alarm_record_id'])
    if not alarm:
        return jsonify({'error': 'Alarm record not found'}), 404
    
    try:
        # 创建任务组
        group = DispatchGroup(
            alarm_record_id=data['alarm_record_id'],
            name=data.get('name'),
            leader_id=data.get('leader_id')
        )
        db.session.add(group)
        db.session.flush()  # 获取group.id
        
        # 添加组成员
        for member_data in data['members']:
            member = DispatchGroupMember(
                group_id=group.id,
                officer_id=member_data['officer_id'],
                role=member_data.get('role', 'member')
            )
            db.session.add(member)
        
        db.session.commit()
        
        # 创建组日志
        create_dispatch_log(
            group_id=group.id,
            action='create',
            status='pending',
            operator=data.get('operator', 'system'),
            operator_id=data.get('operator_id', 0),
            details='创建派警任务组'
        )
        db.session.commit()
        
        return jsonify(group.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/groups/<int:group_id>', methods=['GET'])
def get_dispatch_group(group_id):
    """获取特定派警任务组"""
    group = DispatchGroup.query.get(group_id)
    if group:
        return jsonify(group.to_dict()), 200
    return jsonify({'error': 'Dispatch group not found'}), 404

@bp.route('/groups/<int:group_id>/status', methods=['PUT'])
def update_group_status(group_id):
    """更新派警任务组状态"""
    group = DispatchGroup.query.get(group_id)
    if not group:
        return jsonify({'error': 'Dispatch group not found'}), 404
    
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    try:
        old_status = group.status
        group.status = data['status']
        
        # 创建状态更新日志
        create_dispatch_log(
            group_id=group.id,
            action='update',
            status=data['status'],
            operator=data.get('operator', 'system'),
            operator_id=data.get('operator_id', 0),
            details=f'状态从 {old_status} 更新为 {data["status"]}'
        )
        
        db.session.commit()
        return jsonify(group.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/groups/<int:group_id>/members', methods=['POST'])
def add_group_member(group_id):
    """添加派警任务组成员"""
    group = DispatchGroup.query.get(group_id)
    if not group:
        return jsonify({'error': 'Dispatch group not found'}), 404
    
    data = request.get_json()
    if not data or 'officer_id' not in data:
        return jsonify({'error': 'Officer ID is required'}), 400
    
    try:
        member = DispatchGroupMember(
            group_id=group_id,
            officer_id=data['officer_id'],
            role=data.get('role', 'member')
        )
        db.session.add(member)
        
        # 创建成员添加日志
        create_dispatch_log(
            group_id=group.id,
            action='add_member',
            status=group.status,
            operator=data.get('operator', 'system'),
            operator_id=data.get('operator_id', 0),
            details=f'添加成员：{data["officer_id"]}'
        )
        
        db.session.commit()
        return jsonify(member.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/groups/<int:group_id>/members/<int:member_id>', methods=['DELETE'])
def remove_group_member(group_id, member_id):
    """移除派警任务组成员"""
    member = DispatchGroupMember.query.filter_by(group_id=group_id, id=member_id).first()
    if not member:
        return jsonify({'error': 'Group member not found'}), 404
    
    try:
        db.session.delete(member)
        
        # 创建成员移除日志
        create_dispatch_log(
            group_id=group_id,
            action='remove_member',
            status='pending',
            operator=request.json.get('operator', 'system'),
            operator_id=request.json.get('operator_id', 0),
            details=f'移除成员：{member.officer_id}'
        )
        
        db.session.commit()
        return jsonify({'message': 'Member removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/groups', methods=['GET'])
def list_dispatch_groups():
    """获取派警任务组列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # 构建查询
    query = DispatchGroup.query
    
    # 添加过滤条件
    alarm_id = request.args.get('alarm_record_id')
    status = request.args.get('status')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if alarm_id:
        query = query.filter(DispatchGroup.alarm_record_id == alarm_id)
    if status:
        query = query.filter(DispatchGroup.status == status)
    if start_date:
        query = query.filter(DispatchGroup.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(DispatchGroup.created_at <= datetime.fromisoformat(end_date))
    
    # 执行分页查询
    pagination = query.order_by(DispatchGroup.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@bp.route('/tasks/<int:task_id>/logs', methods=['GET'])
def get_task_logs(task_id):
    """获取派警任务日志"""
    task = DispatchTask.query.get(task_id)
    if not task:
        return jsonify({'error': 'Dispatch task not found'}), 404
    
    logs = DispatchLog.query.filter_by(task_id=task_id).order_by(DispatchLog.created_at.desc()).all()
    return jsonify([log.to_dict() for log in logs]), 200

@bp.route('/groups/<int:group_id>/logs', methods=['GET'])
def get_group_logs(group_id):
    """获取派警任务组日志"""
    group = DispatchGroup.query.get(group_id)
    if not group:
        return jsonify({'error': 'Dispatch group not found'}), 404
    
    logs = DispatchLog.query.filter_by(group_id=group_id).order_by(DispatchLog.created_at.desc()).all()
    return jsonify([log.to_dict() for log in logs]), 200
