# Commit Summary - shared-dev auth update

Date: 2026-04-27
Branch: shared-dev
Commit: 4523b88d24dd7c51abdd34c4dbad8e990a05d305
Message: Refine employee auth: username/email login and schema alignment

## Scope
- Align authentication flow for employee accounts.
- Support login with username or email.
- Update schema and seed data to match employee auth model.
- Update frontend login/register payload and UI hints.

## Files changed in commit 4523b88d

### Backend - config
- apps/backend/src/main/java/com/homestay/dorm/config/SecurityConfig.java

### Backend - DTO
- apps/backend/src/main/java/com/homestay/dorm/dto/request/CreateUserRequest.java
- apps/backend/src/main/java/com/homestay/dorm/dto/request/LoginRequest.java
- apps/backend/src/main/java/com/homestay/dorm/dto/request/RegisterRequest.java
- apps/backend/src/main/java/com/homestay/dorm/dto/request/UpdateUserRequest.java
- apps/backend/src/main/java/com/homestay/dorm/dto/response/UserDTO.java

### Backend - entity/repository/security/service
- apps/backend/src/main/java/com/homestay/dorm/entity/KhachHang.java
- apps/backend/src/main/java/com/homestay/dorm/entity/NhanVien.java
- apps/backend/src/main/java/com/homestay/dorm/repository/NhanVienRepository.java
- apps/backend/src/main/java/com/homestay/dorm/security/CustomUserDetailsService.java
- apps/backend/src/main/java/com/homestay/dorm/service/AuthService.java
- apps/backend/src/main/java/com/homestay/dorm/service/impl/AuthServiceImpl.java
- apps/backend/src/main/java/com/homestay/dorm/service/impl/UserServiceImpl.java

### Frontend
- apps/frontend/src/pages/Login.tsx
- apps/frontend/src/pages/Register.tsx
- apps/frontend/src/services/api.ts
- apps/frontend/src/types/index.ts

### Database
- infra/database/ScriptDB_05.sql
- infra/database/seed_fake_data.py

## Note
This markdown is a tracking note only; no runtime logic changes are included in this document itself.
