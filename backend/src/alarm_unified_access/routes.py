from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from .models import AlarmRecord, MediaFile, Transcription
from .. import db
import mimetypes
import subprocess
import json

bp = Blueprint('alarm_unified_access', __name__)

def allowed_file(filename):
    """检查文件类型是否允许上传"""
    ALLOWED_EXTENSIONS = {'mp3', 'wav', 'mp4', 'avi', 'jpg', 'jpeg', 'png'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_media_type(filename):
    """根据文件扩展名判断媒体类型"""
    ext = filename.rsplit('.', 1)[1].lower()
    if ext in {'mp3', 'wav'}:
        return 'audio'
    elif ext in {'mp4', 'avi'}:
        return 'video'
    elif ext in {'jpg', 'jpeg', 'png'}:
        return 'image'
    return 'unknown'

def get_file_duration(file_path):
    """获取音频/视频文件的时长（秒）"""
    try:
        cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', 
               '-of', 'json', file_path]
        result = subprocess.run(cmd, capture_output=True, text=True)
        data = json.loads(result.stdout)
        return int(float(data['format']['duration']))
    except Exception as e:
        current_app.logger.error(f"Error getting file duration: {str(e)}")
        return None

@bp.route('/', methods=['POST'])
def create_alarm_record():
    """创建新的警情记录"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    # Basic validation
    required_fields = ['event_time', 'event_location_address', 'brief_summary']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    try:
        # Convert event_time from ISO format string to datetime object
        event_time_str = data.get('event_time')
        if event_time_str:
            event_time_dt = datetime.fromisoformat(event_time_str.replace('Z', '+00:00'))
        else:
            return jsonify({'error': 'event_time is required'}), 400

        new_alarm = AlarmRecord(
            reporter_name=data.get('reporter_name'),
            reporter_phone=data.get('reporter_phone'),
            reporter_type=data.get('reporter_type'),
            event_time=event_time_dt,
            event_location_address=data.get('event_location_address'),
            event_location_longitude=data.get('event_location_longitude'),
            event_location_latitude=data.get('event_location_latitude'),
            alarm_type=data.get('alarm_type'),
            brief_summary=data.get('brief_summary'),
            emergency_level=data.get('emergency_level', '一般'),
            status=data.get('status', '待处理')
        )
        db.session.add(new_alarm)
        db.session.commit()
        return jsonify({'message': 'Alarm record created successfully', 'data': new_alarm.to_dict()}), 201
    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': f'Invalid data format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

@bp.route('/<int:alarm_id>', methods=['GET'])
def get_alarm_record(alarm_id):
    """获取特定警情记录"""
    alarm = AlarmRecord.query.get(alarm_id)
    if alarm:
        return jsonify(alarm.to_dict()), 200
    else:
        return jsonify({'error': 'Alarm record not found'}), 404

@bp.route('/<int:alarm_id>/associate_media', methods=['POST'])
def associate_media_to_alarm(alarm_id):
    """关联媒体文件到警情记录"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    alarm = AlarmRecord.query.get(alarm_id)
    if not alarm:
        return jsonify({'error': 'Alarm record not found'}), 404
    
    try:
        # 创建上传目录
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], str(alarm_id))
        os.makedirs(upload_dir, exist_ok=True)
        
        # 保存文件
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # 获取文件信息
        file_size = os.path.getsize(file_path)
        media_type = get_media_type(filename)
        mime_type = mimetypes.guess_type(filename)[0]
        duration = get_file_duration(file_path) if media_type in ['audio', 'video'] else None
        
        # 创建媒体文件记录
        media_file = MediaFile(
            alarm_record_id=alarm_id,
            file_path=file_path,
            file_name=filename,
            file_size=file_size,
            media_type=media_type,
            duration=duration,
            mime_type=mime_type
        )
        
        db.session.add(media_file)
        db.session.commit()
        
        return jsonify({
            'message': 'Media file associated successfully',
            'data': media_file.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error associating media file: {str(e)}'}), 500

@bp.route('/<int:alarm_id>/transcribe_audio', methods=['POST'])
def transcribe_audio_for_alarm(alarm_id):
    """为警情录音进行语音转写"""
    alarm = AlarmRecord.query.get(alarm_id)
    if not alarm:
        return jsonify({'error': 'Alarm record not found'}), 404
    
    # 查找关联的音频文件
    audio_files = [m for m in alarm.associated_media if m.media_type == 'audio']
    if not audio_files:
        return jsonify({'error': 'No audio files found for this alarm'}), 404
    
    try:
        # 创建或更新转写记录
        transcription = Transcription.query.filter_by(alarm_record_id=alarm_id).first()
        if not transcription:
            transcription = Transcription(alarm_record_id=alarm_id)
        
        transcription.status = 'processing'
        db.session.add(transcription)
        db.session.commit()
        
        # TODO: 调用语音识别服务
        # 这里应该异步处理，使用Celery等任务队列
        # 示例代码：
        # task = transcribe_audio.delay(audio_files[0].file_path, transcription.id)
        
        return jsonify({
            'message': 'Audio transcription started',
            'data': transcription.to_dict()
        }), 202
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error starting transcription: {str(e)}'}), 500

@bp.route('/<int:alarm_id>/generate_draft', methods=['POST'])
def generate_alarm_draft(alarm_id):
    """生成警情初稿"""
    alarm = AlarmRecord.query.get(alarm_id)
    if not alarm:
        return jsonify({'error': 'Alarm record not found'}), 404
    
    try:
        # 获取转写文本
        transcription_text = ""
        if alarm.transcription and alarm.transcription.status == 'completed':
            transcription_text = alarm.transcription.text_content
        
        # TODO: 调用智能提取模块生成初稿
        # 这里应该调用NLP服务或其他智能服务
        draft_text = f"""
        警情编号：{alarm.id}
        报警时间：{alarm.alarm_time.strftime('%Y-%m-%d %H:%M:%S')}
        报警人：{alarm.reporter_name or '匿名'}
        联系电话：{alarm.reporter_phone or '未提供'}
        事发时间：{alarm.event_time.strftime('%Y-%m-%d %H:%M:%S')}
        事发地点：{alarm.event_location_address}
        警情类型：{alarm.alarm_type}
        紧急程度：{alarm.emergency_level}
        
        警情描述：
        {alarm.brief_summary}
        
        录音转写内容：
        {transcription_text}
        """
        
        return jsonify({
            'message': 'Draft generated successfully',
            'data': {
                'draft_text': draft_text
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error generating draft: {str(e)}'}), 500

@bp.route('/', methods=['GET'])
def list_alarm_records():
    """获取警情记录列表，支持分页和过滤"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # 构建查询
    query = AlarmRecord.query
    
    # 添加过滤条件
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    alarm_type = request.args.get('alarm_type')
    emergency_level = request.args.get('emergency_level')
    status = request.args.get('status')
    
    if start_date:
        query = query.filter(AlarmRecord.alarm_time >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(AlarmRecord.alarm_time <= datetime.fromisoformat(end_date))
    if alarm_type:
        query = query.filter(AlarmRecord.alarm_type == alarm_type)
    if emergency_level:
        query = query.filter(AlarmRecord.emergency_level == emergency_level)
    if status:
        query = query.filter(AlarmRecord.status == status)
    
    # 执行分页查询
    pagination = query.order_by(AlarmRecord.alarm_time.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

# Add other routes as needed based on PRD for this module