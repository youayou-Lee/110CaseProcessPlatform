from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import func
from .models import StatisticsRecord, StatisticsConfig
from ..alarm_unified_access.models import AlarmRecord
from ..alarm_dispatch_down.models import AlarmDispatch
from ..alarm_dispatching.models import DispatchTask
from ..alarm_handling.models import HandlingRecord
from ..alarm_archiving.models import ArchivedAlarm
from .. import db

bp = Blueprint('statistics', __name__)

def calculate_daily_statistics(date):
    """计算每日统计数据"""
    # 警情统计
    alarm_stats = db.session.query(
        func.count(AlarmRecord.id).label('total_alarms'),
        func.count(AlarmRecord.id).filter(AlarmRecord.alarm_type == 'emergency').label('emergency_alarms'),
        func.count(AlarmRecord.id).filter(AlarmRecord.alarm_type == 'normal').label('normal_alarms'),
        func.avg(AlarmRecord.response_time).label('avg_response_time')
    ).filter(
        func.date(AlarmRecord.created_at) == date
    ).first()
    
    # 派警统计
    dispatch_stats = db.session.query(
        func.count(AlarmDispatch.id).label('total_dispatches'),
        func.count(AlarmDispatch.id).filter(AlarmDispatch.status == 'completed').label('completed_dispatches'),
        func.avg(AlarmDispatch.complete_time - AlarmDispatch.dispatch_time).label('avg_dispatch_time')
    ).filter(
        func.date(AlarmDispatch.created_at) == date
    ).first()
    
    # 处置统计
    handling_stats = db.session.query(
        func.count(HandlingRecord.id).label('total_handlings'),
        func.count(HandlingRecord.id).filter(HandlingRecord.status == 'completed').label('completed_handlings'),
        func.avg(HandlingRecord.completion_time - HandlingRecord.handling_time).label('avg_handling_time')
    ).filter(
        func.date(HandlingRecord.created_at) == date
    ).first()
    
    # 归档统计
    archive_stats = db.session.query(
        func.count(ArchivedAlarm.id).label('total_archives'),
        func.count(ArchivedAlarm.id).filter(ArchivedAlarm.archive_status == 'archived').label('completed_archives')
    ).filter(
        func.date(ArchivedAlarm.created_at) == date
    ).first()
    
    return {
        'date': date.isoformat(),
        'alarm_statistics': {
            'total_alarms': alarm_stats.total_alarms or 0,
            'emergency_alarms': alarm_stats.emergency_alarms or 0,
            'normal_alarms': alarm_stats.normal_alarms or 0,
            'avg_response_time': float(alarm_stats.avg_response_time) if alarm_stats.avg_response_time else 0
        },
        'dispatch_statistics': {
            'total_dispatches': dispatch_stats.total_dispatches or 0,
            'completed_dispatches': dispatch_stats.completed_dispatches or 0,
            'avg_dispatch_time': float(dispatch_stats.avg_dispatch_time) if dispatch_stats.avg_dispatch_time else 0
        },
        'handling_statistics': {
            'total_handlings': handling_stats.total_handlings or 0,
            'completed_handlings': handling_stats.completed_handlings or 0,
            'avg_handling_time': float(handling_stats.avg_handling_time) if handling_stats.avg_handling_time else 0
        },
        'archive_statistics': {
            'total_archives': archive_stats.total_archives or 0,
            'completed_archives': archive_stats.completed_archives or 0
        }
    }

@bp.route('/daily', methods=['GET'])
def get_daily_statistics():
    """获取每日统计数据"""
    date_str = request.args.get('date')
    if not date_str:
        date = datetime.now().date()
    else:
        try:
            date = datetime.fromisoformat(date_str).date()
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    
    # 检查是否已有统计数据
    record = StatisticsRecord.query.filter_by(
        statistics_type='daily',
        statistics_date=date
    ).first()
    
    if record:
        return jsonify(record.statistics_data), 200
    
    # 计算统计数据
    statistics_data = calculate_daily_statistics(date)
    
    # 保存统计数据
    record = StatisticsRecord(
        statistics_type='daily',
        statistics_date=date,
        statistics_data=statistics_data
    )
    db.session.add(record)
    db.session.commit()
    
    return jsonify(statistics_data), 200

@bp.route('/weekly', methods=['GET'])
def get_weekly_statistics():
    """获取每周统计数据"""
    date_str = request.args.get('date')
    if not date_str:
        date = datetime.now().date()
    else:
        try:
            date = datetime.fromisoformat(date_str).date()
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    
    # 计算周的开始和结束日期
    start_date = date - timedelta(days=date.weekday())
    end_date = start_date + timedelta(days=6)
    
    # 获取该周的所有每日统计数据
    daily_records = StatisticsRecord.query.filter(
        StatisticsRecord.statistics_type == 'daily',
        StatisticsRecord.statistics_date >= start_date,
        StatisticsRecord.statistics_date <= end_date
    ).all()
    
    if not daily_records:
        return jsonify({'error': 'No statistics data available for this week'}), 404
    
    # 合并统计数据
    weekly_data = {
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'alarm_statistics': {
            'total_alarms': sum(record.statistics_data['alarm_statistics']['total_alarms'] for record in daily_records),
            'emergency_alarms': sum(record.statistics_data['alarm_statistics']['emergency_alarms'] for record in daily_records),
            'normal_alarms': sum(record.statistics_data['alarm_statistics']['normal_alarms'] for record in daily_records),
            'avg_response_time': sum(record.statistics_data['alarm_statistics']['avg_response_time'] for record in daily_records) / len(daily_records)
        },
        'dispatch_statistics': {
            'total_dispatches': sum(record.statistics_data['dispatch_statistics']['total_dispatches'] for record in daily_records),
            'completed_dispatches': sum(record.statistics_data['dispatch_statistics']['completed_dispatches'] for record in daily_records),
            'avg_dispatch_time': sum(record.statistics_data['dispatch_statistics']['avg_dispatch_time'] for record in daily_records) / len(daily_records)
        },
        'handling_statistics': {
            'total_handlings': sum(record.statistics_data['handling_statistics']['total_handlings'] for record in daily_records),
            'completed_handlings': sum(record.statistics_data['handling_statistics']['completed_handlings'] for record in daily_records),
            'avg_handling_time': sum(record.statistics_data['handling_statistics']['avg_handling_time'] for record in daily_records) / len(daily_records)
        },
        'archive_statistics': {
            'total_archives': sum(record.statistics_data['archive_statistics']['total_archives'] for record in daily_records),
            'completed_archives': sum(record.statistics_data['archive_statistics']['completed_archives'] for record in daily_records)
        }
    }
    
    return jsonify(weekly_data), 200

@bp.route('/monthly', methods=['GET'])
def get_monthly_statistics():
    """获取每月统计数据"""
    date_str = request.args.get('date')
    if not date_str:
        date = datetime.now().date()
    else:
        try:
            date = datetime.fromisoformat(date_str).date()
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    
    # 计算月的开始和结束日期
    start_date = date.replace(day=1)
    if date.month == 12:
        end_date = date.replace(year=date.year + 1, month=1, day=1) - timedelta(days=1)
    else:
        end_date = date.replace(month=date.month + 1, day=1) - timedelta(days=1)
    
    # 获取该月的所有每日统计数据
    daily_records = StatisticsRecord.query.filter(
        StatisticsRecord.statistics_type == 'daily',
        StatisticsRecord.statistics_date >= start_date,
        StatisticsRecord.statistics_date <= end_date
    ).all()
    
    if not daily_records:
        return jsonify({'error': 'No statistics data available for this month'}), 404
    
    # 合并统计数据
    monthly_data = {
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'alarm_statistics': {
            'total_alarms': sum(record.statistics_data['alarm_statistics']['total_alarms'] for record in daily_records),
            'emergency_alarms': sum(record.statistics_data['alarm_statistics']['emergency_alarms'] for record in daily_records),
            'normal_alarms': sum(record.statistics_data['alarm_statistics']['normal_alarms'] for record in daily_records),
            'avg_response_time': sum(record.statistics_data['alarm_statistics']['avg_response_time'] for record in daily_records) / len(daily_records)
        },
        'dispatch_statistics': {
            'total_dispatches': sum(record.statistics_data['dispatch_statistics']['total_dispatches'] for record in daily_records),
            'completed_dispatches': sum(record.statistics_data['dispatch_statistics']['completed_dispatches'] for record in daily_records),
            'avg_dispatch_time': sum(record.statistics_data['dispatch_statistics']['avg_dispatch_time'] for record in daily_records) / len(daily_records)
        },
        'handling_statistics': {
            'total_handlings': sum(record.statistics_data['handling_statistics']['total_handlings'] for record in daily_records),
            'completed_handlings': sum(record.statistics_data['handling_statistics']['completed_handlings'] for record in daily_records),
            'avg_handling_time': sum(record.statistics_data['handling_statistics']['avg_handling_time'] for record in daily_records) / len(daily_records)
        },
        'archive_statistics': {
            'total_archives': sum(record.statistics_data['archive_statistics']['total_archives'] for record in daily_records),
            'completed_archives': sum(record.statistics_data['archive_statistics']['completed_archives'] for record in daily_records)
        }
    }
    
    return jsonify(monthly_data), 200

@bp.route('/configs', methods=['GET'])
def list_statistics_configs():
    """获取统计配置列表"""
    configs = StatisticsConfig.query.all()
    return jsonify([config.to_dict() for config in configs]), 200

@bp.route('/configs', methods=['POST'])
def create_statistics_config():
    """创建统计配置"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    required_fields = ['config_name', 'config_type', 'config_data']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    try:
        config = StatisticsConfig(
            config_name=data['config_name'],
            config_type=data['config_type'],
            config_data=data['config_data'],
            description=data.get('description')
        )
        db.session.add(config)
        db.session.commit()
        
        return jsonify(config.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/configs/<int:config_id>', methods=['PUT'])
def update_statistics_config(config_id):
    """更新统计配置"""
    config = StatisticsConfig.query.get(config_id)
    if not config:
        return jsonify({'error': 'Statistics config not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    try:
        if 'config_name' in data:
            config.config_name = data['config_name']
        if 'config_type' in data:
            config.config_type = data['config_type']
        if 'config_data' in data:
            config.config_data = data['config_data']
        if 'description' in data:
            config.description = data['description']
        
        db.session.commit()
        return jsonify(config.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 