from flask import Blueprint

bp = Blueprint('alarm_archiving', __name__)

from . import routes 