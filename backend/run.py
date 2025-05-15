import os
from dotenv import load_dotenv
from src import create_app, db
from config.config import config
from flask_migrate import Migrate, upgrade

# Load environment variables from .env file
# This ensures that FLASK_APP and FLASK_ENV are set when running 'flask run'
# or when this script is executed directly.
load_dotenv()

# Determine the configuration to use (dev, test, prod)
# Defaults to 'dev' if FLASK_ENV is not set or not 'production'
config_name = os.getenv('FLASK_ENV', 'development')
config_class = config[config_name]

# 创建应用实例
app = create_app(config_class)
migrate = Migrate(app, db)

@app.shell_context_processor
def make_shell_context():
    """为 Flask shell 添加上下文"""
    return {
        'db': db,
        'app': app
    }

@app.cli.command('init-db')
def init_db():
    """初始化数据库"""
    db.create_all()
    print('数据库表已创建')

@app.cli.command('migrate-db')
def migrate_db():
    """执行数据库迁移"""
    upgrade()
    print('数据库迁移已完成')

if __name__ == '__main__':
    # 确保上传目录存在
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # 启动应用
    app.run(
        host=os.environ.get('FLASK_HOST', '0.0.0.0'),
        port=int(os.environ.get('FLASK_PORT', 3001)),
        debug=app.config['DEBUG']
    )