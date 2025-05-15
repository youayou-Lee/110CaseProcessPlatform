from flask import Blueprint

bp = Blueprint('alarm_dispatch_down', __name__)

from . import routes 