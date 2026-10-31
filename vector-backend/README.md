# VECTOR Backend (Flask + MySQL)

## 1. Setup
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in real values. Create a MySQL database named `vector_db` first.

For a local MySQL database, a URL looks like:
`mysql+pymysql://USERNAME:PASSWORD@127.0.0.1:3306/vector_db`

## 2. Run
```bash
python app.py
```
API base URL: `http://127.0.0.1:5000`

Tables are created automatically at startup.

## 3. Create an admin
```bash
python create_admin.py
```
Public registration always creates a citizen account. Do not add a public role selector.

## 4. Main endpoints
- `POST /api/auth/register` (public)
- `POST /api/auth/login` (public)
- `GET /api/resources` (public read)
- `POST /api/resources` (admin/operator)
- `PUT /api/resources/<id>` (admin/operator)
- `DELETE /api/resources/<id>` (admin)
- `POST /api/requests` (authenticated)
- `GET /api/requests` (users see their own; admin/operator see all)
- `PATCH /api/requests/<id>/status` (admin/operator)
- `GET /api/deliveries` (admin/operator)
- `POST /api/deliveries` (admin/operator)
- `PATCH /api/deliveries/<id>/status` (admin/operator)
- `GET /api/dashboard` (public aggregate statistics)
- `GET /api/health` (health check)

## 5. Authentication
After login/register, send this header to protected endpoints:
`Authorization: Bearer YOUR_ACCESS_TOKEN`

Example login JSON:
```json
{"email":"person@example.com","password":"your-password"}
```

Example request JSON:
```json
{
  "resource_name": "Drinking water",
  "quantity": 20,
  "location": "Community relief centre",
  "description": "Drinking water requested for the centre"
}
```

## 6. Deploy
Use a managed MySQL database and a Python web service. Build command:
`pip install -r requirements.txt`
Start command:
`gunicorn app:app`

Set `DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET_KEY`, and `FRONTEND_ORIGIN` in the hosting provider's environment settings. Never commit `.env`.

## Notes
This is a functional starter backend, not a production-certified emergency dispatch system. Before real-world use, add database migrations, rate limiting, audit-log access controls, backups, monitoring, stricter validation, and security review. Do not use demo data for real emergency decisions.
