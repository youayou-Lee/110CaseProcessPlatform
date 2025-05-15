from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from .models import ArchivedAlarm, ArchiveFile, ArchiveLog
from ..alarm_unified_access.models import AlarmRecord
from .. import db

bp = Blueprint('alarm_archiving', __name__)

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

def create_archive_log(archived_alarm_id, action, status, operator, operator_id, details=None):
    """创建归档日志"""
    log = ArchiveLog(
        archived_alarm_id=archived_alarm_id,
        action=action,
        status=status,
        operator=operator,
        operator_id=operator_id,
        details=details
    )
    db.session.add(log)
    return log

def generate_archive_number():
    """生成归档编号"""
    prefix = datetime.now().strftime('%Y%m%d')
    last_archive = ArchivedAlarm.query.filter(
        ArchivedAlarm.archive_number.like(f'{prefix}%')
    ).order_by(ArchivedAlarm.archive_number.desc()).first()
    
    if last_archive:
        last_number = int(last_archive.archive_number[-4:])
        new_number = str(last_number + 1).zfill(4)
    else:
        new_number = '0001'
    
    return f'{prefix}{new_number}'

@bp.route('/archives', methods=['POST'])
def create_archive():
    """创建新的警情归档记录"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    required_fields = ['alarm_record_id', 'archive_type']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # 检查警情记录是否存在
    alarm = AlarmRecord.query.get(data['alarm_record_id'])
    if not alarm:
        return jsonify({'error': 'Alarm record not found'}), 404
    
    try:
        archive = ArchivedAlarm(
            alarm_record_id=data['alarm_record_id'],
            archive_number=generate_archive_number(),
            archive_type=data['archive_type'],
            archive_status='pending',
            archive_reason=data.get('archive_reason')
        )
        db.session.add(archive)
        db.session.commit()
        
        # 创建归档日志
        create_archive_log(
            archive.id,
            'create',
            'pending',
            data.get('operator', 'system'),
            data.get('operator_id', 0),
            '创建警情归档记录'
        )
        db.session.commit()
        
        return jsonify(archive.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/archives/<int:archive_id>', methods=['GET'])
def get_archive(archive_id):
    """获取特定警情归档记录"""
    archive = ArchivedAlarm.query.get(archive_id)
    if archive:
        return jsonify(archive.to_dict()), 200
    return jsonify({'error': 'Archive record not found'}), 404

@bp.route('/archives/<int:archive_id>/status', methods=['PUT'])
def update_archive_status(archive_id):
    """更新警情归档状态"""
    archive = ArchivedAlarm.query.get(archive_id)
    if not archive:
        return jsonify({'error': 'Archive record not found'}), 404
    
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    try:
        old_status = archive.archive_status
        archive.archive_status = data['status']
        
        # 根据状态更新相应的时间字段
        now = datetime.utcnow()
        if data['status'] == 'archived':
            archive.archive_time = now
            archive.archive_operator = data.get('operator')
            archive.archive_operator_id = data.get('operator_id')
        elif data['status'] == 'returned':
            archive.return_time = now
            archive.return_reason = data.get('return_reason')
            archive.return_operator = data.get('operator')
            archive.return_operator_id = data.get('operator_id')
        
        # 创建状态更新日志
        create_archive_log(
            archive.id,
            'update',
            data['status'],
            data.get('operator', 'system'),
            data.get('operator_id', 0),
            f'状态从 {old_status} 更新为 {data["status"]}'
        )
        
        db.session.commit()
        return jsonify(archive.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/archives/<int:archive_id>/files', methods=['POST'])
def upload_archive_file(archive_id):
    """上传归档文件"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    archive = ArchivedAlarm.query.get(archive_id)
    if not archive:
        return jsonify({'error': 'Archive record not found'}), 404
    
    try:
        # 创建上传目录
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'archives', str(archive_id))
        os.makedirs(upload_dir, exist_ok=True)
        
        # 保存文件
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # 获取文件信息
        file_size = os.path.getsize(file_path)
        file_type = get_file_type(filename)
        mime_type = file.content_type
        
        # 创建归档文件记录
        archive_file = ArchiveFile(
            archived_alarm_id=archive_id,
            file_path=file_path,
            file_name=filename,
            file_size=file_size,
            file_type=file_type,
            mime_type=mime_type,
            description=request.form.get('description')
        )
        
        db.session.add(archive_file)
        
        # 创建文件上传日志
        create_archive_log(
            archive.id,
            'upload',
            archive.archive_status,
            request.form.get('operator', 'system'),
            request.form.get('operator_id', 0),
            f'上传归档文件：{filename}'
        )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Archive file uploaded successfully',
            'data': archive_file.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error uploading archive file: {str(e)}'}), 500

@bp.route('/archives', methods=['GET'])
def list_archives():
    """获取警情归档记录列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # 构建查询
    query = ArchivedAlarm.query
    
    # 添加过滤条件
    alarm_id = request.args.get('alarm_record_id')
    archive_type = request.args.get('archive_type')
    archive_status = request.args.get('archive_status')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if alarm_id:
        query = query.filter(ArchivedAlarm.alarm_record_id == alarm_id)
    if archive_type:
        query = query.filter(ArchivedAlarm.archive_type == archive_type)
    if archive_status:
        query = query.filter(ArchivedAlarm.archive_status == archive_status)
    if start_date:
        query = query.filter(ArchivedAlarm.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(ArchivedAlarm.created_at <= datetime.fromisoformat(end_date))
    
    # 执行分页查询
    pagination = query.order_by(ArchivedAlarm.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@bp.route('/archives/<int:archive_id>/logs', methods=['GET'])
def get_archive_logs(archive_id):
    """获取警情归档日志"""
    archive = ArchivedAlarm.query.get(archive_id)
    if not archive:
        return jsonify({'error': 'Archive record not found'}), 404
    
    logs = ArchiveLog.query.filter_by(archived_alarm_id=archive_id).order_by(ArchiveLog.created_at.desc()).all()
    return jsonify([log.to_dict() for log in logs]), 200 