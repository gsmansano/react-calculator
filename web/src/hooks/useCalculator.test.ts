import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCalculator } from './useCalculator';
import { calculatorApi, CalculatorApiError } from '../services/calculatorApi';

vi.mock('../services/calculatorApi', () => {
  return {
    calculatorApi: {
      calculateBinary: vi.fn(),
      calculateUnary: vi.fn(),
    },
    CalculatorApiError: class CalculatorApiError extends Error {
      code: string;
      status: number;
      constructor(message: string, code: string, status: number) {
        super(message);
        this.code = code;
        this.status = status;
      }
    }
  };
});

describe('useCalculator', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should buffer digits', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('1'));
    act(() => result.current.inputDigit('2'));
    act(() => result.current.inputDigit('3'));
    expect(result.current.display).toBe('123');
  });

  it('should prevent multiple decimals', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('1'));
    act(() => result.current.inputDecimal());
    act(() => result.current.inputDigit('2'));
    act(() => result.current.inputDecimal());
    act(() => result.current.inputDigit('3'));
    expect(result.current.display).toBe('1.23');
  });

  it('should toggle sign correctly using string manipulation', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.toggleSign());
    expect(result.current.display).toBe('0');

    act(() => result.current.inputDigit('5'));
    act(() => result.current.inputDecimal());
    act(() => result.current.toggleSign());
    expect(result.current.display).toBe('-5.'); // String manipulation keeps the dot!

    act(() => result.current.toggleSign());
    expect(result.current.display).toBe('5.');
  });

  it('should handle C vs AC correctly and clear expression', async () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('5'));
    await act(async () => { await result.current.setBinaryOperation('add') });
    act(() => result.current.inputDigit('3'));
    
    expect(result.current.expression).toBe('5 +');

    // Clear only clears display
    act(() => result.current.clear());
    expect(result.current.display).toBe('0');
    expect(result.current.operation).toBe('add');
    expect(result.current.expression).toBe('5 +');
    
    // All Clear resets everything
    act(() => result.current.allClear());
    expect(result.current.display).toBe('0');
    expect(result.current.operation).toBeNull();
    expect(result.current.accumulator).toBeNull();
    expect(result.current.expression).toBe('');
  });

  it('should compute binary chains correctly using API and update expression', async () => {
    vi.mocked(calculatorApi.calculateBinary).mockResolvedValueOnce({ result: 8, formatted: '8', operation: 'add' } as any);
    vi.mocked(calculatorApi.calculateBinary).mockResolvedValueOnce({ result: 16, formatted: '16', operation: 'multiply' } as any);

    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('5'));
    await act(async () => { await result.current.setBinaryOperation('add') });
    act(() => result.current.inputDigit('3'));
    
    // Test the evaluate async operation
    await act(async () => { await result.current.evaluate() });
    expect(calculatorApi.calculateBinary).toHaveBeenCalledWith({ a: 5, b: 3, operation: 'add' });
    expect(result.current.display).toBe('8');
    expect(result.current.expression).toBe('5 + 3 =');

    await act(async () => { await result.current.setBinaryOperation('multiply') });
    expect(result.current.expression).toBe('8 ×');
    act(() => result.current.inputDigit('2'));
    await act(async () => { await result.current.evaluate() });
    expect(calculatorApi.calculateBinary).toHaveBeenCalledWith({ a: 8, b: 2, operation: 'multiply' });
    expect(result.current.display).toBe('16');
    expect(result.current.expression).toBe('8 × 2 =');
    
    // Typing digit after evaluate clears expression
    act(() => result.current.inputDigit('9'));
    expect(result.current.display).toBe('9');
    expect(result.current.expression).toBe('');
  });

  it('should compute binary chaining internally using API', async () => {
    vi.mocked(calculatorApi.calculateBinary).mockResolvedValueOnce({ result: 8, formatted: '8', operation: 'add' } as any);

    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('5'));
    await act(async () => { await result.current.setBinaryOperation('add') });
    act(() => result.current.inputDigit('3'));
    
    await act(async () => { await result.current.setBinaryOperation('multiply') });
    expect(calculatorApi.calculateBinary).toHaveBeenCalledWith({ a: 5, b: 3, operation: 'add' });
    expect(result.current.display).toBe('8');
    expect(result.current.expression).toBe('8 ×');
  });

  it('should execute unary operations correctly via API', async () => {
    vi.mocked(calculatorApi.calculateUnary).mockResolvedValueOnce({ result: 4, formatted: '4', operation: 'sqrt' } as any);

    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('1'));
    act(() => result.current.inputDigit('6'));
    await act(async () => { await result.current.applyUnaryOperation('sqrt') });
    
    expect(calculatorApi.calculateUnary).toHaveBeenCalledWith({ value: 16, operation: 'sqrt' });
    expect(result.current.display).toBe('4');
  });

  it('should properly populate error state on server 400 response', async () => {
    vi.mocked(calculatorApi.calculateBinary).mockRejectedValueOnce(
      new CalculatorApiError('Division by zero', 'DIVISION_BY_ZERO', 400)
    );

    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('5'));
    await act(async () => { await result.current.setBinaryOperation('divide') });
    act(() => result.current.inputDigit('0'));
    await act(async () => { await result.current.evaluate() });
    
    expect(result.current.error).toBe('DIVISION_BY_ZERO');
  });

  it('should populate error state on unary operation failure', async () => {
    vi.mocked(calculatorApi.calculateUnary).mockRejectedValueOnce(
      new CalculatorApiError('Invalid operand', 'INVALID_OPERAND', 400)
    );

    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('5'));
    act(() => result.current.toggleSign());
    await act(async () => { await result.current.applyUnaryOperation('sqrt') });
    
    expect(result.current.error).toBe('INVALID_OPERAND');
  });

  it('should automatically clear error on subsequent valid actions', async () => {
    vi.mocked(calculatorApi.calculateUnary).mockRejectedValueOnce(
      new CalculatorApiError('Invalid operand', 'INVALID_OPERAND', 400)
    );

    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('5'));
    act(() => result.current.toggleSign());
    await act(async () => { await result.current.applyUnaryOperation('sqrt') });
    expect(result.current.error).toBe('INVALID_OPERAND');

    // Trigger toggleSign should clear the error
    act(() => result.current.toggleSign());
    expect(result.current.error).toBeNull();
  });

  it('should clear completed expression when triggering unary operation', async () => {
    vi.mocked(calculatorApi.calculateBinary).mockResolvedValueOnce({ result: 81, formatted: '81', operation: 'multiply' } as any);
    vi.mocked(calculatorApi.calculateUnary).mockResolvedValueOnce({ result: 9, formatted: '9', operation: 'sqrt' } as any);

    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('9'));
    await act(async () => { await result.current.setBinaryOperation('multiply') });
    act(() => result.current.inputDigit('9'));
    await act(async () => { await result.current.evaluate() });
    expect(result.current.display).toBe('81');
    expect(result.current.expression).toBe('9 × 9 =');

    await act(async () => { await result.current.applyUnaryOperation('sqrt') });
    expect(result.current.display).toBe('9');
    expect(result.current.expression).toBe('');
  });

  it('should preserve pending binary expression when applying unary operation', async () => {
    vi.mocked(calculatorApi.calculateUnary).mockResolvedValueOnce({ result: 0.2, formatted: '0.2', operation: 'percentage' } as any);
    vi.mocked(calculatorApi.calculateBinary).mockResolvedValueOnce({ result: 50.2, formatted: '50.2', operation: 'add' } as any);

    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('5'));
    act(() => result.current.inputDigit('0'));
    await act(async () => { await result.current.setBinaryOperation('add') });
    act(() => result.current.inputDigit('2'));
    act(() => result.current.inputDigit('0'));
    await act(async () => { await result.current.applyUnaryOperation('percentage') });
    
    expect(result.current.expression).toBe('50 +');
    expect(result.current.display).toBe('0.2');

    await act(async () => { await result.current.evaluate() });
    expect(result.current.display).toBe('50.2');
    expect(result.current.expression).toBe('50 + 0.2 =');
  });

  it('should toggle isLoading during network resolution', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(calculatorApi.calculateBinary).mockReturnValue(promise as any);

    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('5'));
    await act(async () => { await result.current.setBinaryOperation('add') });
    act(() => result.current.inputDigit('3'));

    // Trigger evaluate (do not await yet to check isLoading)
    let evaluatePromise: Promise<void>;
    act(() => {
      evaluatePromise = result.current.evaluate();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!({ result: 8, formatted: '8', operation: 'add' });
      await evaluatePromise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.display).toBe('8');
  });

  describe('backspace', () => {
    it('should delete the last character', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('1'));
      act(() => result.current.inputDigit('2'));
      act(() => result.current.inputDigit('3'));
      act(() => result.current.backspace());
      expect(result.current.display).toBe('12');
    });

    it('should reset to 0 if a single digit or single negative digit remains', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.backspace());
      expect(result.current.display).toBe('0');

      act(() => result.current.inputDigit('5'));
      act(() => result.current.toggleSign());
      expect(result.current.display).toBe('-5');
      act(() => result.current.backspace());
      expect(result.current.display).toBe('0');
    });

    it('should not mutate buffer if waiting for operand', async () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      await act(async () => { await result.current.setBinaryOperation('add') });
      expect(result.current.waitingForOperand).toBe(true);
      expect(result.current.display).toBe('5');
      act(() => result.current.backspace());
      expect(result.current.display).toBe('5'); // unchanged
    });
  });
});
