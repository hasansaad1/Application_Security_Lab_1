# Application Security Lab 1

**Application Security Lab 1** is a full-stack learning sandbox designed to demonstrate foundational web application security principles using a modern, containerized development environment.

## 📦 Project Overview
This project implements a simple but production-inspired web app stack, suitable for labs, exercises, and demonstrations of secure coding, deployment, and DevOps practices. It consists of:

- **Frontend**: Next.js (React), TypeScript, Tailwind CSS
- **Backend**: Node.js (Express), enhanced with security-oriented middleware (Helmet, CORS)
- **Database**: MySQL 8 (Dockerized)
- **API Gateway/Proxy**: NGINX (Dockerized reverse proxy)
- **Orchestration**: Docker Compose for multi-service workflows

---

## 🚦 Setup & Running Guide

### Prerequisites
- **Docker & Docker Compose**: Required for all-in-one stack orchestration ([Install Docker](https://docs.docker.com/get-docker/)).
- **git**: To clone this repository.
- **Node.js & npm** (optional): Only required if you plan to run backend or frontend outside Docker locally ([Install Node.js](https://nodejs.org/en/download/)).

---

### 🐳 Run the Full Stack (Recommended)
Spin up everything (frontend, backend, database, proxy) in development mode:

```bash
git clone <this-repo-url>
cd Application_Security_Lab_1
# Set your MySQL password for the DB
mkdir -p db && echo 'yourpassword' > db/password.txt
# Generate your encryption key 
openssl rand -base64 32 > db/enc_key.txt
# For SSL please add your self signed CERTIFICATE and private keys in nginx/ssl/
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/ssl/selfsigned.key -out nginx/ssl/selfsigned.crt -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

docker compose up --build
```
- Visit [http://localhost](http://localhost) (frontend via NGINX proxy)
- API health: [http://localhost/api/health](http://localhost/api/health)

---

### 🛠️ Run Parts Individually (Local Dev)

#### 1. **Backend only**
- Requirements: Node.js, npm, MySQL service (Docker or local)
```bash
cd backend
npm install
# Set env vars: DATABASE_DB, DATABASE_USER, DATABASE_PASSWORD, DATABASE_HOST, PORT
npm run start-watch
# Express backend now runs on PORT (default: 8080)
```

#### 2. **Frontend only**
- Requirements: Node.js, npm
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

#### 3. **Database only**
- Just launch MySQL via Docker Compose (or standalone)
```bash
docker compose up db
```

---

### 🔄 Mix Docker & Local Runs
- You can run, for example, just the database and backend with Docker:
    - `docker compose up backend db`
- Or, run the frontend locally and let Docker manage DB+backend:
    - `docker compose up backend db`
    - `cd frontend && npm run dev`

**Tip**: Adjust API URLs in your frontend `.env` if running outside the Compose proxy.

---

### ⚙️ Configuration & Customization
- **Change ports/env vars** in `docker-compose.yml` or your own `.env` files.
- NGINX configuration is at `nginx/nginx.conf` (edit for custom routes).
- DB root password is stored in `db/password.txt` (used by Docker secrets).

---

## 💡 What is this product?
This repository provides a hands-on security lab environment for:
- Learning secure coding with Node.js/React
- Practicing containerized deployments
- Introducing students to microservice architectures and common security patterns
- Experimenting with reverse proxy, API routing, environment variables, secret management, and container networking

---

## 🗂️ Repository Skeleton & Explanation

```
/ (Project Root)
├── backend/         # Express.js API, service config, Dockerfile
│   ├── src/
│   │   ├── config.js    # Loads DB env vars, secrets, port
│   │   ├── index.js     # App/server startup, graceful shutdown logic
│   │   └── server.js    # Express app, routes, middleware
│   ├── package.json     # Backend Node dependencies
│   └── Dockerfile       # Backend service container definition
│
├── frontend/        # Next.js React SPA, styling, Dockerfile
│   ├── app/             # Next.js pages/layout/components/assets
│   ├── public/          # Static assets (SVGs, favicon)
│   ├── package.json     # Frontend dependencies (React, Next, Tailwind, etc)
│   └── Dockerfile       # Frontend service container definition
│
├── db/              # Database schema and seed data
│   └── init/
│       ├── 001-schema.sql  # (empty, ready for schema)
│       └── 002-seed.sql    # (empty, ready for seed data)
│
├── nginx/
│   └── nginx.conf    # NGINX configuration for routing/proxying
│
├── docker-compose.yml # Orchestrates frontend, backend, db, nginx
└── README.md         # Project documentation (you are here)
```

---

## 🛠️ Tech Stack & Main Services

- **Frontend:**
  - Next.js 16 (React 19)
  - TypeScript
  - Tailwind CSS (Utility-first styling)
  - ESLint, modern development best practices

- **Backend:**
  - Node.js 20+, Express.js
  - Helmet for HTTP header security
  - CORS for cross-origin resource sharing
  - Morgan for logging
  - MySQL2 driver for DB access
  - Nodemon for dev hot-reload

- **Database:**
  - MySQL 8 (Docker managed, with secrets support)

- **NGINX:**
  - Serves as HTTP frontend, routes `/api/` traffic to backend
  - Supports hot-reload and strong separation of concerns

- **Container Orchestration:**
  - Docker Compose: Single-command spinup of stack

- **Secret Management:**
  - Docker secrets for DB passwords (see `db-password` setup)

---

## 🌐 Platforms, APIs, and Networking

- **Frontend (Next.js)** served at `/` via NGINX ( [32mport 80 [0m)
- **API routes** served at `/api/` via NGINX proxy to Express ( [32mport 8080 [0m)
- **Database** only accessible to backend service (not publicly exposed)
- **Environment variables and secrets** securely loaded via Docker Compose and injected to services

---

## 🚀 Getting Started

1. **Clone this repo**
```
git clone <this-repo-url>
cd Application_Security_Lab_1
```

2. **Create a database secret**
   - Place a MySQL root password in `db/password.txt` (see `docker-compose.yml`)

3. **Spin up all services**
```
docker compose up --build
```

4. **Access the frontend/local lab:**
   - Navigate to [http://localhost](http://localhost) (served via NGINX)
   - API health: [http://localhost/api/health](http://localhost/api/health)

5. **Extend the project**
   - Start editing files under `/frontend` and `/backend` — Compose will auto-reload them in dev mode.

---

## 📚 Additional Notes

- The initial schema/seed SQL files are empty: customize for your own lab modules.
- Uses modern, production-aligned Docker patterns, including watch/rebuild on frontend/backend code changes.
- All structure is designed for both security learning and rapid extension.

---

_For details on modifying the NGINX proxy, adding new routes, or expanding the database schema, see the corresponding files under each directory._