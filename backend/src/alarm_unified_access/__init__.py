from flask import Blueprint

bp = Blueprint('alarm_unified_access', __name__)

from . import routes 