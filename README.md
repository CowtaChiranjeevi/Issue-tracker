# ⚡ IssueFlow — Enterprise Workflow & Issue Tracking System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

An enterprise-grade, full-stack issue management and Kanban workspace inspired by Jira and Linear. Designed and built by **Chiranjeevi Cowta** with a decoupled client-server architecture, atomic transaction guarantees, and an event-driven design philosophy.

> Click any section below to expand it.

---

<details>
<summary><b>📖 Executive Summary & Core Objectives</b></summary>
<br>

IssueFlow is designed to eliminate the latency, bloat, and fragmentation common in legacy project tracking applications. Built from the ground up using Java (Spring Boot) and modern React (TypeScript), it functions as an autonomous, self-hosted, or cloud-deployable platform for agile engineering squads.

### Foundational Objectives
- **Low Latency & High Responsiveness:** Zero-lag UI updates powered by optimistic drag-and-drop state reconciliation and minimal REST payloads.
- **Strict Role-Based Security:** Declarative, tokenized authorization securing operations at both the HTTP gateway and the database transaction layer.
- **Zero-Configuration Onboarding:** Containerized multi-service infrastructure (Docker Compose) allowing a developer to spin up the full production stack with a single command.
- **Resilient Data Consistency:** Enforced foreign key integrity, schema-level unique indexing, and automated entity audit timestamps (`createdAt`, `updatedAt`).

</details>

---

<details>
<summary><b>✨ Features at a Glance</b></summary>
<br>

| Area | What you get |
| --- | --- |
| **Authentication** | Registration and login, with stateless JWT sessions |
| **Authorization** | Role-based access enforced on the server, not just hidden in the UI |
| **Projects** | Create projects and open each one as its own workspace |
| **Issues** | Create, edit and delete issues with a status and a priority |
| **Kanban board** | Drag and drop issues between status columns with instant feedback |
| **Dark mode** | Light and dark themes, switchable from the navbar |
| **Validation and errors** | Every request is validated, and every failure returns a clean, consistent error response |
| **One-command setup** | The whole stack (database, API, UI) starts with Docker Compose |

</details>

---

<details>
<summary><b>🔍 How Each Feature Works</b> (step-by-step walkthroughs)</summary>
<br>

<details>
<summary>🔐 Registration, login and sessions</summary>
<br>

1. A new user fills in the registration form on the **Auth page**. The request is validated on the server (required fields, formats), and the password is stored only in hashed form.
2. On login, Spring Security checks the credentials. If they are correct, the server creates a **JSON Web Token (JWT)** signed with HMAC-SHA256/512 and returns it together with the user's details.
3. The frontend keeps the token in the `AuthContext` and attaches it to **every later request** automatically, using an Axios request interceptor. No page has to remember to send it.
4. On the server, the `JwtAuthenticationFilter` reads the `Bearer` token on each request, validates the signature and expiry, and loads the user. Nothing is stored in a server session, which is what "stateless" means.
5. A wrong password or an unknown user returns a clear error message that the form displays.
6. Logging out clears the token on the client, which ends the session.

</details>

<details>
<summary>🛡 Protected pages and role-based access</summary>
<br>

**In the browser**

1. Pages other than the Auth page are wrapped in a `ProtectedRoute`.
2. If there is no valid login, the user is sent back to the Auth page. If they are already logged in, the Auth page sends them on to their board.

**On the server**

1. Every API route except registration and login requires a valid token.
2. Each user has a **role** (`Role` enum). Spring Security checks that role before an operation runs, so a request that skips the UI and calls the API directly is still refused.
3. A request without permission gets a proper `401` or `403` response instead of a crash.

</details>

<details>
<summary>📁 Projects</summary>
<br>

1. After logging in, the user can create a project by giving it a name and a short description.
2. The request is checked by the Jakarta Validation rules on the request DTO. Invalid data is rejected with a readable message before it reaches the database.
3. The project is saved in one transaction, with its `createdAt` and `updatedAt` timestamps filled in automatically by the shared `BaseEntity`.
4. The projects appear as a list. Opening one takes the user to its Kanban board.

</details>

<details>
<summary>🎫 Creating and editing issues</summary>
<br>

1. Inside a project, the user opens the issue **Modal** and fills in a title, a description, a **priority** (`IssuePriority`) and a starting **status** (`IssueStatus`).
2. The server validates the input and links the issue to its project and to the user who created it. Foreign keys make sure an issue cannot point at a project or user that does not exist.
3. Editing an issue works the same way. The `updatedAt` timestamp changes automatically each time, which gives every issue a built-in audit trail.
4. Deleting an issue removes it in a single transaction. If anything fails halfway, nothing is changed.

</details>

<details>
<summary>🗂 Kanban board with drag and drop</summary>
<br>

**What the user sees:** one column for each issue status, with issue cards inside. Cards can be dragged from one column to another.

1. The `BoardPage` loads the project's issues and groups them into columns by status.
2. Dragging is handled by `@hello-pangea/dnd`. When the user drops a card in a new column, the card **moves on screen immediately**, without waiting for the server. This is the optimistic update that keeps the board feeling instant.
3. In the background the app sends the new status to the API, which saves the change in a transaction.
4. The board then reconciles with the server's response, so what is on screen always matches what is stored.

</details>

<details>
<summary>🌙 Dark mode</summary>
<br>

1. The `ThemeContext` keeps the current theme (light or dark) for the whole app.
2. The navbar toggle switches it. The app adds or removes a `dark` marker, and Tailwind v4's `@custom-variant dark` styles apply to every component at once.
3. Components only declare their light and dark colors once, and the theme does the rest.

</details>

<details>
<summary>⚠️ Validation and error handling</summary>
<br>

1. Request DTOs are immutable Java records with Jakarta Validation annotations, so bad input is rejected at the door.
2. A single `GlobalExceptionHandler` catches validation errors, missing records, permission errors and unexpected failures.
3. Each one is turned into a predictable JSON error with the right HTTP status. The frontend can display the message without special cases.

</details>

</details>

---

<details>
<summary><b>🛠 Complete Technology Stack & Specifications</b></summary>
<br>

### Backend Architecture
- **Language & Runtime:** Java 21 / OpenJDK
- **Framework:** Spring Boot 3.4.x
- **Application Container:** Apache Tomcat (Embedded)
- **Security & Authorization:** Spring Security 6 with stateless `Bearer` JSON Web Tokens (JWT) signed via HMAC-SHA256/512
- **Data Persistence:** Spring Data JPA with Hibernate 7 ORM
- **Database Connection Pooling:** HikariCP
- **Validation Engine:** Jakarta Validation API (Hibernate Validator)
- **Boilerplate Reduction:** Project Lombok (Getters, Setters, Builders, Loggers)
- **Build & Dependency Automation:** Apache Maven Wrapper (`./mvnw`)

### Frontend Architecture
- **Core Library:** React 18
- **Tooling & Bundler:** Vite (featuring Hot Module Replacement - HMR)
- **Language Dialect:** TypeScript (Strict Type Mode enabled)
- **Drag-and-Drop Engine:** `@hello-pangea/dnd` (Clean React 18/TypeScript fork of `react-beautiful-dnd`)
- **Design System & Styling:** Tailwind CSS v4 using CSS-first `@import "tailwindcss";` and `@custom-variant dark`
- **Routing Engine:** React Router DOM v6
- **HTTP Client:** Axios with dynamic request interceptors and token propagation
- **Iconography:** Lucide React

### Infrastructure & Database
- **Relational Storage:** PostgreSQL 16
- **Containerization:** Docker & Docker Compose (`docker-compose.yml`)
- **Hosting Targets:** Vercel (Frontend SPA), Render/Railway (Backend API Service), Neon.tech (Managed Cloud PostgreSQL)

</details>

---

<details>
<summary><b>🏛 Architectural Patterns & Codebase Organization</b></summary>
<br>

IssueFlow enforces a clean separation of concerns using a strictly layered enterprise architecture:

```text
issue-tracker/
├── backend/
│   ├── src/main/java/com/tracker/
│   │   ├── config/             # Spring Security, CORS, and Application Beans
│   │   ├── controller/         # RESTful HTTP endpoints exposing JSON contracts
│   │   ├── dto/                # Immutable Record Transfer Objects (Request/Response)
│   │   │   ├── auth/           # Login, Registration, and User Token payloads
│   │   │   ├── issue/          # Issue creation, update, and projection models
│   │   │   └── project/        # Project creation and summary schemas
│   │   ├── exception/          # GlobalExceptionHandler and Custom Domain Exceptions
│   │   ├── model/              # JPA Entities (User, Project, Issue, BaseEntity)
│   │   │   └── enums/          # IssueStatus, IssuePriority, Role
│   │   ├── repository/         # Spring Data JPA Repository interfaces
│   │   ├── security/           # JwtAuthenticationFilter, JwtTokenProvider, UserDetails
│   │   └── service/            # Core Transactional business logic
│   └── src/main/resources/     # application.yml and runtime configuration
├── frontend/
│   ├── public/                 # Static assets, SVG favicons, web manifests
│   ├── src/
│   │   ├── api/                # Central Axios client and interceptor configurations
│   │   ├── components/         # Reusable atomic UI (Navbar, Modal, ProtectedRoute)
│   │   ├── context/            # React Context Providers (AuthContext, ThemeContext)
│   │   ├── pages/              # Composite Views (AuthPage, BoardPage)
│   │   ├── types/              # TypeScript interface definitions and enum unions
│   │   ├── App.tsx             # Root Layout, Routing Table, and Context Tree
│   │   └── index.css           # Tailwind v4 Directives and Custom Variant Rules
│   └── index.html              # HTML5 Shell and document metadata
└── docker-compose.yml          # Local containerized infrastructure orchestrator
```

</details>

---

<details>
<summary><b>🔄 How a Request Travels Through the Backend</b></summary>
<br>

Every request follows the same path, which keeps the code predictable and easy to test.

1. **Filter:** `JwtAuthenticationFilter` reads the `Bearer` token, validates it and identifies the user.
2. **Controller:** the matching endpoint receives the request, and the DTO record is validated.
3. **Service:** the business logic runs inside a transaction, so changes are saved completely or not at all.
4. **Repository:** Spring Data JPA reads from or writes to PostgreSQL through Hibernate, using the HikariCP connection pool.
5. **Response:** the result is mapped to a response DTO and returned as JSON. If anything fails on the way, `GlobalExceptionHandler` converts it into a clean error response.

Entities never go straight to the client. DTOs sit in between, so the database layout and the API contract can change independently.

</details>

---

<details>
<summary><b>🚀 Getting Started</b></summary>
<br>

**Requirements:** Docker and Docker Compose for the quick start. For a manual setup you also need JDK 21, Node.js 18+ and PostgreSQL 16.

### Option 1: One command with Docker

```bash
git clone https://github.com/CowtaChiranjeevi/issue-tracker.git
cd issue-tracker
docker compose up --build
```

Docker starts the database, the backend API and the frontend together.

### Option 2: Run each part yourself

**1. Database:** create a PostgreSQL 16 database and put its connection details in `backend/src/main/resources/application.yml` (or the matching environment variables).

**2. Backend**
```bash
cd backend
./mvnw spring-boot:run
```

**3. Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev
```

Open the address Vite prints in the terminal, register an account, and create your first project.

**Useful commands**
```bash
./mvnw test          # run backend tests
./mvnw clean package # build the backend jar
npm run build        # production build of the frontend
```

</details>

---

<details>
<summary><b>☁️ Deployment</b></summary>
<br>

The app is split into three independent pieces, each suited to a free or low-cost host:

| Piece | Suggested host | Notes |
| --- | --- | --- |
| Frontend (React SPA) | Vercel | Point it at the deployed API URL |
| Backend (Spring Boot API) | Render or Railway | Set the database URL and the JWT secret as environment variables |
| Database (PostgreSQL) | Neon.tech | Managed cloud PostgreSQL |

After deploying, allow the frontend's address in the backend's CORS settings (`config/`) so the browser can call the API.

</details>

---

<details>
<summary><b>🔒 Security Notes</b></summary>
<br>

- Tokens are signed, so they cannot be changed by the client without detection.
- The signing secret and database password belong in environment variables, never in the repository.
- Passwords are stored only as hashes.
- Authorization is enforced on the server for every protected route, so hiding a button in the UI is never the only protection.
- CORS is configured explicitly in `config/`.

</details>

---

<details>
<summary><b>📜 License</b></summary>
<br>

Released under the MIT License. See the [LICENSE](LICENSE) file for details.

</details>

---

## 👤 Author

**Chiranjeevi Cowta**

- GitHub: [@CowtaChiranjeevi](https://github.com/CowtaChiranjeevi)

Designed, built and maintained by Chiranjeevi Cowta as a full-stack portfolio project.
