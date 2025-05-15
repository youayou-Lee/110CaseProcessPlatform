from flask import Blueprint

bp = Blueprint('alarm_dispatching', __name__)

from . import routes 