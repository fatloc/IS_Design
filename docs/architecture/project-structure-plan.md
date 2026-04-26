# Project Structure Review and Improvement Plan

## 1) Current Findings

### Strengths
- Clear separation by major concern: apps, infra, and docs.
- Backend follows a common Spring Boot layered layout (`controller`, `service`, `repository`, `entity`, `dto`).
- Frontend already has folder grouping (`components`, `pages`, `services`, `store`, `types`, `styles`).

### Organization issues to fix
1. Build artifacts appear in workspace folders:
  - `apps/backend/target/`
  - `apps/frontend/node_modules/`
  - `apps/frontend/dist/`
  - `infra/database/__pycache__/`
2. Inconsistent naming and casing:
  - Legacy `frontend/` remains at root because of locked artifact files.
3. Unexpected nested folder:
  - `infra/database/frontend/` contains transient artifacts and should be removed.
4. Docs are mixed (business diagrams, exports, misc files) without strict taxonomy.

## 2) Professional Target Model

```text
apps/
  backend/
  frontend/
infra/
  database/
  scripts/
docs/
  architecture/
  business/
  api/
tools/
  dev/
```

## 3) Incremental Migration (Safe order)

### Phase A: Hygiene (low risk, immediate)
- Add root `.gitignore` (done).
- Keep generated files out of source control.
- Add root `README.md` with canonical run commands and structure.

### Phase B: Naming and placement
- Move `backend/` -> `apps/backend/` (done).
- Move `frontend/` source/config -> `apps/frontend/` (done; root legacy artifact folder still pending cleanup).
- Rename `Database/` -> `infra/database/` (done).
- Move Python seed scripts to `infra/scripts/` if shared by multiple environments.
- Remove accidental `infra/database/frontend/node_modules/` after confirming it is unused.

### Phase C: Docs normalization
- Move business diagrams from `docs/resource/Business Design/` to `docs/business/`.
- Keep exported outputs under `docs/architecture/exports/`.
- Add `docs/api/` for OpenAPI, request/response conventions.

### Phase D: Optional monorepo hardening
- Add root task runner (`Makefile` or npm/pnpm workspaces scripts).
- Add CI checks for backend build, frontend build, and linting.

## 4) Backend package evolution recommendation
Current layered package layout is acceptable. For long-term scaling, migrate gradually to feature-first package slices:

```text
com.homestay.dorm
  common/
  auth/
  room/
  contract/
  payment/
```

Each feature package should contain `controller`, `service`, `repository`, `dto` subpackages.

## 5) Frontend evolution recommendation
Move from mixed global folders to domain modules while keeping shared UI separate:

```text
src/
  app/
  modules/
    rooms/
    contracts/
    financials/
    showings/
  shared/
    ui/
    lib/
    hooks/
    api/
```

This keeps business logic close to its screen/routes and reduces cross-folder coupling.

## 6) Definition of done for structure cleanup
- No generated artifacts tracked in git.
- Single canonical place for each concern (apps, infra, docs).
- Naming conventions are consistent (lowercase, kebab-case for folders where possible).
- Onboarding path documented in root `README.md`.
