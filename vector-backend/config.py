import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "development-only-change-this")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "development-only-change-this-too")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 8
