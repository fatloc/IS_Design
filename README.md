# IS_Design

Full-stack Dorm/Homestay management project.

## Tech Stack
- Backend: Spring Boot (Java 17, Maven, MySQL)
- Frontend: React + Vite + TypeScript
- Database tooling: SQL scripts + Python seed scripts

## Workspace Layout
- `apps/backend/`: Spring Boot API
- `apps/frontend/`: React application
- `infra/database/`: SQL schema and seed scripts
- `docs/`: design artifacts and diagrams

## Recommended Professional Layout (Target)
Use this target for gradual migration:

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
tools/
  dev/
```

## Run Commands
### Backend
```bash
cd apps/backend
mvn spring-boot:run
```

### Frontend
```bash
mvn spring-boot:run
npm install
npm run dev
```

### Database seed
```bash
cd infra/database
python run_seed_mysql.py
```

## Notes
- Build outputs and caches are now ignored by root `.gitignore`.
- Keep source-of-truth documentation in `docs/` only.
- Avoid keeping generated artifacts in git history.
- Legacy `frontend/` currently contains artifact leftovers (`node_modules/`, `dist/`) from earlier tracked files and can be safely removed after permission unlock.
