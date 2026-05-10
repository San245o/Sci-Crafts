# Marketplace Supabase Setup

Migration files have been created under `supabase/migrations`. Install the Supabase CLI, link the project, then run `supabase db push` when you are ready to apply them.

The standalone SQL files in this folder are kept as manual SQL Editor references.

Fresh setup order:
1. `supabase/migrations/20260510000100_profiles_schema.sql`
2. `supabase/migrations/20260510000200_marketplace_schema.sql`
3. `supabase/migrations/20260510000300_model_optimization_schema.sql`
4. `supabase/migrations/20260510000400_make_product_images_public.sql`
5. `supabase/migrations/20260510000500_seller_onboarding_schema.sql`
6. `supabase/migrations/20260510000600_harden_marketplace_rls_and_functions.sql`
7. `supabase/migrations/20260510000700_product_file_types_and_seller_availability.sql`
8. `supabase/migrations/20260510000800_marketplace_conversations.sql`
9. `supabase/migrations/20260510000900_conversation_message_sender_index.sql`
10. `supabase/migrations/20260510001000_touch_conversation_on_message.sql`
11. `supabase/migrations/20260510001100_product_likes.sql`

Existing marketplace project:
- Apply `supabase/migrations/20260510000500_seller_onboarding_schema.sql`, or run `supabase/seller_onboarding_schema.sql` once in the SQL Editor, to add buyer/seller roles, private seller printer details, and seller-only product inserts.

Expected buckets:
- `product-images`: public, 5 MB per image.
- `product-models`: private, 15 MB per GLB or ZIP CAD/STL package.
- `product-models-raw`: private, 15 MB per raw GLB awaiting optimization.

For an existing project, run `supabase/make_product_images_public.sql` once in the Supabase SQL Editor.

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
- Buyer/seller role is stored on `profiles.account_type`.
- Seller location, printer serial numbers, and filament pricing are stored in `seller_profiles`, which is owner-readable only.
- Non-sensitive seller availability for product pages is stored in `seller_availability`, which is public and excludes serial numbers.
- Sellers are currently limited to the configured Bambu Lab models and supported material list in the app.

Marketplace conversations:
- Buyer-seller contact messages are stored in `conversations` and `conversation_messages`.
- RLS limits reads and inserts to the buyer or seller on each conversation.
- Realtime chat can subscribe to `conversation_messages` after the table is added to the Supabase Realtime publication.

Product likes:
- Buyer saved models are stored in `product_likes`.
- RLS limits likes to the signed-in user who created them.

Async model optimization:
- `supabase/model_optimization_schema.sql` adds raw model storage, product optimization status fields, and the worker claim RPC.
- New uploads go to `product-models-raw` and products start as `optimization_status = 'pending'`.
- The GitHub Actions optimizer uploads optimized output to `product-models`, updates `model_path`, and deletes the raw file.
