from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class_name='config.DevelopmentConfig'):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class_name)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Register Blueprints (example)
    # from .alarm_unified_access import bp as alarm_unified_access_bp
    # app.register_blueprint(alarm_unified_access_bp, url_prefix='/api/alarm_access')

    # from .alarm_log_ledger import bp as alarm_log_ledger_bp
    # app.register_blueprint(alarm_log_ledger_bp, url_prefix='/api/log_ledger')

    # ... register other blueprints ...

    @app.route('/health')
    def health_check():
        return 'OK', 200

    return app