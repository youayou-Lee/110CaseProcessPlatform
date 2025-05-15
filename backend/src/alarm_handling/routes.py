from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from .models import HandlingRecord, EvidenceFile, HandlingLog
from ..alarm_unified_access.models import AlarmRecord
from ..alarm_dispatching.models import DispatchTask, DispatchGroup
from .. import db

bp = Blueprint('alarm_handling', __name__)

def allowed_file(filename):
    """检查文件类型是否允许上传"""
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'mp4', 'avi', 'mp3', 'wav', 'pdf', 'doc', 'docx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_type(filename):
    """根据文件扩展名判断文件类型"""
    ext = filename.rsplit('.', 1)[1].lower()
    if ext in {'jpg', 'jpeg', 'png'}:
        return 'image'
    elif ext in {'mp4', 'avi'}:
        return 'video'
    elif ext in {'mp3', 'wav'}:
        return 'audio'
    elif ext in {'pdf', 'doc', 'docx'}:
        return 'document'
    return 'unknown'

def create_handling_log(handling_record_id, action, status, operator, operator_id, details=None):
    """创建处置日志"""
    log = HandlingLog(
        handling_record_id=handling_record_id,
        action=action,
        status=status,
        operator=operator,
        operator_id=operator_id,
        details=details
    )
    db.session.add(log)
    return log

@bp.route('/records', methods=['POST'])
def create_handling_record():
    """创建新的警情处置记录"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    required_fields = ['alarm_record_id']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # 检查警情记录是否存在
    alarm = AlarmRecord.query.get(data['alarm_record_id'])
    if not alarm:
        return jsonify({'error': 'Alarm record not found'}), 404
    
    # 检查任务或任务组是否存在
    task_id = data.get('task_id')
    group_id = data.get('group_id')
    if task_id:
        task = DispatchTask.query.get(task_id)
        if not task:
            return jsonify({'error': 'Dispatch task not found'}), 404
    if group_id:
        group = DispatchGroup.query.get(group_id)
        if not group:
            return jsonify({'error': 'Dispatch group not found'}), 404
    
    try:
        record = HandlingRecord(
            alarm_record_id=data['alarm_record_id'],
            task_id=task_id,
            group_id=group_id,
            handling_type=data.get('handling_type'),
            handling_method=data.get('handling_method'),
            status='pending'
        )
        db.session.add(record)
        db.session.commit()
        
        # 创建处置日志
        create_handling_log(
            record.id,
            'create',
            'pending',
            data.get('operator', 'system'),
            data.get('operator_id', 0),
            '创建警情处置记录'
        )
        db.session.commit()
        
        return jsonify(record.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/records/<int:record_id>', methods=['GET'])
def get_handling_record(record_id):
    """获取特定警情处置记录"""
    record = HandlingRecord.query.get(record_id)
    if record:
        return jsonify(record.to_dict()), 200
    return jsonify({'error': 'Handling record not found'}), 404

@bp.route('/records/<int:record_id>/status', methods=['PUT'])
def update_handling_status(record_id):
    """更新警情处置状态"""
    record = HandlingRecord.query.get(record_id)
    if not record:
        return jsonify({'error': 'Handling record not found'}), 404
    
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    try:
        old_status = record.status
        record.status = data['status']
        
        # 根据状态更新相应的时间字段
        now = datetime.utcnow()
        if data['status'] == 'in_progress':
            record.handling_time = now
        elif data['status'] == 'completed':
            record.completion_time = now
        elif data['status'] == 'cancelled':
            record.cancel_time = now
            record.cancel_reason = data.get('cancel_reason')
        
        # 创建状态更新日志
        create_handling_log(
            record.id,
            'update',
            data['status'],
            data.get('operator', 'system'),
            data.get('operator_id', 0),
            f'状态从 {old_status} 更新为 {data["status"]}'
        )
        
        db.session.commit()
        return jsonify(record.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/records/<int:record_id>/result', methods=['POST'])
def add_handling_result(record_id):
    """添加警情处置结果"""
    record = HandlingRecord.query.get(record_id)
    if not record:
        return jsonify({'error': 'Handling record not found'}), 404
    
    data = request.get_json()
    if not data or 'handling_result' not in data:
        return jsonify({'error': 'Handling result is required'}), 400
    
    try:
        record.handling_result = data['handling_result']
        if 'handling_type' in data:
            record.handling_type = data['handling_type']
        if 'handling_method' in data:
            record.handling_method = data['handling_method']
        
        # 创建结果更新日志
        create_handling_log(
            record.id,
            'update',
            record.status,
            data.get('operator', 'system'),
            data.get('operator_id', 0),
            '添加处置结果'
        )
        
        db.session.commit()
        return jsonify(record.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/records/<int:record_id>/evidence', methods=['POST'])
def upload_evidence_file(record_id):
    """上传处置证据文件"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    record = HandlingRecord.query.get(record_id)
    if not record:
        return jsonify({'error': 'Handling record not found'}), 404
    
    try:
        # 创建上传目录
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'evidence', str(record_id))
        os.makedirs(upload_dir, exist_ok=True)
        
        # 保存文件
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # 获取文件信息
        file_size = os.path.getsize(file_path)
        file_type = get_file_type(filename)
        mime_type = file.content_type
        
        # 创建证据文件记录
        evidence_file = EvidenceFile(
            handling_record_id=record_id,
            file_path=file_path,
            file_name=filename,
            file_size=file_size,
            file_type=file_type,
            mime_type=mime_type,
            description=request.form.get('description')
        )
        
        db.session.add(evidence_file)
        
        # 创建文件上传日志
        create_handling_log(
            record.id,
            'upload',
            record.status,
            request.form.get('operator', 'system'),
            request.form.get('operator_id', 0),
            f'上传证据文件：{filename}'
        )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Evidence file uploaded successfully',
            'data': evidence_file.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error uploading evidence file: {str(e)}'}), 500

@bp.route('/records', methods=['GET'])
def list_handling_records():
    """获取警情处置记录列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # 构建查询
    query = HandlingRecord.query
    
    # 添加过滤条件
    alarm_id = request.args.get('alarm_record_id')
    task_id = request.args.get('task_id')
    group_id = request.args.get('group_id')
    status = request.args.get('status')
    handling_type = request.args.get('handling_type')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if alarm_id:
        query = query.filter(HandlingRecord.alarm_record_id == alarm_id)
    if task_id:
        query = query.filter(HandlingRecord.task_id == task_id)
    if group_id:
        query = query.filter(HandlingRecord.group_id == group_id)
    if status:
        query = query.filter(HandlingRecord.status == status)
    if handling_type:
        query = query.filter(HandlingRecord.handling_type == handling_type)
    if start_date:
        query = query.filter(HandlingRecord.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(HandlingRecord.created_at <= datetime.fromisoformat(end_date))
    
    # 执行分页查询
    pagination = query.order_by(HandlingRecord.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@bp.route('/records/<int:record_id>/logs', methods=['GET'])
def get_handling_logs(record_id):
    """获取警情处置日志"""
    record = HandlingRecord.query.get(record_id)
    if not record:
        return jsonify({'error': 'Handling record not found'}), 404
    
    logs = HandlingLog.query.filter_by(handling_record_id=record_id).order_by(HandlingLog.created_at.desc()).all()
    return jsonify([log.to_dict() for log in logs]), 200 