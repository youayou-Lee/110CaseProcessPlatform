from datetime import datetime
from .. import db

class ArchivedAlarm(db.Model):
    """警情归档记录"""
    __tablename__ = 'archived_alarms'
    
    id = db.Column(db.Integer, primary_key=True)
    alarm_record_id = db.Column(db.Integer, db.ForeignKey('alarm_records.id'), nullable=False)
    archive_number = db.Column(db.String(50), unique=True, nullable=False)  # 归档编号
    archive_type = db.Column(db.String(20), nullable=False)  # 归档类型：一般、重大、特大
    archive_status = db.Column(db.String(20), nullable=False)  # 归档状态：待归档、已归档、已退回
    archive_time = db.Column(db.DateTime)  # 归档时间
    archive_reason = db.Column(db.Text)  # 归档原因
    archive_operator = db.Column(db.String(50))  # 归档操作人
    archive_operator_id = db.Column(db.Integer)  # 归档操作人ID
    return_time = db.Column(db.DateTime)  # 退回时间
    return_reason = db.Column(db.Text)  # 退回原因
    return_operator = db.Column(db.String(50))  # 退回操作人
    return_operator_id = db.Column(db.Integer)  # 退回操作人ID
    
    # 关联关系
    alarm_record = db.relationship('AlarmRecord', backref=db.backref('archives', lazy='dynamic'))
    archive_files = db.relationship('ArchiveFile', backref='archived_alarm', lazy='dynamic')
    archive_logs = db.relationship('ArchiveLog', backref='archived_alarm', lazy='dynamic')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'alarm_record_id': self.alarm_record_id,
            'archive_number': self.archive_number,
            'archive_type': self.archive_type,
            'archive_status': self.archive_status,
            'archive_time': self.archive_time.isoformat() if self.archive_time else None,
            'archive_reason': self.archive_reason,
            'archive_operator': self.archive_operator,
            'archive_operator_id': self.archive_operator_id,
            'return_time': self.return_time.isoformat() if self.return_time else None,
            'return_reason': self.return_reason,
            'return_operator': self.return_operator,
            'return_operator_id': self.return_operator_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ArchiveFile(db.Model):
    """归档文件"""
    __tablename__ = 'archive_files'
    
    id = db.Column(db.Integer, primary_key=True)
    archived_alarm_id = db.Column(db.Integer, db.ForeignKey('archived_alarms.id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer)  # 文件大小（字节）
    file_type = db.Column(db.String(20))  # 文件类型：image, video, audio, document
    mime_type = db.Column(db.String(100))  # MIME类型
    description = db.Column(db.Text)  # 文件描述
    upload_time = db.Column(db.DateTime, default=datetime.utcnow)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'archived_alarm_id': self.archived_alarm_id,
            'file_path': self.file_path,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'mime_type': self.mime_type,
            'description': self.description,
            'upload_time': self.upload_time.isoformat(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ArchiveLog(db.Model):
    """归档操作日志"""
    __tablename__ = 'archive_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    archived_alarm_id = db.Column(db.Integer, db.ForeignKey('archived_alarms.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # 操作类型：create, archive, return, update
    status = db.Column(db.String(20), nullable=False)  # 操作状态
    operator = db.Column(db.String(50), nullable=False)  # 操作人
    operator_id = db.Column(db.Integer, nullable=False)  # 操作人ID
    details = db.Column(db.Text)  # 操作详情
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'archived_alarm_id': self.archived_alarm_id,
            'action': self.action,
            'status': self.status,
            'operator': self.operator,
            'operator_id': self.operator_id,
            'details': self.details,
            'created_at': self.created_at.isoformat()
        } 