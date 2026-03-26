# Project: Cloud tech and softwares

### Title: Portfel+
### Authors: Piotr Greń, Adam Zygmunt
---

## Abstract

**Portfel+** (WalletPlus) is a modern, cloud-native web application designed to simplify daily personal finance management. The system empowers users to intuitively add, categorize, and monitor their income and expenses. 

To ensure maximum security and user convenience, Portfel+ features an integrated, passwordless Single Sign-On (SSO) authentication system utilizing popular identity providers (Google, Microsoft, GitHub), alongside a robust stateful JWT implementation for backend synchronization. The architecture is strictly decoupled, separating a reactive frontend client from a high-performance backend API. The entire system is architected specifically for cost-effective deployment across free-tier Serverless and PaaS environments.

## Tech Stack

The project utilizes a modern technology stack separated into distinct layers:

* **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Auth.js (NextAuth) for SSO, Axios.
* **Backend**: Python 3.12, Django, Django REST Framework (DRF), SimpleJWT.
* **Database**: PostgreSQL.
* **Infrastructure**: Docker, Docker Compose, GitHub Actions (CI/CD).

## Project Structure

This repository is structured as a **monorepo**, housing both the frontend and backend applications, along with shared infrastructure configurations.

```bash
<project-name>/
    ├── .github/
    │   └── workflows/          # Automated CI/CD pipelines (Lint, Test, Build)
    ├── apps/
    │   ├── frontend/           # Next.js frontend application
    │   │   ├── src/            # Client source code
    │   │   ├── Dockerfile 
    │   │   ├── README.md       # Frontend-specific documentation
    │   │   └── package.json
    │   └── backend/            # Django REST Framework API
    │       ├── src/            # API source code & settings
    │       ├── Dockerfile 
    │       ├── README.md       # Backend-specific documentation
    │       └── requirements.txt
    ├── docs/                   # Project documentation
    │   ├── frontend/
    │   └── backend/
    ├── .gitignore              # Global git ignore rules
    ├── docker-compose.yml      # Local development container orchestration
    └── README.md               # You are here
```

## Developer Guide & Workflow
From a developer's perspective, the project is designed to be easily testable and containerized. The GitHub Actions pipeline automatically runs linting, type-checking (Jest/Mypy), and test Docker builds on every push to the respective frontend or backend directories.

### Running the Entire Project Locally (Docker Compose)
The easiest way to spin up the entire application (Database + API + Web App) is by using Docker Compose. Make sure you have Docker installed and running.
1. Navigate to the root directory of the project.
2. Build and start the containers:
    ```bash
    docker compose up --build
    ```
3. The services will be available at:
    - **Frontend**: `http://localhost:3000`
    - **Backend**: `http://localhost:8000`
    - **PostgreSQL Databse**: `localhost:5432`

### Running Apps Individually
If you prefer to run the services locally without Docker (e.g., for faster debugging or adding specific packages), refer to the individual documentation files located in each app's directory:
 - 👉 [Frontend setup instructions](./apps/frontend/README.md)
 - 👉 [Backend setup instructions](./apps/backend/README.md)

### Future Cloud Deployment
This project is highly optimized for deployment in modern cloud environments. The architecture supports:
 - **Frontend Hosting**: Serverless deployment via Vercel or similar platforms (utilizing Next.js Standalone output).
 - **Backend Hosting**: PaaS platforms like Render or Heroku using Docker containers.
 - **Database**: Managed cloud PostgreSQL (e.g., Neon.tech, Supabase, or Render's free tier database) connected via database URLs.