# Deploy P/AI via GitHub to Vessel

For the complete production procedure, including every supported environment variable, key rotation, database migration, storage, OAuth, smoke tests, rollback, and troubleshooting, read [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md).

This repository is packaged for a Node 22 container deployment. Push the source tree to a private GitHub repository, connect that repository to Vessel, build from the included `Dockerfile`, and expose container port `3000`.

Configure the production environment through Vessel secrets. At minimum provide the database connection, session secret, OAuth values, built-in Forge API URL/key, and any selected provider or webhook secrets. Never commit real values.

Use the migration workflow during release management:

```sh
pnpm install --frozen-lockfile
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
pnpm check
pnpm test
pnpm build
```

The image starts with `pnpm start`, serving the bundled app. A reverse proxy should terminate TLS. For production scale, move long-running AI/media jobs to isolated workers and configure a durable queue; the current web process deliberately does not execute arbitrary model-provided shell commands.

The deploy archive intentionally excludes `node_modules`, `dist`, `.git`, local logs, screenshots, and environment secrets. Vessel should build dependencies and the production bundle from the Dockerfile instead of receiving generated artifacts.
