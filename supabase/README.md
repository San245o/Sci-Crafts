# Marketplace Supabase Setup

No migration has been applied by Codex. Run `supabase/marketplace_schema.sql` manually in the Supabase SQL Editor when you are ready.

Expected buckets:
- `product-images`: private, 5 MB per image.
- `product-models`: private, 15 MB per GLB.

Auth expectations:
- Email/password can be enabled in Supabase Auth providers.
- Email confirmation should stay enabled if you want verification before login.
- Google OAuth should redirect back to `/auth/callback`.

Redirect URLs to allow in Supabase Auth URL Configuration:
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/**`
- `https://your-production-domain.com/auth/callback`
- `https://your-production-domain.com/**`

Seller profiles:
- Run `supabase/profiles_schema.sql` if this project is being recreated from scratch.
- New uploads upsert a public `profiles` row using Supabase Auth metadata.
- Marketplace pages read `profiles.display_name`; existing products without a profile fall back to a shortened user id.

Async model optimization:
- `supabase/model_optimization_schema.sql` adds raw model storage, product optimization status fields, and the worker claim RPC.
- New uploads go to `product-models-raw` and products start as `optimization_status = 'pending'`.
- The GitHub Actions optimizer uploads optimized output to `product-models`, updates `model_path`, and deletes the raw file.
