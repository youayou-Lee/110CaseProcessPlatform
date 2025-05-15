from flask import Blueprint

bp = Blueprint('alarm_handling', __name__)

from . import routes 