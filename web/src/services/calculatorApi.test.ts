import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculatorApi, CalculatorApiError } from './calculatorApi';

// Mock global fetch
globalThis.fetch = vi.fn();

describe('calculatorApi', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('calculateBinary', () => {
    it('returns result on successful binary calculation', async () => {
      const mockResponse = { result: 8, formatted: '8' };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await calculatorApi.calculateBinary({
        operation: 'add',
        a: 5,
        b: 3
      });

      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 5, b: 3 })
      });
    });

    it('throws CalculatorApiError on 400 error response', async () => {
      const mockErrorResponse = { error: 'DIVISION_BY_ZERO', message: 'Division by zero.', status: 400 };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      });

      try {
        await calculatorApi.calculateBinary({ operation: 'divide', a: 5, b: 0 });
        expect.fail('Should have thrown CalculatorApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(CalculatorApiError);
        const apiErr = err as CalculatorApiError;
        expect(apiErr.code).toBe('DIVISION_BY_ZERO');
        expect(apiErr.message).toBe('Division by zero.');
        expect(apiErr.status).toBe(400);
      }
    });

    it('throws CalculatorApiError on network failure', async () => {
      (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network offline'));
        
      try {
        await calculatorApi.calculateBinary({ operation: 'add', a: 1, b: 1 });
        expect.fail('Should have thrown CalculatorApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(CalculatorApiError);
        const apiErr = err as CalculatorApiError;
        expect(apiErr.code).toBe('NETWORK_ERROR');
        expect(apiErr.message).toBe('Network offline');
        expect(apiErr.status).toBe(500);
      }
    });
  });

  describe('calculateUnary', () => {
    it('returns result on successful unary calculation', async () => {
      const mockResponse = { result: 8, formatted: '8' };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await calculatorApi.calculateUnary({
        operation: 'sqrt',
        value: 64
      });

      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/sqrt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Ensure that `value` payload is mapped to `a` for the backend contract
        body: JSON.stringify({ a: 64 })
      });
    });
  });
});
