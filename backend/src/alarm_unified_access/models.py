from datetime import datetime
from .. import db

class AlarmRecord(db.Model):
    __tablename__ = 'alarm_records'

    id = db.Column(db.Integer, primary_key=True)
    alarm_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    reporter_name = db.Column(db.String(100))
    reporter_phone = db.Column(db.String(50))
    reporter_type = db.Column(db.String(50)) # e.g., '群众', '单位', '内部上报'
    event_time = db.Column(db.DateTime, nullable=False)
    event_location_address = db.Column(db.String(255), nullable=False)
    event_location_longitude = db.Column(db.Float)
    event_location_latitude = db.Column(db.Float)
    alarm_type = db.Column(db.String(100)) # e.g., '刑事案件/盗窃/入室盗窃'
    brief_summary = db.Column(db.Text, nullable=False)
    emergency_level = db.Column(db.String(50), default='一般') # e.g., '一般', '紧急', '非常紧急'
    status = db.Column(db.String(50), default='待处理') # e.g., '待处理', '处理中', '已派单'

    # Relationships
    associated_media = db.relationship('MediaFile', backref='alarm_record', lazy=True)
    transcription = db.relationship('Transcription', backref='alarm_record', uselist=False, lazy=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<AlarmRecord {self.id} - {self.alarm_type}>'

    def to_dict(self):
        return {
            'id': self.id,
            'alarm_time': self.alarm_time.isoformat() if self.alarm_time else None,
            'reporter_name': self.reporter_name,
            'reporter_phone': self.reporter_phone,
            'reporter_type': self.reporter_type,
            'event_time': self.event_time.isoformat() if self.event_time else None,
            'event_location_address': self.event_location_address,
            'event_location_longitude': self.event_location_longitude,
            'event_location_latitude': self.event_location_latitude,
            'alarm_type': self.alarm_type,
            'brief_summary': self.brief_summary,
            'emergency_level': self.emergency_level,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'associated_media': [media.to_dict() for media in self.associated_media],
            'transcription': self.transcription.to_dict() if self.transcription else None
        }

class MediaFile(db.Model):
    __tablename__ = 'media_files'
    
    id = db.Column(db.Integer, primary_key=True)
    alarm_record_id = db.Column(db.Integer, db.ForeignKey('alarm_records.id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer)  # Size in bytes
    media_type = db.Column(db.String(50))  # 'audio', 'video', 'image'
    duration = db.Column(db.Integer)  # Duration in seconds for audio/video
    mime_type = db.Column(db.String(100))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'alarm_record_id': self.alarm_record_id,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'media_type': self.media_type,
            'duration': self.duration,
            'mime_type': self.mime_type,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

class Transcription(db.Model):
    __tablename__ = 'transcriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    alarm_record_id = db.Column(db.Integer, db.ForeignKey('alarm_records.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='pending')  # 'pending', 'processing', 'completed', 'failed'
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Transcription {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'alarm_record_id': self.alarm_record_id,
            'content': self.content,
            'status': self.status,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }