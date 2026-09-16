# P/AI Architecture

P/AI (Paramounts AI) is a modular AI operating environment. The initial implementation uses the WebDev full-stack runtime as a delivery substrate while keeping business logic behind P/AI-owned interfaces.

## Service boundaries

| Boundary | Responsibility | Replacement contract |
|---|---|---|
| Web application | Authenticated UI, RPC contracts, policy enforcement | tRPC procedures and domain services |
| Persistence | Logical entities, migrations, auditability | Repository interfaces |
| Object storage | Content-addressed bytes, snapshots, signed access | `StorageService` |
| AI gateway | Provider/model registry, routing, usage normalization | `AiProvider` and `ModelRouter` |
| Credits | Quotes, reservations, immutable ledger | `CreditService` |
| Jobs | Long-running work and state transitions | `JobService` |
| Training pipeline | Consent-aware dataset intake and provenance | Dataset domain contracts |

The initial metadata store is Drizzle/MySQL behind repository boundaries. This is an implementation detail, not the product identity; a future P/AI persistence engine can replace it through migrations and adapters.

## Trust boundaries

The browser never receives provider credentials or unrestricted project secrets. Protected procedures validate the authenticated user and project ownership before accessing workspace data. AI-generated commands must execute in isolated workers, never in the public web process.

## Delivery phases

Phase 1 establishes identity, roles, configuration, audit events, logical schema, interfaces, and the responsive workspace shell. Later phases add storage, gateway adapters, chat, credits/billing, code-agent sandboxing, multimodal jobs, public APIs, training data, and self-hosted inference.

See `docs/DECISIONS.md` for deliberate deviations and `docs/SCHEMA.md` for the logical model.
