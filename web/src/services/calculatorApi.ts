export interface BinaryCalculationRequest {
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'power';
  a: number;
  b: number;
}

export interface UnaryCalculationRequest {
  operation: 'sqrt' | 'percentage';
  value: number;
}

export interface CalculationResponse {
  result: number;
  formatted: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
}

export class CalculatorApiError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'CalculatorApiError';
    this.code = code;
    this.status = status;
  }
}

async function handleResponse(response: Response): Promise<CalculationResponse> {
  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const message = typeof err.message === 'string' ? err.message : 'Server error';
    const code = typeof err.error === 'string' ? err.error : 'UNKNOWN_ERROR';
    throw new CalculatorApiError(message, code, response.status);
  }

  const data = (await response.json()) as { result: number };

  return {
    result: data.result,
    formatted: String(data.result)
  };
}

export const calculatorApi = {
  calculateBinary: async (payload: BinaryCalculationRequest): Promise<CalculationResponse> => {
    try {
      const response = await fetch(`/api/v1/${payload.operation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ a: payload.a, b: payload.b }),
      });
      return await handleResponse(response);
    } catch (error: unknown) {
      if (error instanceof CalculatorApiError) {
        throw error;
      }
      throw new CalculatorApiError(
        error instanceof Error ? error.message : 'Network failure',
        'NETWORK_ERROR',
        500
      );
    }
  },

  calculateUnary: async (payload: UnaryCalculationRequest): Promise<CalculationResponse> => {
    try {
      const response = await fetch(`/api/v1/${payload.operation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Unary operations expect only operand 'a' per backend contract
        body: JSON.stringify({ a: payload.value }),
      });
      return await handleResponse(response);
    } catch (error: unknown) {
      if (error instanceof CalculatorApiError) {
        throw error;
      }
      throw new CalculatorApiError(
        error instanceof Error ? error.message : 'Network failure',
        'NETWORK_ERROR',
        500
      );
    }
  }
};
