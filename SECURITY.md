# SECURITY.md

## Scope
This document describes the security baseline for the **Application Security Lab 1** project (apartment rental demo). All contributors must follow these rules when adding or modifying code.

---

## 1. Authentication & Sessions
- All protected routes must require **JWT** in the header:  
  - `Authorization: Bearer <token>`
- JWTs are signed with `JWT_SECRET` loaded **from environment variables** (never hardcoded in the repo).
- On successful login, the API returns a JWT; frontend stores it securely (in memory/local storage per team decision).
- Logout is **stateless**: client forgets the token. For stronger setups, reduce token TTL.

## 2. Password Handling
- User passwords are **never stored in plaintext**.
- On register: password is hashed with **bcrypt (or argon2)** with a reasonable cost factor.
- On login: incoming password is compared with the stored hash.
- Password change endpoints must **re-verify** the current password.

## 3. Input Validation (POST/PUT/PATCH)
- All write endpoints (auth, listings, phone requests, uploads) must validate input **before** DB access.
- Use a shared validator/helper where possible (`validateBody()`):
  - required fields present
  - length limits (e.g. title, description, location)
  - types (number vs string)
- If validation fails → return **400** with a safe error message (no stack traces).

## 4. Authorization
- Auth middleware must attach `req.user = { id, role }` when JWT is valid.
- Endpoints that act **on a specific user’s data** (e.g. “my listings”, “approve phone request”) must:
  1. check that the user is authenticated
  2. check that the user is **owner / landlord / admin** as required
  3. return **403** if the user is not allowed
- Ownership checks should be centralized (e.g. `assertOwner()`).

## 5. File Uploads
- All uploads (e.g. listing images) must:
  - check **mimetype** (accept only images, e.g. jpeg/png/webp)
  - check **max size**
  - generate a **safe filename** (UUID) — do **not** trust user filename
  - store only the **path/URL** in the database
- If an upload fails validation → return **400**.

## 6. HTTP Security (Express)
- Express app must enable:
  - **Helmet** (security headers)
  - **CORS** with **origin read from env** (not `"*"`)
  - **JSON body size limit** to prevent large payload attacks
- Errors must be handled by a **global error handler** that:
  - returns consistent JSON errors
  - hides internal error details in production

## 7. Secrets & Configuration
- Secrets (DB password, JWT secret, TLS keys) must **not** be committed.
- Real values go in local `.env` or Docker secrets.
- The repo must contain **`.env.example`** files to document required variables.

## 8. Logging & Auditing
- Sensitive actions (login success/failure, listing create/update/delete, phone approve/reject) should be logged to the `audit_logs` table with user, action, timestamp, and IP.
- Logs must not contain passwords or full tokens.

---

## 9. NGINX / HTTPS
- All traffic should go through NGINX.
- In deployments, HTTP must redirect to **HTTPS**.
- `/api/` must forward auth headers to the backend.

---

**Goal:** anyone joining the team can read this file and implement new endpoints **without weakening security**.
