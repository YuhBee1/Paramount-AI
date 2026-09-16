# P/AI Security Baseline

P/AI uses server-side authentication context, protected procedures, project ownership checks, environment-backed secrets, secure cookies, and server-only provider integrations. API secrets are not placed in browser code or logs.

The storage model separates object bytes from indexed metadata and carries owner, project, retention, and content-hash fields. Critical credit movements use immutable, idempotent ledger keys. Audit records capture sensitive administrative events.

Code-agent execution is **not enabled in this phase**. When enabled, it must use a separate worker/container with filesystem, CPU, memory, timeout, network, secret, and artifact controls. The public web process must never execute model-provided shell commands directly.

Before production launch, complete dependency scanning, SSRF/path traversal/upload tests, MFA/session hardening, signed private-file access, backup restore drills, and provider credential rotation.
