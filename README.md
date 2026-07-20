# Privacy & Admin guide

This project stores manual UPI payment proofs uploaded by users. For privacy we follow a simple policy:

1. Public endpoints and non-admin users will NOT receive proof URLs or images. Only admin endpoints return the original proof path.
2. Admins should be limited via ADMIN_EMAILS in backend/.env — only configured admin emails can access /admin endpoints.
3. Original proofs are retained for a limited time (RETENTION_DAYS in .env, default 90) — run backend/delete_old_proofs.py periodically to cleanup older files.

How admin checks proof:
- Admin calls GET /admin/payments/pending?admin_email=you@example.com to list pending uploads (includes proof_url only for admins)
- Admin can GET /admin/payments/{player_id}?admin_email=you@example.com to see details and proof_url
- Approve with POST /admin/payments/{player_id}/approve with JSON {"admin_email":"you@example.com"}

Cron example (daily cleanup at 2:30 AM):
0 30 2 * * /path/to/venv/bin/python /path/to/repo/backend/delete_old_proofs.py >> /var/log/tournament_cleanup.log 2>&1
