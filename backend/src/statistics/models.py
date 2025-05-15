from datetime import datetime
from .. import db

class StatisticsRecord(db.Model):
    """统计数据记录"""
    __tablename__ = 'statistics_records'
    
    id = db.Column(db.Integer, primary_key=True)
    statistics_type = db.Column(db.String(50), nullable=False)  # 统计类型：daily, weekly, monthly
    statistics_date = db.Column(db.Date, nullable=False)  # 统计日期
    statistics_data = db.Column(db.JSON, nullable=False)  # 统计数据（JSON格式）
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'statistics_type': self.statistics_type,
            'statistics_date': self.statistics_date.isoformat(),
            'statistics_data': self.statistics_data,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class StatisticsConfig(db.Model):
    """统计配置"""
    __tablename__ = 'statistics_configs'
    
    id = db.Column(db.Integer, primary_key=True)
    config_name = db.Column(db.String(50), unique=True, nullable=False)  # 配置名称
    config_type = db.Column(db.String(50), nullable=False)  # 配置类型
    config_data = db.Column(db.JSON, nullable=False)  # 配置数据（JSON格式）
    description = db.Column(db.Text)  # 配置描述
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'config_name': self.config_name,
            'config_type': self.config_type,
            'config_data': self.config_data,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 