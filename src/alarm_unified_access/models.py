from .. import db
from datetime import datetime

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
    # associated_media = db.relationship('MediaFile', backref='alarm_record', lazy=True)
    # transcription = db.relationship('Transcription', backref='alarm_record', uselist=False, lazy=True)

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
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Example for associated media, can be expanded
# class MediaFile(db.Model):
#     __tablename__ = 'media_files'
#     id = db.Column(db.Integer, primary_key=True)
#     alarm_record_id = db.Column(db.Integer, db.ForeignKey('alarm_records.id'), nullable=False)
#     file_path = db.Column(db.String(255), nullable=False)
#     media_type = db.Column(db.String(50)) # 'audio', 'video', 'image'
#     uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

# Example for transcription
# class Transcription(db.Model):
#     __tablename__ = 'transcriptions'
#     id = db.Column(db.Integer, primary_key=True)
#     alarm_record_id = db.Column(db.Integer, db.ForeignKey('alarm_records.id'), nullable=False, unique=True)
#     text_content = db.Column(db.Text)
#     status = db.Column(db.String(50)) # 'pending', 'processing', 'completed', 'failed'
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
#     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)