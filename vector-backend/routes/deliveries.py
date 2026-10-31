from flask import Blueprint, request, jsonify
from app import db
from models import Delivery, ReliefRequest
from utils import roles_required, current_user_id, log_activity

deliveries_bp = Blueprint("deliveries", __name__)
VALID_STATUSES = {"assigned", "in_transit", "delivered", "cancelled"}

def delivery_json(item):
    return {
        "id": item.id, "request_id": item.request_id,
        "assigned_to": item.assigned_to, "status": item.status,
        "notes": item.notes, "created_at": item.created_at.isoformat()
    }

@deliveries_bp.get("")
@roles_required("admin", "operator")
def list_deliveries():
    items = Delivery.query.order_by(Delivery.created_at.desc()).all()
    return jsonify([delivery_json(x) for x in items])

@deliveries_bp.post("")
@roles_required("admin", "operator")
def create_delivery():
    data = request.get_json(silent=True) or {}
    try:
        request_id = int(data.get("request_id", 0))
    except (TypeError, ValueError):
        request_id = 0
    assigned_to = str(data.get("assigned_to", "")).strip()
    relief_request = db.session.get(ReliefRequest, request_id)
    if not relief_request or not assigned_to:
        return jsonify({"error": "A valid request_id and assigned_to are required"}), 400
    if relief_request.status not in ("approved", "fulfilled"):
        return jsonify({"error": "Only approved requests can be assigned for delivery"}), 409

    item = Delivery(
        request_id=request_id, assigned_to=assigned_to,
        notes=str(data.get("notes", "")).strip()
    )
    db.session.add(item)
    log_activity(current_user_id(), f"Created delivery for request #{request_id}")
    db.session.commit()
    return jsonify(delivery_json(item)), 201

@deliveries_bp.patch("/<int:delivery_id>/status")
@roles_required("admin", "operator")
def update_delivery_status(delivery_id):
    item = db.session.get(Delivery, delivery_id)
    if not item:
        return jsonify({"error": "Delivery not found"}), 404
    status = str((request.get_json(silent=True) or {}).get("status", "")).lower()
    if status not in VALID_STATUSES:
        return jsonify({"error": f"Status must be one of: {', '.join(sorted(VALID_STATUSES))}"}), 400
    item.status = status
    if status == "delivered":
        item.request.status = "fulfilled"
    log_activity(current_user_id(), f"Updated delivery #{delivery_id} to {status}")
    db.session.commit()
    return jsonify(delivery_json(item))
