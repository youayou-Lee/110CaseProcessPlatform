from .. import db
from datetime import datetime

class HandlingRecord(db.Model):
    """警情处理记录模型"""
    __tablename__ = 'handling_records'
    
    id = db.Column(db.Integer, primary_key=True)
    alarm_record_id = db.Column(db.Integer, db.ForeignKey('alarm_records.id'), nullable=False)
    handler_id = db.Column(db.Integer, db.ForeignKey('police_officers.id'), nullable=False)
    status = db.Column(db.String(50), default='pending')  # 'pending', 'in_progress', 'completed', 'cancelled'
    start_time = db.Column(db.DateTime)
    complete_time = db.Column(db.DateTime)
    handling_result = db.Column(db.Text)
    handling_method = db.Column(db.String(255))
    location = db.Column(db.String(255))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # 关系
    alarm_record = db.relationship('AlarmRecord', backref='handling_records')
    handler = db.relationship('PoliceOfficer', backref='handling_records')
    evidence_files = db.relationship('EvidenceFile', backref='handling_record', lazy=True)
    handling_logs = db.relationship('HandlingLog', backref='handling_record', lazy=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'alarm_record_id': self.alarm_record_id,
            'handler_id': self.handler_id,
            'status': self.status,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'complete_time': self.complete_time.isoformat() if self.complete_time else None,
            'handling_result': self.handling_result,
            'handling_method': self.handling_method,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'handler': self.handler.to_dict() if self.handler else None,
            'evidence_files': [file.to_dict() for file in self.evidence_files],
            'handling_logs': [log.to_dict() for log in self.handling_logs]
        }

class EvidenceFile(db.Model):
    """证据文件模型"""
    __tablename__ = 'evidence_files'
    
    id = db.Column(db.Integer, primary_key=True)
    handling_record_id = db.Column(db.Integer, db.ForeignKey('handling_records.id'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(512), nullable=False)
    file_type = db.Column(db.String(50))  # 'image', 'video', 'audio', 'document'
    file_size = db.Column(db.Integer)  # 文件大小（字节）
    description = db.Column(db.Text)
    upload_time = db.Column(db.DateTime, default=datetime.utcnow)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'handling_record_id': self.handling_record_id,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'description': self.description,
            'upload_time': self.upload_time.isoformat() if self.upload_time else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class HandlingLog(db.Model):
    """处理日志模型"""
    __tablename__ = 'handling_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    handling_record_id = db.Column(db.Integer, db.ForeignKey('handling_records.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # 'create', 'update', 'start', 'complete', 'cancel'
    status = db.Column(db.String(50), nullable=False)
    operator = db.Column(db.String(100), nullable=False)
    operator_id = db.Column(db.Integer, nullable=False)
    details = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'handling_record_id': self.handling_record_id,
            'action': self.action,
            'status': self.status,
            'operator': self.operator,
            'operator_id': self.operator_id,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 