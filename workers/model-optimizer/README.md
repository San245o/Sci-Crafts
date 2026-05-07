# Sci-Crafts Model Optimizer

This is a one-shot optimizer for GitHub Actions. It processes up to `MAX_JOBS` pending GLB optimization jobs, then exits.

The workflow lives at `.github/workflows/model-optimizer.yml` and runs:

- Hourly via cron.
- Manually from the GitHub Actions tab.

## Required GitHub Secrets

Add these in GitHub:

`Repository > Settings > Secrets and variables > Actions > New repository secret`

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get them from Supabase:

- `SUPABASE_URL`: Supabase Dashboard > Project Settings > API > Project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Dashboard > Project Settings > API > service_role key.

Do not expose the service role key in frontend code or any `NEXT_PUBLIC_` variable.

## Runtime Settings

The workflow sets:

```env
MAX_JOBS=3
MAX_ATTEMPTS=3
JOB_STALE_MINUTES=15
```

## Local Test

From the repo root:

```bash
cd workers/model-optimizer
npm install
set -a
. ../../.env.local
set +a
MAX_JOBS=3 npm start
```

## Pipeline

The optimizer runs:

```bash
gltf-transform optimize input.glb output.glb --compress draco --texture-compress webp
```

The app renders optimized GLBs with the Draco decoder already available at `/public/draco`.
