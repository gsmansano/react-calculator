# React + Node.js Full-Stack Calculator Monorepo

A robust, full-stack calculator application built with a React (Vite) frontend and a Node.js (Express) backend API. The project demonstrates strict architectural boundaries, comprehensive testing, pure domain modeling, and containerized deployment.

## 1. Project Overview & Architecture

This repository operates as a monorepo containing two distinct workspaces:

- **`api/` (Backend):** A Node.js + Express microservice written in strict TypeScript.
  - **Pure Domain Modeling:** Mathematical calculations are isolated in a pure domain layer (`src/domain/calculator.ts`). This guarantees that core business logic is completely decoupled from Express HTTP request/response objects.
  - **Zod Validation:** All incoming HTTP requests are strictly validated at the boundary (`src/schemas/calculator.schema.ts`), guaranteeing runtime type safety and defensive API design.
  - **Standardized Error Contracts:** A centralized error-handling middleware ensures predictable, structured JSON responses.

- **`web/` (Frontend):** A React SPA built with Vite, TypeScript, and Tailwind CSS.
  - **Separation of Concerns:** The UI is strictly separated from business logic. The `useCalculator` hook acts as an isolated state machine managing input buffers and operations.
  - **API Client Layer:** Network operations are abstracted into `calculatorApi.ts`, wrapping the backend endpoints in strongly typed generic functions.
  - **Premium Aesthetics:** Glassmorphism UI elements, dark mode support via `ThemeToggle`, fluid micro-animations, and CSS-based responsive layouts.

## 2. Design Decisions & Assumptions

- **TypeScript Over Alternatives:** Node.js + TypeScript was selected over alternatives (e.g., Go) to enable unified, shared interfaces across the frontend and backend. This allows seamless boundary validation via Zod and maintains high developer velocity without the heavy boilerplate typically associated with traditional microservices.
- **Precision Mitigation:** Standard JavaScript IEEE-754 floating-point errors (e.g., `0.1 + 0.2 = 0.30000000000000004`) are bounded at the backend domain layer to 10 decimal places with trailing zero truncation.
- **Idiomatic API Response Handling:** The `calculatorApi` relies on standard `fetch` response checking (`response.ok`) combined with a custom `CalculatorApiError` wrapper rather than complex manual runtime type checks, leading to a much cleaner service contract mapping.
- **Defensive UI State:** Async network operations trigger a strict `isLoading` guard. Keypad buttons are visually disabled, and an early return guard on `window` keyboard events intercepts 'ghost inputs' preventing race conditions while waiting for the server.
- **Proxy Strategies:** During local development, Vite dynamically proxies `/api` to Express. In Docker production, Nginx handles static file serving while applying an identical reverse-proxy behavior, ensuring identical path structures across environments.
- **Strict Boundary Validation:** Zod enforces exactly `{ a }` for unary schemas and `{ a, b }` for binary schemas, throwing early 400s and standardizing error output if malformed JSON is received.

### AI-Assisted Development Workflow

This project utilized a dual-model autonomous AI engineering setup:

- **Gemini 3.8 Flash:** Acted as the interactive engineering assistant and thought partner (scaffolding prompts, reviewing logs, and guiding architectural requirements).
- **Gemini 3.1 Pro:** Operated as the coder and implementation engine (writing application code, generating test suites, refactoring, and enforcing zero-any strict typing constraints).

## 3. Getting Started (Local Development)

### Prerequisites

- Node.js (v20+ recommended)
- npm (v10+)

### Running the API (Backend)

```bash
cd api
npm install
npm run dev
```

The backend server will launch on `http://localhost:3001`.

### Running the Web App (Frontend)

Open a new terminal window:

```bash
cd web
npm install
npm run dev
```

The Vite development server will launch on `http://localhost:5173`. API calls are automatically proxied to the backend via Vite.

## 4. Getting Started (Docker Compose)

For a seamless deployment or testing environment, use Docker Compose. This boot configuration builds both the `api` and `web` containers and orchestrates their networking.

```bash
docker compose up --build
```

- **Access Point:** The React application is served by an Alpine Nginx reverse proxy exposed on `http://localhost:8080`.
- **Internal Networking:** Nginx automatically proxies all `/api/*` traffic across the internal Docker bridge network directly to the `api:3001` container service.

## 5. API Reference & Sample cURL Calls

The backend exposes standardized REST endpoints under `/api/v1/`.

### Binary Operations (`/add`, `/subtract`, `/multiply`, `/divide`, `/power`)

Requires a payload of `{ a: number, b: number }`.

**Example:**

```bash
curl -X POST http://localhost:3001/api/v1/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 2}'
```

**Success Response:**

```json
{
  "result": 5
}
```

**Error Response (Division by Zero):**

```json
{
  "error": "MATH_ERROR",
  "message": "Division by zero",
  "status": 400
}
```

### Unary Operations (`/sqrt`, `/percentage`)

Requires a payload of `{ a: number }`.

**Example:**

```bash
curl -X POST http://localhost:3001/api/v1/sqrt \
  -H "Content-Type: application/json" \
  -d '{"a": 16}'
```

**Success Response:**

```json
{
  "result": 4
}
```

## 6. Test Coverage & Quality

The project features a comprehensive suite of 26 automated unit and end-to-end integration tests using Vitest and React Testing Library.

### Backend (`api/`) Coverage (~96.5%)

```text
 % Coverage report from v8
-----------------------|---------|----------|---------|---------|-------------------
File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------|---------|----------|---------|---------|-------------------
All files              |   96.49 |    94.73 |     100 |   96.49 |
 src                   |     100 |      100 |     100 |     100 |
  app.ts               |     100 |      100 |     100 |     100 |
 src/domain            |     100 |      100 |     100 |     100 |
  calculator.ts        |     100 |      100 |     100 |     100 |
 src/middleware        |      75 |    91.66 |     100 |      75 |
  errorHandler.ts      |      75 |    91.66 |     100 |      75 | 32-33
 src/routes/v1         |     100 |      100 |     100 |     100 |
  calculator.routes.ts |     100 |      100 |     100 |     100 |
 src/schemas           |     100 |      100 |     100 |     100 |
  calculator.schema.ts |     100 |      100 |     100 |     100 |
-----------------------|---------|----------|---------|---------|-------------------
```

### Frontend (`web/`) Coverage (~77%)

```text
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-----------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-----------------------
All files          |   76.92 |    65.58 |   75.55 |    79.8 |
 src               |    62.5 |    56.66 |     100 |   63.33 |
  App.tsx          |    62.5 |    56.66 |     100 |   63.33 | 33,35,37,41-42,46-51
 src/components    |   64.28 |    80.55 |   56.52 |   64.28 |
  Display.tsx      |     100 |    83.33 |     100 |     100 | 12,40
  Keypad.tsx       |    62.5 |      100 |   52.63 |    62.5 | 61,66,68-71,73-78,86
  ThemeToggle.tsx  |      60 |    58.33 |   66.66 |      60 | 12,17-22
 src/hooks         |    83.6 |    64.86 |     100 |   88.78 |
  useCalculator.ts |    83.6 |    64.86 |     100 |   88.78 | 40-44,107-110,114-117
 src/services      |      84 |       50 |      80 |    87.5 |
  calculatorApi.ts |      84 |       50 |      80 |    87.5 | 86-89
-------------------|---------|----------|---------|---------|-----------------------
```
