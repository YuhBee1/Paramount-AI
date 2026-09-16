# P/AI Engineering Instructions

P/AI is a production-oriented platform, not a mock chatbot. Every feature must connect UI, authorization, business logic, persistence, validation, error handling, logging, tests, and documentation.

Use interfaces for provider, storage, repository, billing, and job operations. Keep secrets in environment-backed secret storage. Never log raw provider keys, private user content, or credentials. Preserve user data and existing contracts; use migrations for schema evolution.

When changing code: inspect the current symbol, make the smallest safe change, add or update tests, run relevant checks, update documentation, and report known limitations. Never claim an external provider call trains a Paramounts-owned model; eligible data must flow through consent, policy, provenance, retention, and deletion controls first.

Agent execution is always project-scoped and sandboxed. Dangerous operations require explicit policy approval. “Unlimited” owner mode bypasses normal business quotas but never bypasses infrastructure, abuse, provider, or emergency safety limits.
