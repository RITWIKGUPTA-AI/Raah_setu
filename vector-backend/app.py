import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from config import Config

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    if not app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise RuntimeError("DATABASE_URL is missing. Add it to your .env file.")

    allowed_origins = os.getenv(
        "FRONTEND_ORIGIN",
        "https://vector-two-iota.vercel.app"
    ).split(",")

    CORS(app, resources={r"/api/*": {"origins": [x.strip() for x in allowed_origins]}})

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    from models import User, Resource, ReliefRequest, Delivery, ActivityLog
    from routes.auth import auth_bp
    from routes.inventory import inventory_bp
    from routes.requests import requests_bp
    from routes.deliveries import deliveries_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(inventory_bp, url_prefix="/api/resources")
    app.register_blueprint(requests_bp, url_prefix="/api/requests")
    app.register_blueprint(deliveries_bp, url_prefix="/api/deliveries")

    @app.get("/")
    def home():
        return jsonify({
            "name": "VECTOR API",
            "status": "running",
            "message": "Backend is connected."
        })

    @app.get("/api/health")
    def health():
        return jsonify({"status": "healthy"})

    @app.get("/api/dashboard")
    def dashboard():
        from sqlalchemy import func
        total_requests = db.session.query(func.count(ReliefRequest.id)).scalar() or 0
        pending_requests = db.session.query(func.count(ReliefRequest.id)).filter(
            ReliefRequest.status == "pending"
        ).scalar() or 0
        completed_deliveries = db.session.query(func.count(Delivery.id)).filter(
            Delivery.status == "delivered"
        ).scalar() or 0
        available_resources = db.session.query(func.coalesce(func.sum(Resource.quantity), 0)).scalar() or 0

        return jsonify({
            "total_requests": total_requests,
            "pending_requests": pending_requests,
            "available_resources": int(available_resources),
            "completed_deliveries": completed_deliveries
        })

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Endpoint or record not found"}), 404

    @app.errorhandler(500)
    def server_error(_):
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=False)
