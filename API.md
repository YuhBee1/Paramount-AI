# P/AI API Surface

The current application exposes versionable tRPC procedures under `/api/trpc`.

| Procedure | Access | Purpose |
|---|---|---|
| `auth.me` | Public | Resolve the current authenticated user or `null`. |
| `auth.logout` | Public | Clear the secure session cookie. |
| `projects.list` | Authenticated | List active projects owned by the caller. |
| `projects.create` | Authenticated | Create a validated project owned by the caller. |

`projects.create` accepts `name`, `slug`, and an optional `description`. Slugs must be lowercase kebab case. Project records are never selected by user-supplied owner IDs; ownership comes from the authenticated context.

Future public APIs will be versioned under `/api/v1` and will use scoped, rotatable API keys with rate limits. Provider credentials remain server-side.
