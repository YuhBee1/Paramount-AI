# P/AI Source Package Manifest

This archive contains the deployable P/AI source tree for GitHub/Vercel: React client, TypeScript/tRPC server, Vercel Function entrypoint, Drizzle schema and migrations, docs, tests, Vercel configuration, Dockerfile for non-Vercel portability, package manifests, and deployment instructions.

Excluded by design: `node_modules/`, `dist/`, `.git/`, local logs, screenshots, sandbox metadata, generated caches, ZIP archives, and environment secrets. Vercel should install dependencies and build from `vercel.json`; the Dockerfile is retained for non-Vercel container deployments.

Before production launch, configure secrets in Vercel and run the migration/verification commands in `DEPLOY_VERCEL.md`.
