import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCalculator } from './useCalculator';

describe('useCalculator', () => {
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

  it('should toggle sign correctly', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.toggleSign());
    expect(result.current.display).toBe('0');

    act(() => result.current.inputDigit('5'));
    act(() => result.current.toggleSign());
    expect(result.current.display).toBe('-5');

    act(() => result.current.toggleSign());
    expect(result.current.display).toBe('5');
  });

  it('should handle C vs AC correctly', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('5'));
    act(() => result.current.setBinaryOperation('add'));
    act(() => result.current.inputDigit('3'));
    
    // Clear only clears display
    act(() => result.current.clear());
    expect(result.current.display).toBe('0');
    expect(result.current.operation).toBe('add');
    
    // All Clear resets everything
    act(() => result.current.allClear());
    expect(result.current.display).toBe('0');
    expect(result.current.operation).toBeNull();
    expect(result.current.accumulator).toBeNull();
  });

  it('should compute binary chains correctly locally', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('5'));
    act(() => result.current.setBinaryOperation('add'));
    act(() => result.current.inputDigit('3'));
    act(() => result.current.evaluate());
    expect(result.current.display).toBe('8');

    act(() => result.current.setBinaryOperation('multiply'));
    act(() => result.current.inputDigit('2'));
    act(() => result.current.evaluate());
    expect(result.current.display).toBe('16');
  });

  it('should execute unary operations correctly', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('1'));
    act(() => result.current.inputDigit('6'));
    act(() => result.current.applyUnaryOperation('sqrt'));
    expect(result.current.display).toBe('4');

    act(() => result.current.allClear());
    act(() => result.current.inputDigit('5'));
    act(() => result.current.inputDigit('0'));
    act(() => result.current.applyUnaryOperation('percentage'));
    expect(result.current.display).toBe('0.5');
  });

  it('should handle division by zero locally', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('5'));
    act(() => result.current.setBinaryOperation('divide'));
    act(() => result.current.inputDigit('0'));
    act(() => result.current.evaluate());
    expect(result.current.error).toBe('DIVISION_BY_ZERO');
  });

  it('should handle negative square root locally', () => {
    const { result } = renderHook(() => useCalculator());
    act(() => result.current.inputDigit('5'));
    act(() => result.current.toggleSign());
    act(() => result.current.applyUnaryOperation('sqrt'));
    expect(result.current.error).toBe('INVALID_OPERAND');
  });
});
