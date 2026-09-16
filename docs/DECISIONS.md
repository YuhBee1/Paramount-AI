# Architecture Decisions

## ADR-001: Drizzle/MySQL behind P/AI repositories

**Decision:** Start with the scaffold's reliable Drizzle/MySQL metadata engine behind P/AI repository and service contracts.

**Reason:** The specification requires P/AI-owned data architecture, not a fragile database invented solely to avoid a proven embedded engine. The adapter boundary preserves a migration path to append-only logs, snapshots, checksums, and distributed persistence without leaking vendor types into business logic.

## ADR-002: WebDev full-stack runtime for Phase 1

**Decision:** Use the initialized React/TypeScript/tRPC/Drizzle runtime as the first delivery substrate.

**Reason:** It provides authenticated server-side operations, database migrations, object storage integration points, and a responsive frontend while allowing later extraction of Python AI services.

## ADR-003: Phase 1 does not fake AI or billing

**Decision:** The foundation exposes contracts and configuration surfaces but does not invent provider responses, payment success, or credit charges before their backing services exist.

**Reason:** The master specification explicitly prohibits simulated AI, fake billing, and hard-coded dashboards. Features are marked partial until connected to real providers and immutable persistence.
