# System Architecture & Technical Specification

## 1. System Overview

The application is a full-stack, decoupled calculator system designed for high precision, clean UI presentation, and deterministic arithmetic execution within a single monorepo.

- **`web/` (Client):** Single-page application built with React, Vite, and TypeScript (Strict Mode), styled with Tailwind CSS. It renders a clean, hardware-inspired digital calculator supporting click/tap interactions, keyboard input, dark/light theme switching, and real-time error banners.
- **`api/` (Microservice):** Lightweight, strictly-typed REST microservice built with Node.js LTS, Express, and TypeScript (Strict Mode). It provides input validation using Zod, bounds precision arithmetic to prevent IEEE 754 floating-point artifacts, and returns uniform JSON responses.

```
[Client: web/] ---> POST /api/v1/{operation} { a, b? } ---> [Server: api/]
[Client: web/] <--- HTTP 200 OK / HTTP 400 Bad Request <--- [Server: api/]
```

---

## 2. API Contract & Data Schemas

### 2.1 Dedicated Calculation Endpoints

All endpoints are hosted under `/api/v1/` and accept HTTP `POST` requests with `Content-Type: application/json`.

| Endpoint | Type | Operation | Payload Requirements | Formula |
|---|---|---|---|---|
| `POST /api/v1/add` | Binary | Addition | `a: number`, `b: number` | `a + b` |
| `POST /api/v1/subtract` | Binary | Subtraction | `a: number`, `b: number` | `a - b` |
| `POST /api/v1/multiply` | Binary | Multiplication | `a: number`, `b: number` | `a * b` |
| `POST /api/v1/divide` | Binary | Division | `a: number`, `b: number` | `a / b` |
| `POST /api/v1/power` | Binary | Exponentiation | `a: number`, `b: number` | `a ^ b` |
| `POST /api/v1/sqrt` | Unary | Square Root | `a: number` (`b` omitted/optional) | `√a` |
| `POST /api/v1/percentage` | Unary | Percentage | `a: number` (`b` omitted/optional) | `a / 100` |

### 2.2 Request Payload Schemas

#### Binary Operations (`add`, `subtract`, `multiply`, `divide`, `power`)
Operand `b` is **strictly required**:
```json
{
  "a": 12.5,
  "b": 3.5
}
```

#### Unary Operations (`sqrt`, `percentage`)
Operand `b` is **optional/omitted**; only operand `a` is evaluated:
```json
{
  "a": 64
}
```

### 2.3 Response Schemas

#### Success Response (`HTTP 200 OK`):
```json
{
  "result": 8,
  "operation": "sqrt",
  "formatted": "8"
}
```

#### Client / Validation Error (`HTTP 400 Bad Request` or `HTTP 422 Unprocessable Entity`):
All errors return a standardized JSON envelope:
```json
{
  "error": "DIVISION_BY_ZERO",
  "message": "Division by zero is mathematically undefined.",
  "status": 400
}
```

Standard Error Codes:
- `INVALID_PAYLOAD`: Missing or non-numeric operands.
- `DIVISION_BY_ZERO`: Attempted division when `b === 0`.
- `INVALID_OPERAND`: Attempted square root of a negative number (`a < 0`).
- `OVERFLOW`: Calculation exceeded `Number.MAX_VALUE` or returned infinite values.

---

## 3. Mathematical & System Boundary Rules

1. **Floating-Point Precision Guard (IEEE 754 Mitigation):**
   - Binary floating-point arithmetic produces known representation artifacts (e.g., `0.1 + 0.2 === 0.30000000000000004`).
   - Strategy: The pure domain calculation layer bounds floating-point results to a deterministic **10 decimal places** using standard decimal rounding (`Number(result.toFixed(10))`), stripping trailing zeros so that `0.1 + 0.2` returns `0.3`.
2. **Division by Zero:**
   - Evaluated before computation in the `/api/v1/divide` handler and domain logic.
   - Immediately returns HTTP 400 with `DIVISION_BY_ZERO`.
3. **Negative Square Root:**
   - Evaluated in `/api/v1/sqrt`. If `a < 0`, computation is rejected with HTTP 400 `INVALID_OPERAND` to avoid returning `NaN`.
4. **Percentage Semantics:**
   - Strictly unary: `percentage(a) = a / 100`.
   - When a user enters `50` and clicks `%`, the client dispatches `{ a: 50 }` to `/api/v1/percentage`, immediately yielding `0.5`.
5. **CORS Configuration:**
   - Enabled for `http://localhost:5173` (Vite dev server) and production frontends.

---

## 4. Frontend State Machine & Accumulator Specifications (`web/`)

The client manages state using an isolated custom hook (`useCalculator`):

### 4.1 State Model
```typescript
interface CalculatorState {
  currentInput: string;            // Buffer for current digits entered (e.g. "42.5")
  previousOperand: number | null;  // Stored accumulator value from prior step
  pendingOperator: Operator | null;// Stored binary operator awaiting second operand
  displayValue: string;            // Primary string rendered on the display screen
  expressionSummary: string;       // Secondary line showing running expression (e.g., "12 + ")
  isNewInput: boolean;             // True if the next digit pressed should overwrite display
  isLoading: boolean;              // True while waiting for REST API response
  errorMessage: string | null;     // Error banner state (e.g., "Division by zero")
}
```

### 4.2 State Transitions & Accumulator Logic
1. **Digit Entry:** Appends digits to `currentInput`. Prevents multiple decimal points (`.`).
2. **Unary Trigger (`sqrt`, `%`):**
   - Takes current value of `currentInput` (or `displayValue`) as `a`.
   - Calls `/api/v1/sqrt` or `/api/v1/percentage` immediately.
   - Replaces `currentInput` and `displayValue` with the result; sets `isNewInput = true`.
3. **Binary Operator Trigger (`+`, `-`, `*`, `/`, `^`):**
   - If a binary operation is already pending and `isNewInput` is false:
     - Automatically chains: dispatches calculation with `previousOperand`, `pendingOperator`, and `currentInput`.
     - Updates `previousOperand` with the returned result.
   - Sets `pendingOperator` to the newly selected operator, records `expressionSummary`, and sets `isNewInput = true`.
4. **Equals Trigger (`=`):**
   - If `previousOperand !== null` and `pendingOperator !== null`:
     - Dispatches calculation to the corresponding `/api/v1/{operation}` endpoint with `a = previousOperand`, `b = Number(currentInput)`.
     - Displays `result`, clears `pendingOperator`, sets `previousOperand = null`, sets `isNewInput = true`.
5. **Clear / All Clear (`C` / `AC`):**
   - `C` (Clear Entry): Clears current input buffer to `"0"`.
   - `AC` (All Clear): Resets all state variables (`previousOperand = null`, `pendingOperator = null`, `errorMessage = null`).

---

## 5. UI/UX Specifications (`web/`)

- **Design Aesthetic:** Clean digital hardware calculator styling:
  - Top header with application title and Dark/Light Mode toggle.
  - Multi-line digital display:
    - Primary line: Large, high-contrast current operand / result.
    - Secondary line: Expression trace (e.g., `25 × 4`).
    - Status/Error indicator: Non-intrusive warning badge for network or math errors.
  - Keypad Layout:
    - Distinct visual treatments for Digits, Primary Operators (`+`, `-`, `*`, `/`), Advanced/Unary Operators (`x^y`, `√`, `%`), and Actions (`AC`, `C`, `=`).
    - Responsive layout with desktop click and mobile touch support.
    - Keyboard listener for standard numpad and operator keys.

---

## 6. Monorepo Directory Layout

```text
react-calculator/
├── .agents/                    # Agent workflows, rules, and daily logs
│   ├── logs/                   # Daily execution logs
│   ├── rules/rules.md          # Architectural rules & guardrails
│   └── workflows/              # Workflow definitions
├── web/                        # React + TypeScript Frontend (Vite)
│   ├── src/
│   │   ├── components/         # Calculator, Display, Keypad, ThemeToggle
│   │   ├── hooks/              # useCalculator state hook
│   │   ├── services/           # API fetch client
│   │   └── types/              # Shared data contracts
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── api/                        # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── domain/             # Pure math logic (zero HTTP dependencies)
│   │   ├── handlers/           # Express route handlers
│   │   ├── middleware/         # Error handling, CORS, request logging
│   │   └── server.ts           # App setup and route registration
│   ├── tests/                  # Table-driven unit and integration tests
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml          # Container orchestration (optional)
├── PROMPT_LOG.md               # Prompt engineering log
├── ARCHITECTURE.md             # System architecture specification
├── MILESTONES.md               # Project roadmap and milestone tracker
├── README.md                   # Setup guide, API examples, and design rationale
└── .gitignore                  # Root Git ignore rules
```
