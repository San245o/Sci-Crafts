# Sci-Crafts Model Optimizer Worker

This worker is intended to run as a Render Background Worker. It polls Supabase for products with `optimization_status` of `pending` or retryable `failed`, downloads the raw GLB from `product-models-raw`, optimizes it with glTF Transform, uploads the final GLB to `product-models`, updates the product row, and deletes the raw file.

## Render settings

Create a new Render Background Worker connected to this repo.

Use these settings:

- Root Directory: `workers/model-optimizer`
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Node Version: `22` or newer

## Environment variables

Set these in Render's Environment panel:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
POLL_INTERVAL_MS=10000
MAX_ATTEMPTS=3
JOB_STALE_MINUTES=15
```

Get values from Supabase Dashboard:

- `SUPABASE_URL`: Project Settings > API > Project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings > API > service_role key.

Do not expose the service role key in frontend code or any `NEXT_PUBLIC_` variable.

## Local test

From this directory:

```bash
cd workers/model-optimizer
npm install
set -a
. ../../.env.local
set +a
npm start
```

Stop with `Ctrl+C` after it processes pending jobs.

## Pipeline

The command run by the worker is:

```bash
gltf-transform optimize input.glb output.glb --compress draco --texture-compress webp
```

The app renders optimized GLBs with the Draco decoder already available at `/public/draco`.
