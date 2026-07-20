
## Support & Contact

We added a simple support ticket system in the starter scaffold.

How to use (public):
- Go to /support on the frontend and fill the form. You can attach screenshots.
- Tickets are stored in the backend and visible only to admins via admin endpoints.

Admin endpoints (admin_email must be in ADMIN_EMAILS in backend/.env):
- GET /admin/support/pending?admin_email=you@example.com
- GET /admin/support/{id}?admin_email=you@example.com
- POST /admin/support/{id}/reply (form fields: admin_email, reply, close boolean)

Support contact placeholders are in backend/.env.example (SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_WHATSAPP). Replace them for production.
