"""Run once to create an administrator: python create_admin.py"""
from getpass import getpass
from app import app, db, bcrypt
from models import User

with app.app_context():
    name = input("Admin name: ").strip()
    email = input("Admin email: ").strip().lower()
    password = getpass("Admin password (min 12 characters): ")

    if not name or "@" not in email or len(password) < 12:
        raise SystemExit("Enter a name, valid email and password of at least 12 characters.")
    if User.query.filter_by(email=email).first():
        raise SystemExit("That email is already registered.")

    admin = User(
        name=name,
        email=email,
        password_hash=bcrypt.generate_password_hash(password).decode("utf-8"),
        role="admin"
    )
    db.session.add(admin)
    db.session.commit()
    print("Admin account created.")
