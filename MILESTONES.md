# Milestone Execution Plan: Full-Stack Calculator

**Target Completion:** Under 4 hours of active development across sequential, verifiable stages.

---

## Milestone 0: Workspace Setup & Contract Definition

- **Scope:**
  - Initialize Git repository with root `.gitignore`.
  - Finalize `ARCHITECTURE.md`, `MILESTONES.md`, and empty `PROMPT_LOG.md`.
  - Establish root workspace structure, ignore rules, and documentation baseline.
- **Exit Criteria:** Clean directory structure established; shared API contracts defined.

---

## Milestone 1: Backend Domain Logic & Unit Tests

- **Scope:**
  - Implement pure math domain module (`api/src/domain/calculator.ts`) covering:
    - Binary operations: `add`, `subtract`, `multiply`, `divide`, `power`.
    - Unary operations: `sqrt`, `percentage` (`a / 100`).
  - Implement IEEE 754 precision bounding (10 decimal places, trimming trailing zeros).
  - Implement mathematical guardrails: division by zero, negative square root, overflow detection.
  - Write comprehensive, table-driven unit tests verifying boundary values and floating-point edge cases.
- **Exit Criteria:** Domain test suite passes with >90% coverage.

---

## Milestone 2: Backend HTTP Server, Dedicated Endpoints & Validation

- **Scope:**
  - Scaffold Express application with CORS, JSON body parser, and centralized error handler.
  - Implement Zod validation schemas enforcing:
    - Binary routes (`/add`, `/subtract`, `/multiply`, `/divide`, `/power`): requires `{ a, b }`.
    - Unary routes (`/sqrt`, `/percentage`): requires `{ a }` (with `b` omitted/optional).
  - Implement route handlers under `/api/v1/`.
  - Return standardized JSON errors with appropriate HTTP status codes (`400`, `422`, `500`).
  - Add integration tests using `supertest` for all endpoints with valid and invalid payloads.
- **Exit Criteria:** Server runs locally; table-driven integration tests pass with coverage report.

---

## Milestone 3: Frontend Calculator Interface & State Machine

- **Scope:**
  - Initialize React + TypeScript application with Vite and Tailwind CSS.
  - Implement `useCalculator` hook managing the accumulator state machine:
    - Digit buffering, decimal point guard, negative toggle.
    - Chained binary operations and accumulator storage.
    - Immediate dispatch for unary triggers (`sqrt`, `%`).
    - Clear (`C`) and All Clear (`AC`).
  - Build UI components:
    - `Display`: current operand, secondary expression summary, status badges.
    - `Keypad`: button grid with distinct styles for digits, operations, and actions.
    - `ThemeToggle`: dark and light mode switch.
  - Write unit tests for component rendering and keypad interactions using React Testing Library.
- **Exit Criteria:** Keypad interactions work with local state formatting; UI tests pass.

---

## Milestone 4: Client-to-Server Integration & Error Handling

- **Scope:**
  - Implement typed API client (`web/src/services/calculatorApi.ts`) calling `/api/v1/*`.
  - Wire `useCalculator` hook to trigger API calls for unary and binary evaluations.
  - Implement loading states (spinner / disabled buttons) during network operations.
  - Display non-intrusive error banners on server validation errors (e.g., division by zero).
  - Add end-to-end integration tests mocking API responses.
- **Exit Criteria:** Full round-trip calculation verified from UI to backend and back.

---

## Milestone 5: Polish, Containerization & Submission Preparation

- **Scope:**
  - Create multi-stage `Dockerfile` for `api/` and `web/` + root `docker-compose.yml`.
  - Generate test coverage reports for both backend and frontend.
  - Finalize `README.md` with:
    - Clear setup and startup instructions (local dev & Docker).
    - Design decisions, assumptions, and architecture rationale.
    - Sample `curl` commands for all endpoints with response examples.
  - Update and verify complete trace in `PROMPT_LOG.md`.
- **Exit Criteria:** Monorepo builds cleanly; Docker container boots with one command; passes all tests.
