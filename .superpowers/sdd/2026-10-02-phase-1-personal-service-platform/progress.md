# SDD ledger — plan: docs/superpowers/plans/2026-10-02-phase-1-personal-service-platform.md

## Workspace ruling

The repository has no commits and is not connected to a remote, so a native Git worktree cannot be created from a commit. The user explicitly requested Subagent-Driven execution; execution continues in the current checkout with disjoint write scopes, no destructive deletion, and no commits unless explicitly requested.

## Pre-flight conflict scan

| Task(s)     | Shared file/interface                                    | Finding                                                     | Ruling                                                                                        |
| ----------- | -------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1 → 4/5/6/7 | `packages/contracts/src/index.ts`, domain status strings | Task 1 produces shared schemas consumed by API tasks.       | Task 1 must land before API implementers consume contract names.                              |
| 2 → 4/5/6/7 | `apps/api/src/database/schema.ts`, DB provider           | Database tables/provider are prerequisites for API modules. | Task 2 may run with Task 1, but API tasks wait for both.                                      |
| 3 → 6/7     | `apps/api/src/auth/*`, admin endpoints                   | Admin guard is prerequisite for private handlers.           | Task 3 waits for module wiring but can run after contract/schema groundwork.                  |
| 4 → 5       | Public projections and public inquiry route              | Task 5 extends public module created by Task 4.             | Implement sequentially or give Task 5 a disjoint new file and integrate later.                |
| 6 → 9       | Admin inquiry API → admin UI                             | Admin UI depends on endpoint shapes.                        | UI may use typed fixtures first, but final integration waits for Task 6.                      |
| 7 → 9       | Admin content API → content editor                       | Admin UI depends on publication validation.                 | Keep UI commands aligned with Task 7 contract names.                                          |
| 8 ↔ 9       | `apps/web/src/router.ts`, `App.vue`, `style.css`         | Public and admin UI share app shell and route map.          | One UI implementer owns router/App/style and both public/admin surfaces to prevent overwrite. |
| 10 → 8/9    | Media/analytics UI hooks                                 | Optional phase-1 UI integration after base screens.         | Add only after public/admin page structure is stable.                                         |
| 11          | Whole repository                                         | Final verification depends on all tasks.                    | Run only after all implementation and reviews.                                                |

## UI/UX ruling

Use the current Vue 3 + Tailwind stack and existing blue/cyan tokens, replacing the generated grey/orange recommendation with an explicit project override: bright “Orbital Glass” — white/ice background, cobalt and cyan accents, translucent glass layers, restrained 3D orbital visuals, no dark-first shell, no purple/pink AI gradient, Lucide icons, accessible contrast, responsive 375/768/1024/1440 widths, and reduced-motion support. Use `Noto Sans SC` for Chinese readability with `Space Grotesk` only for compact Latin/metric accents.

## Cleanup ruling

Do not delete historical product/design/deployment documents. Preserve them as reference; remove or replace only the foundation demo UI assets, old navigation labels, and unused starter assets once the new public/admin UI passes tests. Keep the implementation plan and design system documents.

## Current implementation status

### Completed

- UI/UX design system: completed with the bright Orbital Glass direction, responsive breakpoints, accessible focus states, reduced-motion support, and public/private visual alignment.
- Public web experience: completed for the Phase 1 UI slice, including profile, services, service detail, projects, project detail, inquiry form, FAQ, delivery information, related content, technology stacks, media, repository links, and fixture fallback.
- Private admin experience: completed for the Phase 1 UI slice, including login, dashboard, inquiry list/detail, status filtering, internal notes, content draft editing, preview, publication checks, demo-mode messaging, and local draft persistence.
- Contract and foundation checks: completed for the current repository state; contracts, database metadata, admin-auth boundary, and seed boundary have deterministic tests.
- Public API vertical slice: completed for published profile/services/projects reads and anonymous inquiry submission, with explicit `503` behavior when the database is unavailable.
- Admin inquiry API vertical slice: completed for authenticated list/detail/status/note operations with audit events and explicit `503` behavior when the database is unavailable.
- Admin content API vertical slice: completed for authenticated draft read/save, publish validation, and audit events with explicit `503` behavior when the database is unavailable.
- Starter cleanup: completed for the confirmed unused default Web entry files; historical architecture and deployment documents remain preserved.

### UI complete, backend integration pending

- The Web API adapters now distinguish the explicit `fixture-admin-token` from real tokens and surface remote HTTP/network failures instead of silently falling back to fixtures.
- The public Web adapter still falls back to fixtures when the public API is unavailable; the explicit demo path remains useful for UI review.
- The admin screens use fixture data only for the explicit demo token; real tokens now call the authenticated admin API paths.
- The Web surfaces remain compatible with fixture review mode while the database-backed path is available when PostgreSQL is configured.

### Not implemented in this continuation

- Media storage API and analytics/event API.
- Full database-backed success-path acceptance with PostgreSQL seed/migration execution.

## Verification record — 2026-10-03

- `apps/web`: 7 test files, 26 tests passed.
- `apps/web`: Vue typecheck passed.
- `apps/web`: production build passed.
- `apps/api`: public API e2e suite passed (3 tests).
- `apps/api`: admin inquiry/content e2e boundary suites passed (4 tests).
- `pnpm test:integration`: passed (11 tests across 4 API e2e files).
- Repository typecheck passed across the workspace.
- Repository test suite passed across the workspace.
- Repository build passed across the workspace.
- `pnpm test:integration` remains environment-dependent on PostgreSQL availability and should be run after infrastructure is started.
- `pnpm format:check` still reports pre-existing formatting drift in generated Drizzle metadata, documentation, and several earlier UI files; all files changed in this continuation pass the targeted Prettier check.
- `pnpm lint` exits successfully after excluding vendored `.agents` skill scripts; it reports 10 existing Web warnings and no errors.

## Next recommended slice

Start PostgreSQL-backed success-path acceptance with migrations and deterministic seed data, then add media storage and lightweight analytics only if they directly support the public portfolio/inquiry loop. Do not add customer accounts, multi-provider onboarding, payments, ratings, chat, or formal quote/order/finance workflows in Phase 1.

## Deployment documentation and final verification — 2026-10-03

- Added the Kubernetes learning route and linked it from the documentation hub.
- Expanded the Ubuntu VM deployment guide with command annotations, success criteria, troubleshooting, restart recovery, migration/seed order, health checks, and the distinction between source-driven image builds and registry-based releases.
- Confirmed `infra/docker/compose.vm.yml` passes the `ADMIN_TOKEN` variable into the API container, with a matching placeholder in `.env.vm.example`.
- Targeted Prettier checks passed for the changed documentation and deployment files.
- `pnpm test` passed; `pnpm typecheck` passed; `pnpm build` passed; `pnpm test:integration` passed with 11 tests; `pnpm lint` passed with 10 pre-existing Web warnings and no errors.
- `git diff --check` passed. The repository has no commits yet, so `git status` reports the repository files as untracked rather than isolating this pass's changes.
- Docker Compose validation was not executable on this Windows host because the `docker` command is not installed or not available on `PATH`; run the documented Compose validation on the target VM after Docker Engine and the Compose plugin are installed.

## Detailed command documentation pass — 2026-10-03

- Reworked the Windows development/deployment guide into a from-zero tutorial with execution location, inline command comments, success criteria, repeatability notes, and failure handling.
- Reworked the Ubuntu VM deployment guide with VM creation, SSH, Ubuntu preparation, official Docker apt installation, UFW, source retrieval, secret configuration, Compose validation, image build, migration/seed, health checks, restart recovery, backup, cleanup, and troubleshooting.
- Reworked the Kubernetes learning guide into executable Docker Desktop Kubernetes exercises covering namespace, Deployment, Service, ConfigMap, Secret, port-forward, probes, Pod recovery, rollout, rollback, logs, events, and cleanup.
- Added `docs/06-operations/command-reference.md` with Windows, VM, Kubernetes, health-check, and dangerous-command annotations.
- Updated `docs/README.md` to link the command reference.
- Targeted Prettier checks and `git diff --check` passed; historical documentation path scan returned no matches.
