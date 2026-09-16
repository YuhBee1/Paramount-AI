# P/AI Source Package Manifest

This archive contains the deployable P/AI source tree for GitHub/Vessel: React client, TypeScript/tRPC server, Drizzle schema and migrations, docs, tests, Dockerfile, package manifests, and deployment instructions.

Excluded by design: `node_modules/`, `dist/`, `.git/`, local logs, screenshots, sandbox metadata, generated caches, ZIP archives, and environment secrets. Vessel should install dependencies and build the application from the included `Dockerfile`.

Before production launch, configure secrets in Vessel and run the migration/verification commands in `DEPLOY_VESSEL.md`.
