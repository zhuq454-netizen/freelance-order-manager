# OrderlyDesk Phase 1 Personal Service Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and validate the first usable OrderlyDesk vertical slice: a public personal service/portfolio site plus a lightweight private inquiry-management backend.

**Architecture:** Keep the existing pnpm monorepo and modular NestJS API. Add a public content read model, inquiry submission, and admin content/inquiry operations without introducing customer accounts, multi-provider tenancy, payments, or order/project workflows. The Vue web app will host the public site and a separate authenticated admin surface; public and private API handlers must use separate response schemas so private fields cannot leak.

**Tech Stack:** Vue 3, Vite, TypeScript, Tailwind CSS, NestJS 12, Zod, OpenAPI, PostgreSQL 16, Drizzle ORM, Vitest, Supertest, existing design tokens.

**Spec:** `D:\Work\JiaFang\saltedFish\Documentsmaterials\orderlydesk-docs\01-product\product-strategy-v3.md`, `D:\Work\JiaFang\saltedFish\Documentsmaterials\orderlydesk-docs\01-product\phase-1-requirements-v1.md`, `D:\Work\JiaFang\saltedFish\Documentsmaterials\orderlydesk-docs\01-product\user-flows-and-information-architecture-v1.md`, `D:\Work\JiaFang\saltedFish\Documentsmaterials\orderlydesk-docs\01-product\project-portfolio-design-v1.md`

## Global Constraints

- First release is a single-provider product: public portfolio + services + anonymous inquiry form + provider admin.
- Public visitors do not need an account; the provider admin is the only authenticated role in Phase 1.
- Content lifecycle is exactly `draft`, `published`, `archived`; archived content stays in the database and is absent from public lists.
- Inquiry lifecycle is `new`, `viewed`, `communicating`, `quoted`, `won`, `rejected`, `paused`, `lost`.
- Public APIs may return only published, non-sensitive content; private notes, customer contact data, original files, internal pricing and unapproved media must never be returned by public handlers.
- The first release does not include customer accounts, provider registration, real-time chat, online payment, platform commissions, ratings, arbitration, automatic matching, mobile apps, mini programs, or complete quote/order/project/finance workflows.
- Monetary values are not used as transaction state in Phase 1; reference price is presentation content only.
- Business timestamps are stored in UTC and displayed in `Asia/Shanghai`.
- Use Zod as input/schema authority and expose the API through OpenAPI; do not duplicate business state rules in Vue components.
- Do not add a new component library or microservice; keep the existing modular monolith and pnpm workspace.
- Use soft archive semantics for managed content; do not physically delete published content through the first admin UI.
- TDD applies to each vertical slice: write a focused failing test, verify failure, implement the smallest behavior, then run the focused test and broader relevant checks.
- Do not commit changes unless the user explicitly requests commits.

---

## File and Module Map

The implementation should create focused modules rather than extending the current foundation shell indefinitely.

- `packages/contracts/src/public-content.ts`: Zod schemas/types for public profile, services, projects and public inquiry payload/response.
- `packages/contracts/src/admin.ts`: Zod schemas/types for admin content mutations, inquiry detail/list, status changes and notes.
- `packages/contracts/src/index.ts`: export the new contract modules.
- `apps/api/src/database/schema.ts`: Drizzle tables for provider profile, services, projects, project-service links, inquiries, inquiry notes, and audit events; migrations/config updated alongside schema.
- `apps/api/src/database/database.module.ts`: global database provider using the existing `createDatabaseClient` pattern and test override seam.
- `apps/api/src/public/public-content.controller.ts`: anonymous read endpoints for published profile/services/projects and public inquiry submission.
- `apps/api/src/public/public-content.service.ts`: public query and projection logic; never return private columns.
- `apps/api/src/inquiries/inquiries.controller.ts`: admin list/detail/status/note endpoints.
- `apps/api/src/inquiries/inquiries.service.ts`: inquiry transitions, notes, source attribution and audit events.
- `apps/api/src/content/content.controller.ts`: admin profile/service/project CRUD, preview, publish/archive endpoints.
- `apps/api/src/content/content.service.ts`: admin content commands and publication validation.
- `apps/api/src/auth/admin-auth.guard.ts`: Phase 1 single-admin Bearer Token guard using the configured credential boundary; keep provider identity abstract enough for later account migration.
- `apps/api/test/public-content.e2e-spec.ts`: public read, publication filtering and inquiry submission acceptance tests.
- `apps/api/test/admin-content.e2e-spec.ts`: admin content and inquiry operation tests.
- `apps/api/drizzle/`: generated SQL migrations for Phase 1 business tables.
- `apps/web/src/public/`: public pages, API composables and view models.
- `apps/web/src/admin/`: admin layout, auth boundary, content forms, inquiry list/detail and API composables.
- `apps/web/src/components/`: only reusable presentation components shared by public/admin surfaces.
- `apps/web/src/router.ts`: route map for `/`, `/services`, `/services/:slug`, `/projects`, `/projects/:slug`, `/contact`, `/admin/*`.
- `apps/web/src/App.vue`: render the router root instead of the foundation-only desktop shell.
- `apps/web/src/App.spec.ts` and new `apps/web/src/public/*.spec.ts` / `apps/web/src/admin/*.spec.ts`: component and flow tests.
- `apps/web/src/style.css`: retain design tokens and add only page-level utilities required by the approved bright visual system.
- `apps/web/src/`: current public and admin Vue experience; no legacy desktop shell or business navigation is part of Phase 1.
- `apps/web/public/robots.txt` and `apps/web/index.html`: public metadata and basic crawl/share defaults.
- `apps/web/src/assets/`: replace foundation/demo-only imagery with approved placeholder-safe visual assets or content-driven image slots.
- `docs/03-development/`: current Windows development, environment variable, and migration instructions.

---

### Task 1: Lock the Phase 1 contracts and domain vocabulary

**Files:**

- Create: `packages/contracts/src/public-content.ts`
- Create: `packages/contracts/src/admin.ts`
- Modify: `packages/contracts/src/index.ts`
- Create: `packages/contracts/tests/public-content.spec.ts`
- Create: `packages/contracts/tests/admin.spec.ts`

**Interfaces:**

- Produces `contentStatusSchema`, `inquiryStatusSchema`, `publicProfileSchema`, `publicServiceSummarySchema`, `publicServiceDetailSchema`, `publicProjectSummarySchema`, `publicProjectDetailSchema`, `createInquiryInputSchema`, `adminInquirySummarySchema`, `adminInquiryDetailSchema`, `updateInquiryStatusInputSchema`, `createInquiryNoteInputSchema`, and admin content input schemas.
- `createInquiryInputSchema` accepts `contactName`, `contactValue`, `contactMethod`, `title`, `description`, optional `expectedDate`, optional `budgetLabel`, optional `serviceSlug`, optional `projectSlug`, optional `referenceUrl`, optional `attachmentIds`, and `consent`.
- Public response schemas must not contain internal notes, raw private contact metadata, unpublished status, internal audit data, or unapproved media.

- [ ] **Step 1: Write failing schema tests**

Test valid and invalid cases explicitly:

```ts
expect(
  createInquiryInputSchema.parse({
    contactName: '李明',
    contactValue: 'li@example.com',
    contactMethod: 'email',
    title: '企业宣传片剪辑',
    description: '需要一支 60 秒宣传片',
    consent: true,
  }),
).toMatchObject({ title: '企业宣传片剪辑' });

expect(() =>
  createInquiryInputSchema.parse({
    contactName: '',
    contactValue: 'li@example.com',
    contactMethod: 'email',
    title: 'x',
    description: 'x',
    consent: true,
  }),
).toThrow();

expect(() => inquiryStatusSchema.parse('completed')).toThrow();
```

- [ ] **Step 2: Run the focused contract tests and verify failure**

Run: `pnpm --filter @orderlydesk/contracts test -- public-content.spec.ts admin.spec.ts`

Expected: FAIL because the schemas do not exist yet.

- [ ] **Step 3: Implement schemas and inferred types**

Use Zod literals/enums and explicit object schemas. Normalize trimmed strings at the schema boundary, limit long descriptions and URLs, require `consent === true`, and represent optional fields as omitted rather than `null` unless the database adapter requires nullability.

- [ ] **Step 4: Run focused and package checks**

Run: `pnpm --filter @orderlydesk/contracts test`

Run: `pnpm --filter @orderlydesk/contracts typecheck`

Expected: PASS.

---

### Task 2: Add Phase 1 database schema and migration boundary

**Files:**

- Modify: `apps/api/src/database/schema.ts`
- Create: `apps/api/src/database/database.module.ts`
- Create: `apps/api/src/database/seed-phase-1.ts`
- Create: `apps/api/drizzle/0001_phase_1_personal_service_platform.sql`
- Modify: `apps/api/drizzle.config.ts`
- Create: `apps/api/test/database-schema.spec.ts`

**Interfaces:**

- Tables: `providerProfiles`, `services`, `projects`, `projectServices`, `inquiries`, `inquiryNotes`, `auditEvents`.
- Every business table includes UUID primary key, `createdAt`, `updatedAt`; managed content includes `status`; records requiring removal use `archivedAt` rather than hard delete.
- `services.slug` and `projects.slug` are unique; `inquiries.sourceServiceId` and `inquiries.sourceProjectId` are nullable foreign keys; `projectServices` has a composite primary key.
- `inquiries.status` defaults to `new`; `inquiries.consentAt` is required; `inquiryNotes` never participates in public queries.
- `database.module.ts` exports a `DATABASE` provider and closes the pool on module shutdown.

- [ ] **Step 1: Write schema constraint tests**

Test table metadata for unique slugs, inquiry status default, required consent timestamp, project/service join uniqueness, and audit event fields. Use the Drizzle table objects rather than a live database so the test is deterministic.

- [ ] **Step 2: Run the focused schema test and verify failure**

Run: `pnpm --filter @orderlydesk/api test -- database-schema.spec.ts`

Expected: FAIL because the business tables are not defined.

- [ ] **Step 3: Implement tables and migration SQL**

Use PostgreSQL UUID, text, timestamp-with-time-zone, JSONB only for structured flexible metadata, and explicit indexes for public status/slug reads and admin inquiry status/created time. Store reference price as display text in Phase 1; do not introduce transaction money columns.

- [ ] **Step 4: Add deterministic seed data**

Seed one provider profile, three published services, three published projects, and their relationships. Seed data must be safe to rerun and contain no real customer information.

- [ ] **Step 5: Run schema and migration checks**

Run: `pnpm --filter @orderlydesk/api test -- database-schema.spec.ts`

Run: `pnpm --filter @orderlydesk/api typecheck`

Run: `pnpm --filter @orderlydesk/api build`

Expected: PASS; migration is parseable by the configured Drizzle tooling.

---

### Task 3: Implement single-admin authentication boundary

**Files:**

- Create: `apps/api/src/auth/admin-auth.guard.ts`
- Create: `apps/api/src/auth/auth.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/config/env.ts`
- Modify: `apps/api/.env.example`
- Create: `apps/api/test/admin-auth.e2e-spec.ts`

**Interfaces:**

- `AdminAuthGuard` protects all `/admin/*` handlers.
- Phase 1 uses one configured ADMIN_TOKEN; clients send Authorization: Bearer <ADMIN_TOKEN>. Keep the guard interface independent from future provider accounts so the transport can later be replaced without changing content/inquiry controllers.
- Public routes remain anonymous.
- Failed authentication returns `401`; authenticated admin requests expose a stable admin identity to services for audit events.

- [ ] **Step 1: Write failing e2e tests**

Cover anonymous access to a public endpoint, `401` for an admin endpoint without credentials, `401` for invalid credentials, and success for the configured admin credential in test environment.

- [ ] **Step 2: Run the focused e2e tests and verify failure**

Run: `pnpm --filter @orderlydesk/api test:integration -- admin-auth.e2e-spec.ts`

Expected: FAIL because admin routes and guard do not exist.

- [ ] **Step 3: Implement config validation and Bearer Token guard**

Add ADMIN_TOKEN to environment validation and examples, reject startup in production when it is absent, compare the bearer value without logging it, and expose a stable admin identity to request context for audit events. Keep the guard transport behind a small helper so a future account system can replace it without changing content/inquiry controllers.

- [ ] **Step 4: Run focused auth tests**

Run: `pnpm --filter @orderlydesk/api test:integration -- admin-auth.e2e-spec.ts`

Expected: PASS.

---

### Task 4: Implement public content read APIs

**Files:**

- Create: `apps/api/src/public/public-content.module.ts`
- Create: `apps/api/src/public/public-content.controller.ts`
- Create: `apps/api/src/public/public-content.service.ts`
- Modify: `apps/api/src/app.module.ts`
- Create: `apps/api/test/public-content.e2e-spec.ts`

**Interfaces:**

- `GET /api/public/profile` returns `publicProfileSchema`.
- `GET /api/public/services` returns published service summaries.
- `GET /api/public/services/:slug` returns one published service detail.
- `GET /api/public/projects` returns published project summaries with pagination.
- `GET /api/public/projects/:slug` returns one published project detail.
- All public handlers use explicit projection functions and return `404` for missing/unpublished slugs.

- [ ] **Step 1: Write failing integration tests**

Cover published-only filtering, unpublished/archived exclusion, stable slug lookup, project-service relation output, pagination bounds, and absence of private columns from JSON responses.

- [ ] **Step 2: Run the focused integration suite and verify failure**

Run: `pnpm --filter @orderlydesk/api test:integration -- public-content.e2e-spec.ts`

Expected: FAIL because the controllers/services do not exist.

- [ ] **Step 3: Implement service queries and public projections**

Keep the public response shape separate from Drizzle row types. The profile response includes display identity, positioning, skills, process and contact CTA configuration; service/project responses include only approved public fields and media URLs.

- [ ] **Step 4: Add OpenAPI decorators and contract parsing**

Every response and input path must be represented in generated OpenAPI; parse service output through the corresponding Zod schema in tests.

- [ ] **Step 5: Run focused checks**

Run: `pnpm --filter @orderlydesk/api test:integration -- public-content.e2e-spec.ts`

Run: `pnpm --filter @orderlydesk/api openapi:generate`

Expected: PASS and generated schema includes the public routes.

---

### Task 5: Implement anonymous inquiry submission

**Files:**

- Modify: `apps/api/src/public/public-content.controller.ts`
- Create: `apps/api/src/public/inquiry-submission.service.ts`
- Modify: `packages/contracts/src/public-content.ts`
- Create: `apps/api/test/inquiry-submission.e2e-spec.ts`

**Interfaces:**

- `POST /api/public/inquiries` accepts `createInquiryInputSchema` plus server-derived source metadata.
- Returns `{ id, status: 'new', receivedAt }` and never echoes private contact data.
- Resolves optional `serviceSlug`/`projectSlug` to source foreign keys; invalid source slugs return `400`.
- Records consent timestamp, request timestamp, source path and a hashed request fingerprint for basic duplicate/rate-limit detection.

- [ ] **Step 1: Write failing integration tests**

Cover valid anonymous submission, required consent, invalid contact/title/description, source association, success response privacy, duplicate submission throttling, and attachment/reference URL limits.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `pnpm --filter @orderlydesk/api test:integration -- inquiry-submission.e2e-spec.ts`

Expected: FAIL because the route and persistence service do not exist.

- [ ] **Step 3: Implement validation and persistence**

Use the shared Zod schema, normalize source slugs, save the inquiry with status `new`, and create an audit event. Do not send email, chat, payment, or automated quote actions in Phase 1.

- [ ] **Step 4: Run focused tests and API typecheck**

Run: `pnpm --filter @orderlydesk/api test:integration -- inquiry-submission.e2e-spec.ts`

Run: `pnpm --filter @orderlydesk/api typecheck`

Expected: PASS.

---

### Task 6: Implement admin inquiry list, detail, status and notes

**Files:**

- Create: `apps/api/src/inquiries/inquiries.module.ts`
- Create: `apps/api/src/inquiries/inquiries.controller.ts`
- Create: `apps/api/src/inquiries/inquiries.service.ts`
- Create: `apps/api/test/admin-inquiries.e2e-spec.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**

- `GET /api/admin/inquiries` supports `status`, `source`, `page`, and `pageSize`.
- `GET /api/admin/inquiries/:id` returns full admin detail, including contact information, source links, notes and audit history.
- `PATCH /api/admin/inquiries/:id/status` accepts `updateInquiryStatusInputSchema`.
- `POST /api/admin/inquiries/:id/notes` accepts `createInquiryNoteInputSchema`.
- Every status and note mutation writes an audit event with admin identity and UTC timestamp.

- [ ] **Step 1: Write failing integration tests**

Cover protected access, list filtering/pagination, detail privacy boundary, legal status transitions, illegal status transition rejection, note creation, audit event creation, and stable ordering by newest first.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `pnpm --filter @orderlydesk/api test:integration -- admin-inquiries.e2e-spec.ts`

Expected: FAIL because inquiry admin handlers do not exist.

- [ ] **Step 3: Implement the inquiry service and transition table**

Use an explicit transition map: `new -> viewed|rejected|paused`, `viewed -> communicating|rejected|paused|lost`, `communicating -> quoted|rejected|paused|lost`, `quoted -> won|rejected|paused|lost`, `paused -> communicating|rejected`, `won|rejected|lost` are terminal in Phase 1. Reject all other transitions with `400`.

- [ ] **Step 4: Run focused tests and update OpenAPI**

Run: `pnpm --filter @orderlydesk/api test:integration -- admin-inquiries.e2e-spec.ts`

Run: `pnpm openapi:generate`

Expected: PASS.

---

### Task 7: Implement admin profile, service and project content management

**Files:**

- Create: `apps/api/src/content/content.module.ts`
- Create: `apps/api/src/content/content.controller.ts`
- Create: `apps/api/src/content/content.service.ts`
- Create: `apps/api/test/admin-content.e2e-spec.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**

- Admin profile: `GET /api/admin/profile`, `PUT /api/admin/profile`.
- Admin services: `GET /api/admin/services`, `POST /api/admin/services`, `PATCH /api/admin/services/:id`, `POST /api/admin/services/:id/publish`, `POST /api/admin/services/:id/archive`.
- Admin projects: `GET /api/admin/projects`, `POST /api/admin/projects`, `PATCH /api/admin/projects/:id`, `POST /api/admin/projects/:id/publish`, `POST /api/admin/projects/:id/archive`.
- Publication validation requires title, summary, cover/primary media, main content, at least one CTA, and explicit privacy/de-identification confirmation.
- Slugs remain stable when titles change unless an explicit admin slug change is requested and the new slug is unique.

- [ ] **Step 1: Write failing integration tests**

Cover draft creation, edit, preview, publish validation, archive behavior, slug uniqueness, project/service linking, and public absence after archive.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `pnpm --filter @orderlydesk/api test:integration -- admin-content.e2e-spec.ts`

Expected: FAIL because admin content handlers do not exist.

- [ ] **Step 3: Implement commands and publication guardrails**

Keep public projections and admin editing DTOs separate. Archive instead of delete. Store media visibility independently as `private`, `public`, or `admin_only`; a published project must not automatically publish every attached media item.

- [ ] **Step 4: Run focused content tests**

Run: `pnpm --filter @orderlydesk/api test:integration -- admin-content.e2e-spec.ts`

Expected: PASS.

---

### Task 8: Replace the foundation shell with the public web experience

**Files:**

- Create: `apps/web/src/router.ts`
- Create: `apps/web/src/public/api.ts`
- Create: `apps/web/src/public/types.ts`
- Create: `apps/web/src/public/PublicLayout.vue`
- Create: `apps/web/src/public/pages/HomePage.vue`
- Create: `apps/web/src/public/pages/ServicesPage.vue`
- Create: `apps/web/src/public/pages/ServiceDetailPage.vue`
- Create: `apps/web/src/public/pages/ProjectsPage.vue`
- Create: `apps/web/src/public/pages/ProjectDetailPage.vue`
- Create: `apps/web/src/public/pages/InquiryPage.vue`
- Create: `apps/web/src/public/components/ServiceCard.vue`
- Create: `apps/web/src/public/components/ProjectCard.vue`
- Create: `apps/web/src/public/components/InquiryForm.vue`
- Modify: `apps/web/src/App.vue`
- Modify: `apps/web/src/main.ts`
- Modify: `apps/web/src/style.css`
- Create: `apps/web/src/public/pages/PublicPages.spec.ts`
- Create: `apps/web/public/robots.txt`
- Modify: `apps/web/index.html`

**Interfaces:**

- Routes: `/`, `/services`, `/services/:slug`, `/projects`, `/projects/:slug`, `/contact`.
- Public API helpers call `/api/public/*`, expose loading/error/empty states, and never call admin endpoints.
- Every primary page includes a visible “发起需求” CTA; service/project detail pages prefill the inquiry source.

- [ ] **Step 1: Write failing component/flow tests**

Cover home positioning and CTA, service/project cards, published content rendering, loading/error/empty states, source-prefilled inquiry form, required consent, and successful submission state.

- [ ] **Step 2: Run focused web tests and verify failure**

Run: `pnpm --filter @orderlydesk/web test -- PublicPages.spec.ts`

Expected: FAIL because the public router/pages/components do not exist.

- [ ] **Step 3: Implement the public route tree and view models**

Use the approved bright design tokens. Keep content copy data-driven and avoid foundation placeholders such as “暂无业务数据”. Use accessible headings, visible focus states, image alt text, responsive layouts, and an explicit empty state when no published content exists.

- [ ] **Step 4: Implement inquiry UX**

Keep the form single-page, preserve input on errors, allow unknown budget/date values, show attachment/reference constraints, and display a clear success state explaining that the request was received and how follow-up works.

- [ ] **Step 5: Run focused web checks**

Run: `pnpm --filter @orderlydesk/web test`

Run: `pnpm --filter @orderlydesk/web typecheck`

Run: `pnpm --filter @orderlydesk/web build`

Expected: PASS.

---

### Task 9: Add the private admin experience

**Files:**

- Create: `apps/web/src/admin/api.ts`
- Create: `apps/web/src/admin/AdminLayout.vue`
- Create: `apps/web/src/admin/AdminLoginPage.vue`
- Create: `apps/web/src/admin/pages/AdminDashboardPage.vue`
- Create: `apps/web/src/admin/pages/AdminInquiriesPage.vue`
- Create: `apps/web/src/admin/pages/AdminInquiryDetailPage.vue`
- Create: `apps/web/src/admin/pages/AdminContentPage.vue`
- Create: `apps/web/src/admin/components/InquiryTable.vue`
- Create: `apps/web/src/admin/components/InquiryStatusSelect.vue`
- Create: `apps/web/src/admin/components/ContentEditor.vue`
- Create: `apps/web/src/admin/pages/AdminPages.spec.ts`
- Modify: `apps/web/src/router.ts`

**Interfaces:**

- Routes: `/admin/login`, `/admin`, `/admin/inquiries`, `/admin/inquiries/:id`, `/admin/content`.
- Admin API helper sends the configured auth transport and handles `401` by returning to login.
- Dashboard shows new inquiry count, recent inquiries and quick links; it is not a complex analytics dashboard.
- Inquiry detail supports contact copy, notes, status changes and source navigation.
- Content editor supports profile/service/project draft, preview, publish and archive actions.

- [ ] **Step 1: Write failing admin component tests**

Cover login boundary, protected route redirect, inquiry list/status update/note flow, content draft state, publish validation messaging, and absence of admin-only fields on public components.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `pnpm --filter @orderlydesk/web test -- AdminPages.spec.ts`

Expected: FAIL because the admin route tree does not exist.

- [ ] **Step 3: Implement admin routes and components**

Use the same bright token system but a denser work-oriented layout. Keep public and admin layouts separate. Do not restore the old foundation navigation labels for orders, projects, assets and finance as active Phase 1 features.

- [ ] **Step 4: Run focused admin checks**

Run: `pnpm --filter @orderlydesk/web test -- AdminPages.spec.ts`

Run: `pnpm --filter @orderlydesk/web typecheck`

Expected: PASS.

---

### Task 10: Add media, basic statistics and release documentation

**Files:**

- Create: `apps/api/src/media/media.module.ts`
- Create: `apps/api/src/media/media.controller.ts`
- Create: `apps/api/src/media/media.service.ts`
- Create: `apps/api/test/media.e2e-spec.ts`
- Create: `apps/api/src/analytics/analytics.service.ts`
- Create: `apps/api/src/analytics/analytics.controller.ts`
- Create: `apps/api/test/analytics.e2e-spec.ts`
- Modify: `apps/web/src/public/api.ts`
- Modify: `apps/web/src/admin/components/ContentEditor.vue`
- Modify: `D:\Work\JiaFang\saltedFish\Documentsmaterials\orderlydesk-code\docs\README.md`
- Create: `D:\Work\JiaFang\saltedFish\Documentsmaterials\orderlydesk-code\docs\03-development\phase-1-public-and-admin.md`

**Interfaces:**

- Media upload/list endpoints enforce file type/size, visibility and ownership; raw private files never get public URLs.
- Analytics records only `home_view`, `service_view`, `project_view`, `inquiry_start`, `inquiry_submitted` with date and source metadata.
- Admin can view a simple count summary, not a real-time dashboard.

- [ ] **Step 1: Write failing media and analytics tests**

Cover allowed image/video metadata, rejected oversized/unsupported files, private/public URL behavior, event allowlist, anonymous event recording and admin summary aggregation.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `pnpm --filter @orderlydesk/api test:integration -- media.e2e-spec.ts analytics.e2e-spec.ts`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement the smallest object-storage and event boundary**

Use the existing S3-compatible configuration for MinIO. Do not build an editor, transcoder, queue, recommendation engine or real-time analytics pipeline. Use server-side validation and short-lived signed URLs for non-public resources.

- [ ] **Step 4: Update user-facing developer documentation**

Document routes, seed content, local environment variables, public/private API separation, and the Phase 1 acceptance flow. Remove references that present orders, finance and full project management as current product pages.

- [ ] **Step 5: Run focused checks**

Run: `pnpm --filter @orderlydesk/api test:integration -- media.e2e-spec.ts analytics.e2e-spec.ts`

Run: `pnpm --filter @orderlydesk/web test`

Expected: PASS.

---

### Task 11: End-to-end Phase 1 verification and handoff

**Files:**

- Modify: `D:\Work\JiaFang\saltedFish\Documentsmaterials\orderlydesk-code\docs\05-verification\phase-1-acceptance-checklist.md`
- Modify: `README.md` only if commands or current product description are stale.
- Verify: all Phase 1 files.

**Interfaces:**

- Produces reproducible acceptance evidence for public browsing, anonymous inquiry submission, admin processing, publication privacy and content lifecycle.

- [ ] **Step 1: Start infrastructure and seed data**

Run:

```powershell
Copy-Item apps/api/.env.example apps/api/.env.local
pnpm infra:up
pnpm --filter @orderlydesk/api db:migrate
pnpm --filter @orderlydesk/api db:seed
```

Expected: PostgreSQL, Redis and MinIO are healthy and seed data is available without real customer data.

- [ ] **Step 2: Run focused automated checks**

Run:

```powershell
pnpm --filter @orderlydesk/contracts test
pnpm --filter @orderlydesk/api test:integration
pnpm --filter @orderlydesk/web test
pnpm --filter @orderlydesk/web typecheck
pnpm --filter @orderlydesk/api typecheck
```

Expected: PASS.

- [ ] **Step 3: Run the full repository gates**

Run:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
```

Expected: PASS; any unrelated pre-existing failure is recorded rather than fixed in this plan.

- [ ] **Step 4: Perform manual acceptance**

Verify:

1. Anonymous visitor opens `/`, `/services`, `/projects` and a detail page.
2. Visitor submits a valid inquiry without logging in.
3. API stores status `new` with source service/project when present.
4. Admin logs in and sees the inquiry newest first.
5. Admin adds a note and moves the inquiry through legal transitions.
6. Draft/archived content is absent from public routes.
7. Private notes, contact fields and private media are absent from public responses.
8. Admin edits and publishes a service/project only after publication validation passes.
9. The success page explains receipt and follow-up.

- [ ] **Step 5: Record the handoff**

Update the acceptance checklist with actual commands, results, environment prerequisites, known limitations, and the next decision point: whether real inquiry volume justifies Phase 2 customer/lead/quote work.

---

## Coverage Check

- Public homepage, service, project and contact requirements: Tasks 4, 5, 8.
- Anonymous inquiry submission and source attribution: Task 5.
- Admin inquiry list/detail/status/note workflow: Task 6 and Task 9.
- Profile/service/project CRUD, preview, publish/archive: Task 7 and Task 9.
- Project privacy/de-identification and public/private API boundary: Tasks 4, 7, 8.
- Content lifecycle and stable slugs: Tasks 2, 7.
- Basic media handling and analytics: Task 10.
- Public/admin acceptance and documentation: Tasks 10 and 11.
- Future multi-provider capability is intentionally documented but not implemented, matching `platform-evolution-reserve-v1.md`.

## Plan Self-Review

- No `TODO`, `TBD`, or “implement later” placeholders are used.
- Every task has explicit files, interfaces, test-first steps, focused commands and expected outcomes.
- Public and admin schemas are separate; no task relies on returning raw database rows.
- The plan does not introduce payment, customer accounts, platform registration, ratings, chat, mobile apps or the Phase 2 order/project/finance workflow.
- The existing foundation plan remains a historical infrastructure plan; this document is the current Phase 1 business implementation plan.
