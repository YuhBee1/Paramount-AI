# Deploy Paramount AI to Vercel

For the complete production procedure, including every supported environment variable, key rotation, database migration, storage, OAuth, smoke tests, rollback, and troubleshooting, read [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md).

This repository is configured for Vercel with a Vite static frontend and a Node.js catch-all Function. Import `YuhBee1/Paramount-AI` into Vercel, keep `main` as the Production Branch, and allow the committed `vercel.json` to provide the build and routing configuration.

The expected Vercel settings are:

- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm build`
- Output Directory: `dist/public`
- Function entrypoint: `api/[...path].ts`
- Node runtime: `22.x`
- Production domain: configure through Vercel Domains with HTTPS

Configure environment variables separately for Production, Preview, and Development. At minimum, configure `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_URL`, and `BUILT_IN_FORGE_API_KEY`. Use the full variable matrix in `DEPLOYMENT_GUIDE.md`; never commit real values.

Run Drizzle migrations from a controlled release workstation or a single-owner CI step. Do not run migrations inside a Vercel Function request. Long-running AI, media, and code-execution work requires a durable queue and isolated worker architecture rather than an in-process background task.

The `Dockerfile` remains available for non-Vercel container deployments and local portability. Vercel should deploy the `api/` Function and `dist/public` output instead of running the Dockerfile.
