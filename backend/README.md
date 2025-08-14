# CGMIS Backend

## Setup
1. Copy `.env.example` to `.env` and fill DB credentials and JWT secret.
2. Import DB: `mysql -u root -p < ../career_guidance.sql`
3. Install deps: `npm install`
4. Run: `npm run dev`

## Notes
- Seeded users in SQL contain placeholder password hashes. Use bcrypt to create hashes and update the `users` table.
