import { useState } from 'react';

export type BinaryOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power';
export type UnaryOperation = 'sqrt' | 'percentage';

const opSymbols: Record<BinaryOperation, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  power: '^'
};

// Precision guard
const normalizePrecision = (value: number): number => {
  return parseFloat(value.toFixed(10));
};

const localCalculate = (a: number, b: number, op: BinaryOperation): number => {
  switch (op) {
    case 'add': return normalizePrecision(a + b);
    case 'subtract': return normalizePrecision(a - b);
    case 'multiply': return normalizePrecision(a * b);
    case 'divide':
      if (b === 0) throw new Error('DIVISION_BY_ZERO');
      return normalizePrecision(a / b);
    case 'power': return normalizePrecision(Math.pow(a, b));
    default: return b;
  }
};

const localUnaryCalculate = (a: number, op: UnaryOperation): number => {
  switch (op) {
    case 'sqrt':
      if (a < 0) throw new Error('INVALID_OPERAND');
      return normalizePrecision(Math.sqrt(a));
    case 'percentage': return normalizePrecision(a / 100);
    default: return a;
  }
};

export const useCalculator = () => {
  const [display, setDisplay] = useState<string>('0');
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [operation, setOperation] = useState<BinaryOperation | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expression, setExpression] = useState<string>('');

  const inputDigit = (digit: string) => {
    if (error) setError(null);
    if (waitingForOperand) {
      if (operation === null) {
        setExpression('');
      }
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(prev => prev === '0' ? digit : prev + digit);
    }
  };

  const inputDecimal = () => {
    if (error) setError(null);
    if (waitingForOperand) {
      if (operation === null) {
        setExpression('');
      }
      setDisplay('0.');
      setWaitingForOperand(false);
    } else {
      setDisplay(prev => prev.indexOf('.') === -1 ? prev + '.' : prev);
    }
  };

  const clear = () => {
    setDisplay('0');
    if (error) setError(null);
  };

  const allClear = () => {
    setDisplay('0');
    setAccumulator(null);
    setOperation(null);
    setWaitingForOperand(false);
    setError(null);
    setExpression('');
  };

  const toggleSign = () => {
    if (error) setError(null);
    if (display === '0') return;
    setDisplay(prev => prev.startsWith('-') ? prev.substring(1) : '-' + prev);
  };

  const setBinaryOperation = (op: BinaryOperation) => {
    if (error) setError(null);
    const inputValue = parseFloat(display);

    if (accumulator === null) {
      setAccumulator(inputValue);
      setExpression(`${inputValue} ${opSymbols[op]}`);
    } else if (operation && !waitingForOperand) {
      try {
        const result = localCalculate(accumulator, inputValue, operation);
        setAccumulator(result);
        setDisplay(String(result));
        setExpression(`${result} ${opSymbols[op]}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'UNKNOWN_ERROR');
        setAccumulator(null);
        setOperation(null);
        setWaitingForOperand(true);
        return;
      }
    } else if (operation && waitingForOperand) {
      setExpression(`${accumulator} ${opSymbols[op]}`);
    }

    setOperation(op);
    setWaitingForOperand(true);
  };

  const applyUnaryOperation = (op: UnaryOperation) => {
    const inputValue = parseFloat(display);
    try {
      const result = localUnaryCalculate(inputValue, op);
      setDisplay(String(result));
      setWaitingForOperand(true);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'UNKNOWN_ERROR');
      setWaitingForOperand(true);
    }
  };

  const evaluate = () => {
    if (operation === null || accumulator === null) return;

    const inputValue = parseFloat(display);
    try {
      const result = localCalculate(accumulator, inputValue, operation);
      setExpression(`${accumulator} ${opSymbols[operation]} ${display} =`);
      setDisplay(String(result));
      setAccumulator(null);
      setOperation(null);
      setWaitingForOperand(true);
      if (error) setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'UNKNOWN_ERROR');
      setAccumulator(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  return {
    display,
    accumulator,
    operation,
    waitingForOperand,
    error,
    expression,
    inputDigit,
    inputDecimal,
    clear,
    allClear,
    toggleSign,
    setBinaryOperation,
    applyUnaryOperation,
    evaluate
  };
};
