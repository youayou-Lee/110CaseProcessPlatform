from .. import db
from datetime import datetime

class DispatchUnit(db.Model):
    """下发单位模型"""
    __tablename__ = 'dispatch_units'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False)
    level = db.Column(db.String(50), nullable=False)  # '支队', '大队', '工作站'
    parent_id = db.Column(db.Integer, db.ForeignKey('dispatch_units.id'))
    status = db.Column(db.String(50), default='active')  # 'active', 'inactive'
    
    # 关系
    parent = db.relationship('DispatchUnit', remote_side=[id], backref='children')
    dispatches = db.relationship('AlarmDispatch', backref='unit', lazy=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'level': self.level,
            'parent_id': self.parent_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class AlarmDispatch(db.Model):
    """警情下发记录模型"""
    __tablename__ = 'alarm_dispatches'
    
    id = db.Column(db.Integer, primary_key=True)
    alarm_record_id = db.Column(db.Integer, db.ForeignKey('alarm_records.id'), nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey('dispatch_units.id'), nullable=False)
    status = db.Column(db.String(50), default='pending')  # 'pending', 'sent', 'received', 'processing', 'completed'
    dispatch_time = db.Column(db.DateTime, default=datetime.utcnow)
    receive_time = db.Column(db.DateTime)
    complete_time = db.Column(db.DateTime)
    feedback = db.Column(db.Text)
    feedback_time = db.Column(db.DateTime)
    
    # 关系
    alarm_record = db.relationship('AlarmRecord', backref='dispatches')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'alarm_record_id': self.alarm_record_id,
            'unit_id': self.unit_id,
            'status': self.status,
            'dispatch_time': self.dispatch_time.isoformat() if self.dispatch_time else None,
            'receive_time': self.receive_time.isoformat() if self.receive_time else None,
            'complete_time': self.complete_time.isoformat() if self.complete_time else None,
            'feedback': self.feedback,
            'feedback_time': self.feedback_time.isoformat() if self.feedback_time else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'unit': self.unit.to_dict() if self.unit else None
        }

class DispatchLog(db.Model):
    """下发日志模型"""
    __tablename__ = 'dispatch_logs'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    dispatch_id = db.Column(db.Integer, db.ForeignKey('alarm_dispatches.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # 'create', 'update', 'receive', 'complete', 'feedback'
    status = db.Column(db.String(50), nullable=False)
    operator = db.Column(db.String(100), nullable=False)
    operator_id = db.Column(db.Integer, nullable=False)
    details = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'dispatch_id': self.dispatch_id,
            'action': self.action,
            'status': self.status,
            'operator': self.operator,
            'operator_id': self.operator_id,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
