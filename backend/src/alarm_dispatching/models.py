from .. import db
from datetime import datetime
from ..alarm_dispatch_down.models import DispatchLog

class PoliceOfficer(db.Model):
    """警员信息模型"""
    __tablename__ = 'police_officers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    badge_number = db.Column(db.String(50), unique=True, nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey('dispatch_units.id'), nullable=False)
    position = db.Column(db.String(100))  # 职位
    rank = db.Column(db.String(50))  # 警衔
    skills = db.Column(db.String(500))  # 技能特长，JSON格式存储
    status = db.Column(db.String(50), default='available')  # 'available', 'on_duty', 'off_duty', 'on_leave'
    current_location = db.Column(db.String(255))  # 当前位置
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    last_location_update = db.Column(db.DateTime)
    
    # 关系
    unit = db.relationship('DispatchUnit', backref='officers')
    dispatch_tasks = db.relationship('DispatchTask', backref='officer', lazy=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'badge_number': self.badge_number,
            'unit_id': self.unit_id,
            'position': self.position,
            'rank': self.rank,
            'skills': self.skills,
            'status': self.status,
            'current_location': self.current_location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'last_location_update': self.last_location_update.isoformat() if self.last_location_update else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class DispatchTask(db.Model):
    """派警任务模型"""
    __tablename__ = 'dispatch_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    alarm_record_id = db.Column(db.Integer, db.ForeignKey('alarm_records.id'), nullable=False)
    officer_id = db.Column(db.Integer, db.ForeignKey('police_officers.id'), nullable=False)
    status = db.Column(db.String(50), default='pending')  # 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
    priority = db.Column(db.String(50), default='normal')  # 'low', 'normal', 'high', 'urgent'
    assigned_time = db.Column(db.DateTime, default=datetime.utcnow)
    accepted_time = db.Column(db.DateTime)
    start_time = db.Column(db.DateTime)
    complete_time = db.Column(db.DateTime)
    cancel_time = db.Column(db.DateTime)
    cancel_reason = db.Column(db.Text)
    feedback = db.Column(db.Text)
    
    # 关系
    alarm_record = db.relationship('AlarmRecord', backref='dispatch_tasks')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'alarm_record_id': self.alarm_record_id,
            'officer_id': self.officer_id,
            'status': self.status,
            'priority': self.priority,
            'assigned_time': self.assigned_time.isoformat() if self.assigned_time else None,
            'accepted_time': self.accepted_time.isoformat() if self.accepted_time else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'complete_time': self.complete_time.isoformat() if self.complete_time else None,
            'cancel_time': self.cancel_time.isoformat() if self.cancel_time else None,
            'cancel_reason': self.cancel_reason,
            'feedback': self.feedback,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'officer': self.officer.to_dict() if self.officer else None
        }

class DispatchGroup(db.Model):
    """派警任务组模型"""
    __tablename__ = 'dispatch_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    alarm_record_id = db.Column(db.Integer, db.ForeignKey('alarm_records.id'), nullable=False)
    name = db.Column(db.String(100))
    leader_id = db.Column(db.Integer, db.ForeignKey('police_officers.id'))
    status = db.Column(db.String(50), default='pending')  # 'pending', 'in_progress', 'completed', 'cancelled'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    alarm_record = db.relationship('AlarmRecord', backref='dispatch_groups')
    leader = db.relationship('PoliceOfficer', foreign_keys=[leader_id])
    members = db.relationship('DispatchGroupMember', backref='group', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'alarm_record_id': self.alarm_record_id,
            'name': self.name,
            'leader_id': self.leader_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'leader': self.leader.to_dict() if self.leader else None,
            'members': [member.to_dict() for member in self.members]
        }

class DispatchGroupMember(db.Model):
    """派警任务组成员模型"""
    __tablename__ = 'dispatch_group_members'
    
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('dispatch_groups.id'), nullable=False)
    officer_id = db.Column(db.Integer, db.ForeignKey('police_officers.id'), nullable=False)
    role = db.Column(db.String(50))  # 'leader', 'member', 'support'
    status = db.Column(db.String(50), default='pending')  # 'pending', 'accepted', 'in_progress', 'completed'
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    officer = db.relationship('PoliceOfficer')
    
    def to_dict(self):
        return {
            'id': self.id,
            'group_id': self.group_id,
            'officer_id': self.officer_id,
            'role': self.role,
            'status': self.status,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'officer': self.officer.to_dict() if self.officer else None
        }

class DispatchingRecord(db.Model):
    __tablename__ = 'dispatching_records'

    id = db.Column(db.Integer, primary_key=True)
    alarm_record_id = db.Column(db.Integer, db.ForeignKey('alarm_records.id'), nullable=False)
    dispatch_unit_id = db.Column(db.Integer, db.ForeignKey('dispatch_units.id'), nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, in_progress, completed, cancelled
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    alarm_record = db.relationship('AlarmRecord', backref='dispatching_records')
    dispatch_unit = db.relationship('DispatchUnit', backref='dispatching_records')

    def __repr__(self):
        return f'<DispatchingRecord {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'alarm_record_id': self.alarm_record_id,
            'dispatch_unit_id': self.dispatch_unit_id,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'alarm_record': self.alarm_record.to_dict() if self.alarm_record else None,
            'dispatch_unit': self.dispatch_unit.to_dict() if self.dispatch_unit else None
        }
