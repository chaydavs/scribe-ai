# Firebase Migration + Architecture Plan

**Status:** Planned
**Date:** 2026-04-25
**Owner:** Chaitanya
**Execution Mode:** Intended for Claude Code step-by-step implementation

## Goal

Design and execute a migration path that moves hosting and file storage into Firebase, preserves strong relational guarantees for billing and product data, supports secure storage of user-created resume documents, and improves the app's privacy/security posture.

This plan intentionally does **not** recommend a Firestore-only architecture.

## Final Recommendation

Use this target architecture:

- **Frontend + SSR hosting:** Firebase App Hosting
- **Authentication:** Firebase Auth
- **Primary database:** Firebase Data Connect backed by PostgreSQL
- **File storage:** Cloud Storage for Firebase
- **Optional realtime draft layer:** Firestore, only for draft sync / presence / collaboration
- **Sensitive content protection:** application-layer encryption for resume text, analyses, and rewrites

## Why This Architecture

Your app has two different classes of data:

### Class 1: correctness-sensitive relational data

Examples:

- users / profiles
- credits
- credit ledger
- payment events
- analyses
- exports
- document versions

This data needs:

- transactions
- idempotency
- uniqueness
- auditability
- server-side mutation control

That is PostgreSQL territory.

### Class 2: user-generated content and realtime UX state

Examples:

- uploaded PDFs
- exported PDFs
- draft editor state
- live autosave state
- collaboration presence

This data maps well to:

- Cloud Storage for files
- Firestore for optional realtime UX state

## Non-Goals

This plan does **not** optimize for:

- a Firestore-only rewrite
- storing PDFs or large blobs in Firestore
- moving billing logic into client-side Security Rules
- weakening relational correctness to simplify implementation

## Target System Design

### 1. Firebase App Hosting

Use Firebase App Hosting for the Next.js app.

Reasons:

- better GitHub integration
- unified deploy flow for Next.js
- Firebase’s recommended path for full-stack Next.js apps

### 2. Firebase Auth

Use Firebase Auth for:

- email/password auth
- Google sign-in
- session identity for frontend + backend

Store only identity and auth claims in Firebase Auth. Keep product profile data in PostgreSQL / Data Connect.

### 3. PostgreSQL via Firebase Data Connect

Use Data Connect as the primary app database interface.

This should hold:

- profiles
- documents
- document_versions
- analyses
- rewrites
- exports
- credit_accounts
- credit_ledger
- payment_events
- webhook_events

### 4. Cloud Storage for Firebase

Use Storage for all files:

- uploaded resume PDFs
- generated export PDFs
- optional JSON snapshots / backups

Do **not** store base64 PDFs in Firestore or relational rows.

### 5. Firestore as optional realtime layer

Use Firestore only if you want:

- realtime autosave
- multi-tab draft sync
- collaboration presence
- future multiplayer editing

If you do not need realtime UX now, skip this in Phase 1.

## Final Data Model

## Relational Schema (Data Connect / PostgreSQL)

### `users`

- `id` UUID / auth-linked id
- `email`
- `created_at`
- `updated_at`

### `profiles`

- `user_id`
- `full_name`
- `credits_balance`
- `plan_status`
- `created_at`
- `updated_at`

### `documents`

Represents a logical resume document.

- `id`
- `user_id`
- `title`
- `status` (`draft`, `analyzed`, `exported`, `archived`)
- `active_version_id`
- `latest_analysis_id`
- `latest_rewrite_id`
- `created_at`
- `updated_at`

### `document_versions`

Immutable version history for resume content.

- `id`
- `document_id`
- `version_number`
- `source` (`upload`, `manual`, `rewrite`, `fix-apply`, `import`)
- `encrypted_resume_text`
- `resume_text_iv`
- `resume_text_key_version`
- `summary_plaintext` (small searchable summary only)
- `created_by`
- `created_at`

### `analyses`

- `id`
- `document_id`
- `document_version_id`
- `job_description_hash`
- `encrypted_job_description`
- `job_description_iv`
- `encrypted_analysis_payload`
- `analysis_payload_iv`
- `score`
- `score_breakdown_json`
- `model_name`
- `input_tokens`
- `output_tokens`
- `created_at`

### `rewrites`

- `id`
- `document_id`
- `source_analysis_id`
- `source_version_id`
- `encrypted_rewrite_text`
- `rewrite_text_iv`
- `model_name`
- `input_tokens`
- `output_tokens`
- `created_at`

### `exports`

- `id`
- `document_id`
- `document_version_id`
- `template_id`
- `storage_path`
- `mime_type`
- `credits_used`
- `created_at`

### `templates`

- `id`
- `slug`
- `name`
- `description`
- `style`
- `credit_cost`
- `is_premium`
- `is_active`
- `created_at`

### `credit_ledger`

Immutable ledger. Never mutate rows after insert.

- `id`
- `user_id`
- `entry_type` (`purchase`, `usage`, `refund`, `grant`, `adjustment`)
- `credits_delta`
- `balance_after`
- `tool`
- `reference_type`
- `reference_id`
- `idempotency_key`
- `description`
- `created_at`

### `payment_events`

- `id`
- `user_id`
- `provider` (`paypal`)
- `provider_event_id`
- `provider_order_id`
- `status`
- `amount_cents`
- `credits_granted`
- `raw_payload_json`
- `created_at`

### `webhook_events`

- `id`
- `provider`
- `provider_event_id`
- `event_type`
- `received_at`
- `processed_at`
- `status`
- `error_message`

## Optional Firestore Collections

Only if realtime UX is needed.

### `drafts/{documentId}`

- `userId`
- `currentText`
- `templateId`
- `updatedAt`
- `lastSavedBy`
- `versionRef`

### `drafts/{documentId}/presence/{sessionId}`

- `userId`
- `displayName`
- `cursor`
- `selection`
- `lastSeenAt`

### `drafts/{documentId}/ops/{opId}`

- `userId`
- `type`
- `payload`
- `createdAt`

## Cloud Storage Design

Use deterministic paths:

- `users/{uid}/uploads/{uploadId}.pdf`
- `users/{uid}/exports/{exportId}.pdf`
- `users/{uid}/snapshots/{documentId}/{versionId}.json.gz`

Metadata to include:

- `userId`
- `documentId`
- `versionId`
- `kind`
- `contentType`
- `createdAt`

Do not put sensitive data in object names.

## Security Model

## 1. Authentication

All user-facing writes require authenticated identity.

Rules:

- users can only access their own document/file metadata
- billing mutations must never be performed directly from the client
- payment and credit mutations are server-only

## 2. Authorization

Use server-side authorization for:

- credit deductions
- purchases
- export charging
- analysis creation
- rewrite creation
- webhook processing

Use Firebase Security Rules only for:

- client document access
- client draft access
- file upload access

## 3. Encryption

### Default platform encryption

Rely on platform encryption for:

- Firestore at rest
- Cloud Storage at rest
- TLS in transit

### Application-layer encryption

Required for:

- full resume text
- job descriptions
- analysis payloads
- rewrite payloads

Recommended encrypted fields:

- `encrypted_resume_text`
- `encrypted_job_description`
- `encrypted_analysis_payload`
- `encrypted_rewrite_text`

Store alongside:

- IV / nonce
- key version

Suggested implementation:

- envelope encryption using Cloud KMS or a dedicated server-side key strategy
- encrypt/decrypt only on trusted server paths

### Key management requirements

- support key rotation
- store `key_version` on encrypted records
- never decrypt in browser client code
- keep plaintext exposure minimal

## 4. Auditability

You should be able to answer:

- who uploaded what
- who exported what
- who consumed credits and why
- whether a payment event was processed more than once

This is why the ledger and event tables stay relational.

## Execution Phases

## Phase 0: Prep and decision checkpoint

**Goal:** Confirm migration scope before code changes.

### Tasks

1. Decide whether you are:
   - migrating fully from Supabase auth + DB
   - or doing a staged migration with Firebase App Hosting + Storage first
2. Decide whether Firestore realtime drafts are Phase 1 or deferred
3. Define environment variable strategy for both old and new systems during transition
4. Create a migration branch

### Deliverables

- written migration decision
- target architecture diagram
- environment variable inventory

## Phase 1: Hosting migration

**Goal:** Move deployment target to Firebase App Hosting without changing database behavior yet.

### Tasks

1. Initialize Firebase in this repo
2. Configure App Hosting for the existing Next.js app
3. Set up GitHub-connected deployment
4. Configure production and preview environments
5. Validate SSR routes and API routes under App Hosting

### Verification

- app builds
- auth pages render
- protected routes render
- API routes are reachable

### Claude Code Prompt

Use Claude Code to:

- initialize Firebase App Hosting in this repo
- create the minimal required Firebase config files
- document all required env vars
- preserve current local development behavior

## Phase 2: Storage migration

**Goal:** Move uploads and generated files into Cloud Storage for Firebase.

### Tasks

1. Create storage buckets
2. Define object path conventions
3. Implement server-side upload helper
4. Implement secure signed access / download flow
5. Migrate export path to store PDFs in Cloud Storage
6. Migrate upload flow to store original PDFs in Cloud Storage

### Security Rules goals

- users can write only under their own prefix
- users cannot list all user files
- file type and size should be validated for client uploads

### Verification

- upload PDF works
- export PDF persists correctly
- users cannot access other users’ files

## Phase 3: Relational model migration to Data Connect

**Goal:** Move primary app data from Supabase/Postgres access patterns to Firebase Data Connect.

### Tasks

1. Model the relational schema in Data Connect
2. Generate migrations for:
   - profiles
   - documents
   - document_versions
   - analyses
   - rewrites
   - exports
   - templates
   - credit_ledger
   - payment_events
   - webhook_events
3. Build connectors for:
   - fetch dashboard documents
   - fetch document detail
   - create document version
   - create analysis
   - create rewrite
   - create export record
   - fetch profile
4. Keep all billing mutations server-only

### Required design rules

- no mutable credit balance without ledger reconciliation
- all balance changes must create a ledger row
- all payment callbacks must be idempotent
- all exports must reference a version, not just raw text

### Verification

- create document
- create version
- create analysis
- create rewrite
- create export
- fetch history works

## Phase 4: Billing and payments hardening

**Goal:** Implement payment correctness cleanly in the new stack.

### Tasks

1. Create immutable `credit_ledger`
2. Create server-only balance mutation helpers
3. Require idempotency key on every purchase event
4. Persist raw provider payloads for audit
5. Make export charge and analysis charge reference exact rows

### Required invariants

- duplicate provider event does not double-credit
- concurrent usage does not produce incorrect balance
- refunds are additive ledger events, not destructive edits
- balances can always be recomputed from ledger

### Verification

- simulated duplicate PayPal callback
- simulated concurrent export requests
- manual reconciliation query matches stored balance

## Phase 5: Encryption layer

**Goal:** Protect the most sensitive user content beyond platform-default encryption.

### Tasks

1. Create encryption utility module
2. Define encrypted payload format:
   - ciphertext
   - iv
   - key version
3. Encrypt on write for:
   - resume text
   - job descriptions
   - analyses
   - rewrites
4. Decrypt only in server-side read paths that require plaintext
5. Add key rotation plan

### Design constraints

- never store plaintext resume body in browser-accessible Firestore if encryption is a requirement
- never expose decryption keys to the client
- do not include sensitive information in Storage object names or metadata

### Verification

- encrypted rows exist
- decrypt roundtrip works
- wrong key version fails safely

## Phase 6: Optional Firestore draft sync

**Goal:** Add realtime draft UX only if it clearly improves the product.

### Tasks

1. Add `drafts/{documentId}` collection
2. Add autosave flow
3. Add draft-to-version promotion flow
4. Add optional presence tracking

### Constraints

- Firestore draft is a working state, not the system of record
- relational version rows remain source of truth for permanent history

### Verification

- edits autosave
- refresh restores draft
- promote draft creates immutable version

## Repo Changes To Expect

Likely new directories/files:

- `firebase.json`
- `.firebaserc`
- `dataconnect/`
- `storage.rules`
- `firestore.rules` if Firestore is added
- `src/lib/firebase/`
- `src/lib/encryption/`
- `src/lib/storage/`
- `src/lib/payments/`
- `src/lib/documents/`

Likely refactors:

- auth helpers
- storage upload/download helpers
- export route
- analysis route
- rewrite route
- settings / purchase flows

## Suggested Claude Code Execution Strategy

Execute this plan in separate sessions. Do not ask Claude Code to do the whole migration at once.

Recommended session sequence:

1. "Set up Firebase App Hosting for this Next.js app with minimal code changes."
2. "Add Cloud Storage for Firebase integration for uploads and exports."
3. "Design the Data Connect schema for this app based on current Supabase tables and routes."
4. "Implement the first Data Connect-backed document and profile flows."
5. "Migrate billing and payment logic to the new relational model with ledger + idempotency."
6. "Add server-side application-layer encryption for resume content."
7. "Optionally add Firestore draft sync."

## Claude Code Task Prompts

## Prompt 1: Hosting

"Set up Firebase App Hosting for this Next.js repository. Do not change product behavior. Add the minimal Firebase config, document required env vars, and keep the repo deployable locally."

## Prompt 2: Storage

"Add Cloud Storage for Firebase for uploaded resumes and exported PDFs. Use secure user-scoped file paths and avoid storing PDFs in the database."

## Prompt 3: Data model

"Design and scaffold a Firebase Data Connect schema for profiles, documents, document_versions, analyses, rewrites, exports, templates, credit_ledger, payment_events, and webhook_events based on this codebase."

## Prompt 4: Billing correctness

"Implement a server-only immutable credit ledger and idempotent payment processing flow. Preserve the current product behavior while improving correctness and auditability."

## Prompt 5: Encryption

"Add application-layer encryption for resume text, job descriptions, analyses, and rewrites. Keep decryption strictly server-side and support key versioning."

## Decision Matrix

### Choose Firebase App Hosting

If:

- you want better GitHub-integrated deploys
- you want to stay in Firebase ecosystem
- you do not want to manage separate hosting infra

### Choose Data Connect over Firestore for core data

If:

- you care about billing correctness
- you need relational queries
- you want auditability
- you want the system to stay sane as features grow

### Choose Firestore only for realtime UX

If:

- you want live drafts
- you want presence
- you want future collaboration

### Choose application-layer encryption

If:

- you treat resumes as privacy-sensitive user content
- you want stronger security posture than default platform encryption alone

## Risks

### Migration risk

- dual-running Supabase and Firebase can create complexity during transition

### Product risk

- trying to move auth, db, storage, hosting, and encryption in one pass will create regressions

### Architecture risk

- using Firestore as the primary source of truth for billing and document history will reduce correctness

### Operational risk

- CMEK and advanced key management add complexity; do not adopt them unless you truly need that compliance/control level

## Recommended Final Path

If you want the safest and smartest execution path:

1. Move hosting to Firebase App Hosting
2. Move files to Cloud Storage for Firebase
3. Keep relational data relational via Data Connect / PostgreSQL
4. Add application-layer encryption for sensitive content
5. Add Firestore only if realtime draft UX becomes a real product need

## Definition Of Done

This migration is complete when:

- the app is deployed from GitHub via Firebase App Hosting
- uploads and exports live in Cloud Storage
- core product data lives in a relational schema
- payment/credit flows are idempotent and auditable
- sensitive user content is encrypted at the application layer
- Firestore is used only where realtime UX clearly justifies it

## Final Instruction For Future Claude Code Sessions

When executing this plan, always preserve these constraints:

- keep billing and ledger logic server-only
- do not store PDFs in Firestore
- do not expose encryption keys to the client
- keep immutable version history for resume content
- prefer staged migration over full rewrite
