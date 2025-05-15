from celery import Celery
from flask import current_app
import requests
import os
from .alarm_unified_access.models import Transcription, db

# 创建 Celery 实例
celery = Celery('alarm_system')

def init_celery(app):
    celery.conf.update(
        broker_url=app.config['CELERY_BROKER_URL'],
        result_backend=app.config['CELERY_RESULT_BACKEND'],
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='Asia/Shanghai',
        enable_utc=True
    )

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

@celery.task
def transcribe_audio(file_path, transcription_id):
    """异步任务：将音频文件转写为文本"""
    try:
        # 获取转写记录
        transcription = Transcription.query.get(transcription_id)
        if not transcription:
            return {'status': 'error', 'message': 'Transcription record not found'}
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            transcription.status = 'failed'
            transcription.error_message = 'Audio file not found'
            db.session.commit()
            return {'status': 'error', 'message': 'Audio file not found'}
        
        # 调用语音识别服务
        api_key = current_app.config['SPEECH_RECOGNITION_API_KEY']
        api_url = current_app.config['SPEECH_RECOGNITION_API_URL']
        
        if not api_key or not api_url:
            transcription.status = 'failed'
            transcription.error_message = 'Speech recognition service not configured'
            db.session.commit()
            return {'status': 'error', 'message': 'Speech recognition service not configured'}
        
        # 准备音频文件
        with open(file_path, 'rb') as audio_file:
            files = {'audio': audio_file}
            headers = {'Authorization': f'Bearer {api_key}'}
            
            # 发送请求到语音识别服务
            response = requests.post(api_url, files=files, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                transcription.text_content = result.get('text', '')
                transcription.status = 'completed'
            else:
                transcription.status = 'failed'
                transcription.error_message = f'API request failed: {response.text}'
        
        db.session.commit()
        return {'status': 'success', 'message': 'Transcription completed'}
        
    except Exception as e:
        if transcription:
            transcription.status = 'failed'
            transcription.error_message = str(e)
            db.session.commit()
        return {'status': 'error', 'message': str(e)} 