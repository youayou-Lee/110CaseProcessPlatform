import os
from src import create_app, db
from dotenv import load_dotenv

# Load environment variables from .env file
# This ensures that FLASK_APP and FLASK_ENV are set when running 'flask run'
# or when this script is executed directly.
load_dotenv()

# Determine the configuration to use (dev, test, prod)
# Defaults to 'dev' if FLASK_ENV is not set or not 'production'
config_name = os.getenv('FLASK_ENV', 'dev')
if config_name == 'production':
    app_config_name = 'config.ProductionConfig'
elif config_name == 'testing':
    app_config_name = 'config.TestingConfig'
else:
    app_config_name = 'config.DevelopmentConfig'

app = create_app(app_config_name)

@app.shell_context_processor
def make_shell_context():
    """Allows access to app and db in Flask shell."""
    return {'app': app, 'db': db}

if __name__ == '__main__':
    # Note: For development, it's often better to use 'flask run' command
    # as it provides a more robust development server with auto-reloading.
    # This direct run is provided as an alternative or for specific use cases.
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)))