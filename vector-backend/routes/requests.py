from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from models import ReliefRequest
from utils import roles_required, current_user_id, log_activity

requests_bp = Blueprint("requests", __name__)
VALID_STATUSES = {"pending", "approved", "rejected", "fulfilled"}

def request_json(item):
    return {
        "id": item.id, "requester_id": item.requester_id,
        "requester_name": item.requester.name,
        "resource_name": item.resource_name, "quantity": item.quantity,
        "location": item.location, "description": item.description,
        "status": item.status, "created_at": item.created_at.isoformat()
    }

@requests_bp.post("")
@jwt_required()
def create_request():
    data = request.get_json(silent=True) or {}
    resource_name = str(data.get("resource_name", "")).strip()
    location = str(data.get("location", "")).strip()
    description = str(data.get("description", "")).strip()
    try:
        quantity = int(data.get("quantity", 0))
    except (TypeError, ValueError):
        quantity = 0
    if not resource_name or not location or quantity <= 0:
        return jsonify({"error": "Resource name, location and a positive quantity are required"}), 400

    item = ReliefRequest(
        requester_id=current_user_id(), resource_name=resource_name,
        quantity=quantity, location=location, description=description
    )
    db.session.add(item)
    log_activity(current_user_id(), "Created a relief request")
    db.session.commit()
    return jsonify(request_json(item)), 201

@requests_bp.get("")
@jwt_required()
def list_requests():
    from flask_jwt_extended import get_jwt
    role = get_jwt().get("role")
    query = ReliefRequest.query
    if role not in ("admin", "operator"):
        query = query.filter_by(requester_id=current_user_id())
    items = query.order_by(ReliefRequest.created_at.desc()).all()
    return jsonify([request_json(x) for x in items])

@requests_bp.patch("/<int:request_id>/status")
@roles_required("admin", "operator")
def update_request_status(request_id):
    item = db.session.get(ReliefRequest, request_id)
    if not item:
        return jsonify({"error": "Request not found"}), 404
    status = str((request.get_json(silent=True) or {}).get("status", "")).lower()
    if status not in VALID_STATUSES:
        return jsonify({"error": f"Status must be one of: {', '.join(sorted(VALID_STATUSES))}"}), 400
    item.status = status
    log_activity(current_user_id(), f"Changed request #{request_id} status to {status}")
    db.session.commit()
    return jsonify(request_json(item))
