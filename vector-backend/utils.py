from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app import db
from models import ActivityLog

def current_user_id():
    return int(get_jwt_identity())

def roles_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") not in roles:
                return jsonify({"error": "You do not have permission for this action"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def log_activity(user_id, action):
    db.session.add(ActivityLog(user_id=user_id, action=action))
