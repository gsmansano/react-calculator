export class DivisionByZeroError extends Error {
  code: string;
  constructor(message: string = 'Division by zero is not allowed.') {
    super(message);
    this.name = 'DivisionByZeroError';
    this.code = 'DIVISION_BY_ZERO';
  }
}

export class InvalidOperandError extends Error {
  code: string;
  constructor(message: string) {
    super(message);
    this.name = 'InvalidOperandError';
    this.code = 'INVALID_OPERAND';
  }
}

/**
 * Normalizes a floating point number to mitigate IEEE 754 precision artifacts.
 * Bounds to a deterministic 10 decimal places and trims trailing zeros.
 */
export function normalizePrecision(value: number): number {
  if (!Number.isFinite(value)) {
    throw new InvalidOperandError('Result is not a finite number.');
  }
  return parseFloat(value.toFixed(10));
}

export function add(a: number, b: number): number {
  return normalizePrecision(a + b);
}

export function subtract(a: number, b: number): number {
  return normalizePrecision(a - b);
}

export function multiply(a: number, b: number): number {
  return normalizePrecision(a * b);
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new DivisionByZeroError();
  }
  return normalizePrecision(a / b);
}

export function power(a: number, b: number): number {
  return normalizePrecision(Math.pow(a, b));
}

export function sqrt(a: number): number {
  if (a < 0) {
    throw new InvalidOperandError('Cannot calculate the square root of a negative number.');
  }
  return normalizePrecision(Math.sqrt(a));
}

export function percentage(a: number): number {
  return normalizePrecision(a / 100);
}
