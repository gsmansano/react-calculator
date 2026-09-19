import { useState } from 'react';
import { calculatorApi, CalculatorApiError } from '../services/calculatorApi';

export type BinaryOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power';
export type UnaryOperation = 'sqrt' | 'percentage';

const opSymbols: Record<BinaryOperation, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  power: '^'
};

export const useCalculator = () => {
  const [display, setDisplay] = useState<string>('0');
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [operation, setOperation] = useState<BinaryOperation | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expression, setExpression] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const backspace = () => {
    if (error || waitingForOperand) return;
    if (display.length > 1) {
      if (display.length === 2 && display.startsWith('-')) {
        setDisplay('0');
      } else {
        setDisplay(display.slice(0, -1));
      }
    } else {
      setDisplay('0');
    }
  };

  const toggleSign = () => {
    if (error) setError(null);
    if (display === '0') return;
    setDisplay(prev => prev.startsWith('-') ? prev.substring(1) : '-' + prev);
  };

  const setBinaryOperation = async (op: BinaryOperation) => {
    if (isLoading) return;
    if (error) setError(null);
    const inputValue = parseFloat(display);

    if (accumulator === null) {
      setAccumulator(inputValue);
      setExpression(`${inputValue} ${opSymbols[op]}`);
      setOperation(op);
      setWaitingForOperand(true);
    } else if (operation && !waitingForOperand) {
      setIsLoading(true);
      try {
        const response = await calculatorApi.calculateBinary({
          a: accumulator,
          b: inputValue,
          operation
        });
        setAccumulator(response.result);
        setDisplay(response.formatted);
        setExpression(`${response.formatted} ${opSymbols[op]}`);
        setOperation(op);
        setWaitingForOperand(true);
      } catch (err: unknown) {
        setError(err instanceof CalculatorApiError ? err.code : (err instanceof Error ? err.message : 'UNKNOWN_ERROR'));
        setAccumulator(null);
        setOperation(null);
        setWaitingForOperand(true);
      } finally {
        setIsLoading(false);
      }
    } else if (operation && waitingForOperand) {
      setExpression(`${accumulator} ${opSymbols[op]}`);
      setOperation(op);
      setWaitingForOperand(true);
    }
  };

  const applyUnaryOperation = async (op: UnaryOperation) => {
    if (isLoading) return;
    const inputValue = parseFloat(display);
    setIsLoading(true);
    try {
      const response = await calculatorApi.calculateUnary({
        value: inputValue,
        operation: op
      });
      setDisplay(response.formatted);
      setWaitingForOperand(true);
      setError(null);
      if (operation !== null && accumulator !== null) {
        setExpression(`${accumulator} ${opSymbols[operation]}`);
      } else {
        setExpression('');
      }
    } catch (err: unknown) {
      setError(err instanceof CalculatorApiError ? err.code : (err instanceof Error ? err.message : 'UNKNOWN_ERROR'));
      setWaitingForOperand(true);
    } finally {
      setIsLoading(false);
    }
  };

  const evaluate = async () => {
    if (isLoading) return;
    if (operation === null || accumulator === null) return;

    const inputValue = parseFloat(display);
    setIsLoading(true);
    try {
      const response = await calculatorApi.calculateBinary({
        a: accumulator,
        b: inputValue,
        operation
      });
      setExpression(`${accumulator} ${opSymbols[operation]} ${display} =`);
      setDisplay(response.formatted);
      setAccumulator(null);
      setOperation(null);
      setWaitingForOperand(true);
      if (error) setError(null);
    } catch (err: unknown) {
      setError(err instanceof CalculatorApiError ? err.code : (err instanceof Error ? err.message : 'UNKNOWN_ERROR'));
      setAccumulator(null);
      setOperation(null);
      setWaitingForOperand(true);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    display,
    accumulator,
    operation,
    waitingForOperand,
    error,
    expression,
    isLoading,
    inputDigit,
    inputDecimal,
    clear,
    allClear,
    backspace,
    toggleSign,
    setBinaryOperation,
    applyUnaryOperation,
    evaluate
  };
};
