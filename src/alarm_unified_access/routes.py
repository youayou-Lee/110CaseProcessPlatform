from flask import Blueprint, request, jsonify
from datetime import datetime
from .models import AlarmRecord
from .. import db

bp = Blueprint('alarm_unified_access', __name__)

@bp.route('/', methods=['POST'])
def create_alarm_record():
    """Endpoint to create a new alarm record."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    # Basic validation
    required_fields = ['event_time', 'event_location_address', 'brief_summary'] # Adjusted based on model
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    try:
        # Convert event_time from ISO format string to datetime object
        event_time_str = data.get('event_time')
        if event_time_str:
            event_time_dt = datetime.fromisoformat(event_time_str.replace('Z', '+00:00'))
        else:
            return jsonify({'error': 'event_time is required'}), 400

        new_alarm = AlarmRecord(
            reporter_name=data.get('reporter_name'),
            reporter_phone=data.get('reporter_phone'),
            reporter_type=data.get('reporter_type'),
            event_time=event_time_dt,
            event_location_address=data.get('event_location_address'),
            event_location_longitude=data.get('event_location_longitude'),
            event_location_latitude=data.get('event_location_latitude'),
            alarm_type=data.get('alarm_type'),
            brief_summary=data.get('brief_summary'),
            emergency_level=data.get('emergency_level', '一般'), # Default if not provided
            status=data.get('status', '待处理') # Default if not provided
        )
        db.session.add(new_alarm)
        db.session.commit()
        return jsonify({'message': 'Alarm record created successfully', 'data': new_alarm.to_dict()}), 201
    except ValueError as e:
        # Handle cases like invalid datetime format
        db.session.rollback()
        return jsonify({'error': f'Invalid data format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        # Log the exception e for debugging
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

@bp.route('/<int:alarm_id>', methods=['GET'])
def get_alarm_record(alarm_id):
    """Endpoint to retrieve a specific alarm record."""
    alarm = AlarmRecord.query.get(alarm_id)
    if alarm:
        return jsonify(alarm.to_dict()), 200
    else:
        return jsonify({'error': 'Alarm record not found'}), 404

@bp.route('/<int:alarm_id>/associate_media', methods=['POST'])
def associate_media_to_alarm(alarm_id):
    """Endpoint to associate media (audio/video) with an alarm record."""
    # TODO: Handle file uploads (audio/video)
    # TODO: Link media to the alarm_id in the database
    return jsonify({'message': f'Media association for alarm ID {alarm_id} (placeholder)'}), 200

@bp.route('/<int:alarm_id>/transcribe_audio', methods=['POST'])
def transcribe_audio_for_alarm(alarm_id):
    """Endpoint to trigger audio transcription for an alarm's recording."""
    # TODO: Integrate with a speech-to-text engine
    # TODO: Store/update transcription text for the alarm_id
    return jsonify({'message': f'Audio transcription for alarm ID {alarm_id} (placeholder)'}), 200

@bp.route('/<int:alarm_id>/generate_draft', methods=['POST'])
def generate_alarm_draft(alarm_id):
    """Endpoint to assist in generating a draft alarm report."""
    # TODO: Implement logic to extract info and generate draft text
    return jsonify({'message': f'Draft generation for alarm ID {alarm_id} (placeholder)'}), 200

# Add other routes as needed based on PRD for this module