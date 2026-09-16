# Paramount AI Deployment Guide

**Repository:** `YuhBee1/Paramount-AI`
**Primary branch:** `main`
**Runtime:** Node.js 22 Vercel Function, pnpm, Express, React/Vite, tRPC, Drizzle ORM, MySQL-compatible database
**Frontend output:** `dist/public`
**API entrypoint:** `api/[...path].ts`

This guide explains how to deploy Paramount AI from GitHub to Vercel, configure every required key and setting, apply database migrations safely, rotate credentials, verify a release, and recover from a failed deployment. It is written for a clean production setup. Do not copy real secrets into GitHub, this repository, Vercel configuration, issue comments, or chat messages.

> **Important scope note:** The current release is a production-oriented platform foundation. It includes authentication, projects, file metadata and storage integration, conversations, managed AI gateway calls, image generation, credits, jobs, API keys, dataset consent controls, and administrative registries. Audio/video adapters, isolated code-agent workers, durable distributed queues, payment reconciliation, MFA, and full retrieval indexing remain documented future work. Do not advertise those components as enabled until their provider adapters and operational controls have been implemented.

## 1. Deployment architecture

Vercel should use the committed `vercel.json`. Its build command is `pnpm build`, its static output directory is `dist/public`, and its Node.js Function entrypoint is `api/[...path].ts`. That entrypoint mounts the existing Express middleware for OAuth, storage proxying, the versioned public API, and tRPC. The `server/_core/index.ts` process remains useful for local development and non-Vercel deployments; it is not the Vercel production entrypoint.

The web process is stateless apart from its database and external storage integrations. User records, projects, conversations, jobs, credits, API-key metadata, datasets, and audit-oriented metadata belong in the MySQL-compatible database. File bytes must remain in object storage; the database stores metadata and storage references. Do not use the local container filesystem as durable storage.

The recommended production boundary is:

```text
User browser
    |
TLS / custom domain / Vercel edge
    |
Vercel static assets + Node.js Function
    |--- Manus OAuth
    |--- MySQL/TiDB database
    |--- Managed Forge AI and image APIs
    |--- S3-compatible object storage through the project storage helper
    `--- Optional external provider adapters added in later phases
```

Long-running model, media, or code-execution work must not be implemented as an in-process background worker in a Vercel Function. Function invocations have platform duration and resource limits. When those workloads are enabled, use a durable queue and isolated worker service with explicit timeouts, cancellation, limits, and audit records.

## 2. Prerequisites

Before deploying, confirm that you have the following:

1. Access to the GitHub repository `YuhBee1/Paramount-AI` and permission to import it into Vercel.
2. A Vercel project with Production, Preview, and Development environments configured as appropriate.
3. A MySQL-compatible database reachable from Vercel Functions. The database account must be able to create and alter the P/AI tables during controlled migrations.
4. A configured Manus OAuth application whose callback URL matches the production domain and OAuth configuration.
5. A valid managed Forge API URL and server-side Forge API key for AI and image operations.
6. A production session secret that is long, random, and unique to this deployment.
7. A storage configuration supported by the project runtime for uploaded and generated assets.
8. A DNS name, TLS certificate or managed TLS setting, and a rollback owner.
9. A separate staging environment if production data cannot tolerate migration experiments.

Use a password manager and Vercel Project Settings → Environment Variables for all credentials. Keep a written inventory of secret names, owners, creation dates, rotation dates, and the services that consume them. Store secret values only in those managers. Vercel applies environment-variable changes to new deployments, not deployments that already exist.

## 3. GitHub source and branch policy

The deployment source is the `main` branch of `YuhBee1/Paramount-AI`. Protect `main` before production use. Require pull requests, require successful checks, and restrict force-push and branch deletion permissions. Do not deploy from a developer workstation with uncommitted changes.

A release should follow this sequence:

```sh
git fetch origin
git checkout main
git pull --ff-only origin main
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

The repository intentionally excludes `node_modules`, `dist`, local logs, screenshots, internal sandbox metadata, and environment files. Vercel must install and build from source. Do not upload the previously generated ZIP as the deployed application artifact.

## 4. Vercel project configuration

Import or open the Vercel project connected to `YuhBee1/Paramount-AI` and configure the following values. The committed `vercel.json` supplies the build, output, rewrite, and Function settings; confirm that the dashboard does not override them unexpectedly.

| Setting | Recommended value | Reason |
|---|---|---|
| Source repository | `YuhBee1/Paramount-AI` | Deployment source |
| Branch | `main` | Protected release branch |
| Framework preset | Other / no framework override | This is a Vite + Express/tRPC application |
| Install command | `pnpm install --frozen-lockfile` | Reproducible dependencies |
| Build command | `pnpm build` | Produces Vite assets and the local server bundle |
| Output directory | `dist/public` | Static browser assets emitted by Vite |
| Function entrypoint | `api/[...path].ts` | Express adapter for API, OAuth, storage, and tRPC |
| Node version | `22` | Matches the Vercel Function runtime |
| Environment | `production` | Required for the bundled server |
| Smoke test | HTTP request to `/` and authenticated API flows | Confirms static and Function paths |
| Function duration | `60` seconds in `vercel.json` | Bounds provider requests; keep long work out of the Function |
| TLS/custom domain | Configure in Vercel Domains | Protects sessions and API keys |
| Production branch | `main` | Pushes to `main` deploy Production by default |

Do not configure a Docker start command for the Vercel project. Do not run `pnpm dev` in Vercel Production. Do not expose the database, Forge API key, or storage credentials to browser-side environment variables. The `Dockerfile` is retained for non-Vercel container deployments and local portability; Vercel should use `vercel.json` and the `api/` Function entrypoint.

## 5. Environment and secret configuration

Set `NODE_ENV=production` in Vercel Production if it is not already supplied by the platform. Configure the remaining values in Vercel Project Settings → Environment Variables. Assign each value deliberately to Production, Preview, or Development. Do not assume a Production value is available to Preview.

The following values are read directly by the current source:

| Variable | Required | Secret? | What to enter |
|---|---:|---:|---|
| `DATABASE_URL` | Yes | Yes | Full MySQL/TiDB connection string for the production database. Include TLS parameters if required by the provider. |
| `JWT_SECRET` | Yes | Yes | A new high-entropy session-signing secret. Never reuse a staging or local value. Changing it invalidates existing sessions. |
| `VITE_APP_ID` | Yes | No | The Manus OAuth application ID for this deployment. |
| `OAUTH_SERVER_URL` | Yes | No | The OAuth server base URL, normally the configured Manus OAuth endpoint. |
| `VITE_OAUTH_PORTAL_URL` | Yes | No | Browser-facing OAuth login portal URL. |
| `OWNER_OPEN_ID` | Yes | No | The owner's Manus open ID used to establish the initial owner/admin boundary. Verify this value carefully. |
| `OWNER_NAME` | Recommended | No | Display name for owner-facing configuration and operations. |
| `BUILT_IN_FORGE_API_URL` | Yes for AI/media | No | Server-side managed Forge API base URL. |
| `BUILT_IN_FORGE_API_KEY` | Yes for AI/media | Yes | Server-side bearer key for managed language and image services. Never expose it as a `VITE_` variable. |
| `VITE_FRONTEND_FORGE_API_URL` | Only if a browser feature needs it | No | Browser-safe Forge endpoint, if required by an existing client integration. Prefer server-side calls. |
| `VITE_FRONTEND_FORGE_API_KEY` | Only if explicitly required | Yes | Browser-facing key only when the integration requires it. Treat it as public to users because Vite embeds `VITE_` values in the bundle. Do not place a privileged key here. |
| `VITE_APP_TITLE` | Optional | No | Browser title/branding override if supported by the hosting shell. |
| `VITE_APP_LOGO` | Optional | No | Browser logo/branding value if supported by the hosting shell. |
| `VITE_ANALYTICS_ENDPOINT` | Optional | No | Analytics endpoint. Leave empty if analytics is not approved. |
| `VITE_ANALYTICS_WEBSITE_ID` | Optional | No | Analytics site identifier. Leave empty if analytics is not approved. |

The repository's older architecture notes mention future categories such as `QUEUE_*`, `AI_PROVIDER_*`, `MODEL_*`, `ENCRYPTION_*`, and `WEBHOOK_*`. Those names are planning contracts, not proof that the current web process reads them. Add them only when the corresponding provider or worker code has been implemented and reviewed. Unused variables create false confidence and make key rotation harder.

### 5.1 First-time secret procedure

For each secret, create a production-specific value in the secret manager. Record the secret name and owner, but never record the value in the deployment ticket. Attach a rotation date. Confirm that the value is available to the runtime, not merely to the build stage.

After saving secrets, create a new Vercel deployment rather than relying on an existing deployment to reload them. Confirm that the Function responds without printing secret values. Inspect Vercel Function logs for missing-variable errors, but redact request headers, database URLs, and provider responses before sharing logs.

### 5.2 Key rotation procedure

Rotate one class of key at a time and keep the change reversible:

1. Create a replacement secret in the provider or OAuth system.
2. Add the replacement to Vercel under the same runtime variable name, or add a versioned variable if dual-key overlap is required.
3. Deploy a new revision.
4. Verify login, database access, AI gateway calls, image generation, and any affected webhook or storage action.
5. Revoke the old provider key only after the new revision is confirmed healthy.
6. Record the rotation date and the next review date.

Changing `JWT_SECRET` is different. It invalidates all active application sessions. Schedule it as a deliberate security event, notify users if necessary, deploy the replacement, and verify that a fresh login creates a working session.

Changing `DATABASE_URL` can point the application at a different data set. Treat it as a migration event. Verify the hostname, database name, TLS mode, account permissions, and backup before deploying.

## 6. Database setup and migrations

Create the production database before the first application deployment. Restrict the database account to the required application and migration permissions. Enable automated backups and confirm that a restore can be performed into a separate database.

From a controlled checkout, inspect and generate migration state:

```sh
pnpm install --frozen-lockfile
pnpm drizzle-kit generate
```

The command should report that the schema is synchronized when all generated migrations are already committed. If it creates a new migration, stop and review the SQL before applying it. Never blindly run a generated migration against production.

Apply migrations using the approved database release process:

```sh
pnpm drizzle-kit migrate
```

Run migrations from a controlled operator workstation or a dedicated CI/release job with the production `DATABASE_URL`; do not run migrations inside the Vercel Function handler. If you use Vercel’s build or deployment automation for migrations, ensure the command is an explicit, single-owner release step and cannot run concurrently for multiple deployments. Never put migration execution in a request path or in the Function’s module initialization.

The current repository contains additive Drizzle migrations for the P/AI tables. Before a destructive schema change, take a backup, test the migration against a restored copy, define the rollback or forward-fix procedure, and deploy the application code that understands both sides of the transition where necessary.

## 7. Storage configuration

Project file bytes and generated assets must use the configured object-storage integration. Confirm the storage bucket, region, endpoint, and access policy in the platform integration used by the project. Use a private bucket by default and serve files through authorized application or signed URLs.

Set lifecycle rules for temporary objects and generated assets. Define maximum upload size, allowed MIME types, retention policy, and deletion behavior before enabling uploads for untrusted users. Keep object keys content-addressed or otherwise non-guessable. Do not place user files in `client/public`, `client/src/assets`, the repository, or a container-local directory.

After deployment, test one small upload and one generated asset. Confirm that the database stores metadata and an object reference, not file bytes. Confirm that an unauthorized user cannot list or retrieve another user's project files.

## 8. OAuth and domain setup

Register the production callback URL in the Manus OAuth application. The callback must use the production HTTPS domain and the exact path expected by the OAuth integration. Keep staging and production OAuth applications separate when possible.

Verify the following after the first deployment:

1. Visiting the production root serves the P/AI application.
2. Selecting sign-in redirects to the intended OAuth portal.
3. The callback returns to the production domain.
4. A session is established without mixed-domain cookie errors.
5. Sign-out clears the session.
6. A user without administrator role cannot access administrative procedures.

If login fails, check the public application ID, OAuth server URL, portal URL, callback registration, TLS certificate, browser clock, and cookie policy. Do not paste session cookies into tickets or chat.

## 9. Release procedure

Use this procedure for every production release:

1. Review the pull request and confirm that no `.env`, credential, private key, database dump, or generated secret is included.
2. Confirm the target commit on `main`.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm check`.
5. Run `pnpm test`.
6. Run `pnpm build`.
7. Generate migrations and review any SQL changes.
8. Back up the database when schema or data behavior changes.
9. Deploy the GitHub commit through Vercel.
10. Wait for the new revision to become ready.
11. Run smoke tests through the public domain.
12. Monitor logs, error rates, database connections, response latency, and provider failures.
13. Record the release commit, migration status, operator, and result.

The current verification baseline is 9 passing Vitest tests, a successful TypeScript check, a successful Vite/esbuild production build, and no pending Drizzle schema changes at the time this guide was written.

## 10. Smoke-test checklist

Run the following checks with a browser or an approved API client. Do not use privileged keys in a shared terminal recording.

| Area | Check | Expected result |
|---|---|---|
| Web | `GET /` | P/AI landing page loads over HTTPS |
| Static assets | Load CSS and JavaScript from the page | No 404 or mixed-content errors |
| Auth | Sign in and sign out | Session starts and clears correctly |
| Projects | Create a project | Record appears only for the authenticated owner |
| Chat | Send a short prompt | Assistant response is returned and persisted when the provider is configured |
| Models | Open model discovery | Catalog is returned or a clear provider error is shown |
| Image | Submit a small image prompt | Generated object is stored and rendered when image service is configured |
| Files | Upload a small approved file | Metadata and object reference are created |
| API keys | Create and revoke a test key | Secret is shown once and revoked key stops working |
| Credits/jobs | Open usage screen | Balance and job state load without cross-user data |
| Datasets | Register and approve a test dataset | Consent state changes only for the owning user |
| Admin | Access as ordinary user | Administrative procedures return forbidden |
| Reliability | Restart or redeploy a revision | Database-backed records remain available |

## 11. Public API configuration

The application exposes a versioned API surface under `/api/v1` for selected operations. API keys are created through the authenticated developer console and should be assigned the narrowest available scope. Store the plaintext secret only in the customer's password manager because it is shown once.

The current chat endpoint follows this shape:

```sh
curl -X POST "https://YOUR_DOMAIN/api/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_PAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "messages": [
      {"role": "user", "content": "Hello from production"}
    ]
  }'
```

Treat the current in-process rate limiter as a single-instance safeguard, not a distributed quota system. Before running multiple replicas or exposing the API broadly, move rate-limit state to a durable shared service and add per-user, per-key, and per-organization limits.

## 12. Security controls before public launch

Confirm that all production traffic uses HTTPS and that the Vercel domain has the intended TLS configuration. Use least-privilege database and storage credentials. Keep server-only values out of `VITE_` variables. Rotate the initial deployment credentials after a successful smoke test if they were used during setup.

Review project ownership checks for every read and write procedure. Confirm that API-key lookup uses hashes rather than plaintext secrets. Confirm that administrative procedures are role-gated. Set upload limits and MIME policies. Enable database backups and test a restore. Set provider spending limits where available. Add alerting for authentication failures, provider errors, queue saturation, database connection exhaustion, and unusual API-key usage.

Do not enable autonomous code execution merely because a UI route exists. An agent that can write or execute code requires a separate sandbox, filesystem boundary, network policy, CPU/memory/time limits, approval policy, cancellation, artifact scanning, and auditable logs.

## 13. Rollback and recovery

A rollback is a deployment change, not a substitute for a database restore. If the application revision fails but the schema is backward-compatible, redeploy the previous known-good GitHub commit through Vercel. Do not force-push `main`.

If a migration has already changed the database, prefer a forward fix when possible. Restore only after confirming the recovery point, data-loss window, and ownership of the recovery decision. Restore into a separate environment first, verify application compatibility, and then perform the production cutover using the approved incident process.

For a provider outage, disable the affected feature or provider route rather than exposing secret values or retrying indefinitely. For a leaked secret, revoke it immediately, create a replacement, deploy the replacement, invalidate affected sessions if necessary, and review access logs.

## 14. Troubleshooting

**The Function returns an initialization or 500 error.** Check `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, OAuth values, and Forge values in the Vercel environment selected for that deployment. Confirm the values are available to Function execution, not only to the build. Inspect the first Function error without sharing the full environment.

**The site builds but the browser shows a blank page.** Inspect the browser console and generated asset paths. Confirm that `dist/public` is the Vercel output directory, that the SPA rewrite in `vercel.json` is present, and that the deployment is using the expected commit.

**OAuth redirects to the wrong place.** Check the production application ID, OAuth server URL, portal URL, callback registration, HTTPS domain, and cookie domain behavior.

**Chat or image generation fails.** Confirm the server-side Forge URL and key, provider availability, model identifier, request size, Vercel Function duration, and provider network access. Do not move the privileged Forge key into a `VITE_` variable as a workaround.

**A migration reports an existing table or column.** Stop the release. Compare the database migration history with `drizzle/meta` and the SQL files in `drizzle`. Do not delete migration history or manually drop tables without a backup and an approved recovery plan.

**A file upload succeeds but the file cannot be opened.** Check the object-storage reference, bucket policy, signed URL or proxy behavior, MIME type, and whether the generated URL is reachable from the intended user context.

**The public API returns 401 or 403.** Create a new scoped key through the developer console, send it as a Bearer token, confirm the requested scope, and revoke the old test key. Never place a key in a URL query parameter.

**Multiple replicas show inconsistent rate limits or job state.** The current in-memory rate limiter is not distributed, and long-running work should not remain in the web process. Add a shared rate-limit store and durable worker architecture before scaling those features.

## 15. Operational records to maintain

Keep the following records outside the source repository:

- Production domain, Vercel project identifier, and deployment owner.
- Database provider, database name, backup schedule, and last restore test.
- Secret inventory with names, owners, creation dates, and next rotation dates.
- OAuth application owner and callback URLs.
- Storage bucket owner, retention rules, and access policy.
- Provider contracts, model allowlist, spend limits, and incident contacts.
- Release commit, migration status, smoke-test result, and rollback point.
- Security incidents, revoked keys, credential rotations, and affected users.

Do not put secret values, database dumps, customer files, or session data in these records.

## 16. Final production checklist

Before declaring the deployment complete, verify every item below:

- [ ] The Vercel project is connected to `YuhBee1/Paramount-AI` and the intended `main` commit.
- [ ] The project uses `vercel.json`, `pnpm install --frozen-lockfile`, `pnpm build`, and output directory `dist/public`.
- [ ] The `api/[...path].ts` Node.js Function is deployed and responds to API requests.
- [ ] Production secrets are configured only in Vercel Project Settings → Environment Variables.
- [ ] `DATABASE_URL` points to the intended production database.
- [ ] Backups are enabled and a restore test has been scheduled or completed.
- [ ] OAuth callback and login portal settings use the production domain.
- [ ] `BUILT_IN_FORGE_API_KEY` is server-side only.
- [ ] Storage configuration has been tested with a small file and a generated asset.
- [ ] Drizzle migrations have been reviewed and applied exactly once.
- [ ] `pnpm check`, `pnpm test`, and `pnpm build` pass for the release commit.
- [ ] Auth, project ownership, API key revocation, admin denial, and provider failure paths were smoke-tested.
- [ ] Monitoring and alerts are enabled.
- [ ] A rollback commit and responsible operator are recorded.
- [ ] Future-only features are not enabled or advertised as production-ready.

## References

[1]: https://vercel.com/docs/git/vercel-for-github "Deploying GitHub Projects with Vercel"

[2]: https://vercel.com/docs/project-configuration/vercel-json "Vercel project configuration"

[3]: https://vercel.com/docs/environment-variables "Vercel environment variables"

[4]: https://orm.drizzle.team/docs/kit-overview "Drizzle Kit documentation"

[5]: https://pnpm.io/cli/install "pnpm install documentation"
