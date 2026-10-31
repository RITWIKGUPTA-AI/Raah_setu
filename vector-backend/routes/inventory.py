from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from models import Resource
from utils import roles_required, current_user_id, log_activity

inventory_bp = Blueprint("inventory", __name__)

def resource_json(item):
    return {
        "id": item.id, "name": item.name, "category": item.category,
        "quantity": item.quantity, "unit": item.unit, "location": item.location
    }

@inventory_bp.get("")
def list_resources():
    items = Resource.query.order_by(Resource.name.asc()).all()
    return jsonify([resource_json(x) for x in items])

@inventory_bp.post("")
@roles_required("admin", "operator")
def add_resource():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    location = str(data.get("location", "")).strip()
    try:
        quantity = int(data.get("quantity", -1))
    except (TypeError, ValueError):
        quantity = -1
    if not name or not location or quantity < 0:
        return jsonify({"error": "Name, location and a non-negative quantity are required"}), 400

    item = Resource(
        name=name, category=str(data.get("category", "general")),
        quantity=quantity, unit=str(data.get("unit", "units")),
        location=location
    )
    db.session.add(item)
    log_activity(current_user_id(), f"Added resource: {name}")
    db.session.commit()
    return jsonify(resource_json(item)), 201

@inventory_bp.put("/<int:resource_id>")
@roles_required("admin", "operator")
def update_resource(resource_id):
    item = db.session.get(Resource, resource_id)
    if not item:
        return jsonify({"error": "Resource not found"}), 404
    data = request.get_json(silent=True) or {}
    if "name" in data:
        item.name = str(data["name"]).strip()
    if "category" in data:
        item.category = str(data["category"]).strip()
    if "location" in data:
        item.location = str(data["location"]).strip()
    if "unit" in data:
        item.unit = str(data["unit"]).strip()
    if "quantity" in data:
        try:
            quantity = int(data["quantity"])
        except (TypeError, ValueError):
            return jsonify({"error": "Quantity must be a whole number"}), 400
        if quantity < 0:
            return jsonify({"error": "Quantity cannot be negative"}), 400
        item.quantity = quantity
    log_activity(current_user_id(), f"Updated resource #{resource_id}")
    db.session.commit()
    return jsonify(resource_json(item))

@inventory_bp.delete("/<int:resource_id>")
@roles_required("admin")
def delete_resource(resource_id):
    item = db.session.get(Resource, resource_id)
    if not item:
        return jsonify({"error": "Resource not found"}), 404
    log_activity(current_user_id(), f"Deleted resource #{resource_id}")
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Resource deleted"})
