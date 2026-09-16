# P/AI Logical Schema

All business timestamps are UTC. User-owned records carry an ownership or project boundary. Critical financial and usage events are append-only and idempotent.

## Identity and access

`users`, `roles`, `permissions`, `organizations`, `memberships`, `api_keys`, `security_events`, `audit_logs`.

## Workspaces and storage

`projects`, `directories`, `files`, `file_versions`, `storage_objects`, `snapshots`, `project_secrets`, `quotas`.

## AI and jobs

`providers`, `provider_credentials`, `models`, `model_capabilities`, `conversations`, `messages`, `memories`, `jobs`, `job_events`, `usage_records`.

## Credits and billing

`credit_accounts`, `credit_ledger`, `plans`, `subscriptions`, `invoices`, `payment_transactions`, `pricing_rules`.

## Training and evaluation

`datasets`, `dataset_versions`, `dataset_records`, `consents`, `training_runs`, `model_versions`, `evaluation_runs`.

## Operations

`notifications`, `feature_flags`, `support_tickets`, `webhook_events`, `backups`.

Deletion must propagate to indexes, caches, derived artifacts, and training eligibility records according to retention policy. Provider usage is stored separately from internal P/AI Credits.
