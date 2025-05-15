from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config
from flask_cors import CORS
from sqlalchemy.schema import MetaData

# 创建扩展实例
db = SQLAlchemy(metadata=MetaData(naming_convention={
    "ix": 'ix_%(column_0_label)s',
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}))
migrate = Migrate()

def create_app(config_class):
    app = Flask(__name__)
    
    # 加载配置
    app.config.from_object(config_class)
    
    # 初始化扩展
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # 注册蓝图
    from .alarm_unified_access import bp as alarm_unified_access_bp
    app.register_blueprint(alarm_unified_access_bp, url_prefix='/api/alarm')
    
    from .alarm_dispatch_down import bp as alarm_dispatch_down_bp
    app.register_blueprint(alarm_dispatch_down_bp, url_prefix='/api/dispatch')
    
    from .alarm_dispatching import bp as alarm_dispatching_bp
    app.register_blueprint(alarm_dispatching_bp, url_prefix='/api/dispatching')
    
    from .alarm_handling import bp as alarm_handling_bp
    app.register_blueprint(alarm_handling_bp, url_prefix='/api/handling')
    
    from .alarm_archiving import bp as alarm_archiving_bp
    app.register_blueprint(alarm_archiving_bp, url_prefix='/api/archiving')
    
    from .statistics import bp as statistics_bp
    app.register_blueprint(statistics_bp, url_prefix='/api/statistics')
    
    # 初始化Celery
    from .tasks import init_celery
    init_celery(app)
    
    # 注册错误处理
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    return app