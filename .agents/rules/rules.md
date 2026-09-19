---
trigger: always_on
---

# Architectural Rules & Guardrails - Full-Stack Calculator

## 1. Core Stack & Constraints

- **Frontend (`web/`):** React built with Vite, TypeScript (strict mode, zero-`any` policy), and Tailwind CSS for styling.
- **Backend (`api/`):** Node.js LTS running Express and TypeScript (strict mode, zero-`any` policy), exposing a typed REST API.
- **Validation:** Zod schemas enforcing strict validation on incoming calculation payloads (binary requires `{ a, b }`; unary requires `{ a }` with `b` optional/omitted).
- **Testing:**
  - Backend: Vitest or Jest with `supertest` for table-driven domain and API integration tests.
  - Frontend: Vitest + React Testing Library for UI state and interaction tests.
- **Language & Communication:** English strictly for all code, variable names, endpoints, commit messages, and documentation.

## 2. Code Standards & In-Code Documentation

- **Minimal In-Code Commentary:** Avoid unnecessary comments explaining obvious syntax. Explain complex logic or architectural reasons outside the code itself (in docs or review summaries). Preserve in-code comments only for mathematical edge-case decisions (e.g., IEEE 754 precision mitigation).
- **Type Safety:** Shared data contracts for payload and response schemas between client and server. No implicit or explicit `any`.
- **Pure Domain Functions:** Keep arithmetic calculations isolated in a pure domain layer (`api/src/domain/`) decoupled from Express HTTP request/response objects to guarantee testability.

## 3. Autonomous Dev Guardrails (STRICT)

- **Step-by-Step Execution:** Complete ONLY the assigned atomic tasks (maximum 1–3 steps at a time depending on complexity). Immediately pause for review and user confirmation before moving forward.
- **Review & Commit Lifecycle:**
  1. **Execute:** Implement the assigned atomic step.
  2. **Review & Reflect:** Verify precision edge cases (e.g., division by zero, floating-point rounding), status codes, and tests.
  3. **Pause for Approval:** DO NOT stage (`git add`) or commit (`git commit`) files automatically. Wait for user verification.
  4. **Commit:** Commit only after explicit approval using lowercase Conventional Commits (e.g., `feat(api): implement precision arithmetic engine`, `test(web): add keypad click interaction tests`).
  5. **Log:** 
     - **`.agents/logs/`:** Personal daily session ledger recording granular task completions and file touches.
     - **`PROMPT_LOG.md`:** Root-level assessment deliverable documenting each prompt used and a 1–2 sentence summary of actions taken (Format: `### Prompt [N]`, `**Prompt:** <prompt text>`, `**Action Taken:** <1-2 sentence summary>`).

## 4. Workspace Repository Topology

- **Single Monorepo Structure:** The root workspace contains both `web/` and `api/` along with root-level documentation and orchestration.
- **Git Context:** Standard Git operations run from the repository root, with clear scopes in commit messages targeting either `web`, `api`, `docs`, or `ci`.

## 5. Architectural Rules & Patterns

- **Separation of Concerns:**
  - `api/src/domain/`: Pure calculation functions (no HTTP knowledge).
  - `api/src/handlers/`: Route handlers responsible solely for input parsing, validation, calling domain logic, and returning JSON.
  - `web/src/services/`: Centralized API fetch wrapper to consume backend endpoints.
  - `web/src/hooks/`: Isolated state machine hook (`useCalculator`) managing input buffer, accumulator, operations, and error states.
- **Dedicated REST Endpoints:** Hosted under `/api/v1/` (`/add`, `/subtract`, `/multiply`, `/divide`, `/power`, `/sqrt`, `/percentage`).
- **Precision Guard:** Floating-point outputs must be bounded to 10 decimal places to eliminate IEEE 754 artifacts (e.g., `0.1 + 0.2 === 0.3`).
- **Standardized Error Responses:** Always return structured JSON errors with consistent shape:
  ```json
  {
    "error": "ERROR_CODE",
    "message": "Human-readable explanation.",
    "status": 400
  }
  ```

## 6. Directory Map

```text
react-calculator/
├── .agents/                    # Agent rules, workflows, and logs
│   ├── logs/                   # Execution logs
│   ├── rules/rules.md          # Architectural rules & guardrails
│   └── workflows/              # Workflow definitions
├── web/                        # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Calculator UI, Display, Keypad, ThemeToggle
│   │   ├── hooks/              # useCalculator state hook
│   │   ├── services/           # API client
│   │   └── types/              # Contract types
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── api/                        # Node.js + TypeScript Microservice
│   ├── src/
│   │   ├── domain/             # Core math logic
│   │   ├── handlers/           # Express route handlers
│   │   ├── middleware/         # CORS, error handling
│   │   └── server.ts           # Express app entry point
│   ├── tests/                  # Table-driven unit and integration tests
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml          # Container orchestration
├── PROMPT_LOG.md               # Prompt engineering and orchestration trace
├── ARCHITECTURE.md             # System technical specification
├── MILESTONES.md               # Execution roadmap
├── README.md                   # Setup instructions, API examples, and rationale
└── .gitignore                  # Git ignore rules
```
