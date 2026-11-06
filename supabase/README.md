# EartGalla Journeys — Supabase setup

1. Create a Supabase project. In the SQL editor run `migrations/0001_journeys.sql`.
2. Environment variables (Vercel and `.env.local`):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — **server only**; used just to store visitor inquiries.
   - `SUPABASE_ANON_KEY` — used by the staff sign-in (acts as the signed-in user, so Row Level Security applies).
3. Create the first staff user: Authentication → Users → Add user (email + password). Then give them a role:

   ```sql
   insert into journeys_profiles (user_id, role, display_name)
   select id, 'super_admin', 'Your name' from auth.users where email = 'you@example.com';
   ```
4. Sign in at `/journeys/admin/login`. Roles `super_admin` and `destination_manager` can manage inquiries.
   Partner roles (operator, accommodation partner, guide) exist in the schema but have no dashboard yet.
