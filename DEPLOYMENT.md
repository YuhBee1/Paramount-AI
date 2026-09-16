# P/AI Deployment

Phase 1 runs as a Node/TypeScript web application with Drizzle metadata persistence and the scaffold's managed storage/auth integrations. The dev server must bind to the managed runtime port; production should place a reverse proxy/TLS boundary in front of the web app.

Future topology separates the web app, internal AI gateway, queue workers, storage service, and isolated code-execution workers. GPU inference is never colocated with unrestricted public-web privileges.

Required environment categories include `APP_*`, `DATABASE_URL`, `QUEUE_*`, `AI_PROVIDER_*`, `MODEL_*`, `ENCRYPTION_*`, and `WEBHOOK_*`. Use `.env.example` as the placeholder contract and provide production values only through the deployment secret manager.

Migrations are generated with `pnpm drizzle-kit generate`, reviewed, and applied through the managed database workflow. Backups are not considered reliable until restore-tested.
