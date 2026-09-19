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
  operation: string;
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
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      throw new CalculatorApiError('Failed to parse error response', 'NETWORK_ERROR', response.status);
    }
    
    const errObj = typeof errorData === 'object' && errorData !== null ? (errorData as Record<string, unknown>) : {};
    const message = typeof errObj.message === 'string' ? errObj.message : 'An unknown error occurred';
    const code = typeof errObj.error === 'string' ? errObj.error : 'UNKNOWN_ERROR';
    const status = typeof errObj.status === 'number' ? errObj.status : response.status;
    
    throw new CalculatorApiError(message, code, status);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new CalculatorApiError('Failed to parse success response', 'PARSE_ERROR', 500);
  }

  // Type narrowing of the response object
  if (typeof data === 'object' && data !== null) {
    const resultObj = data as Record<string, unknown>;
    if (typeof resultObj.result === 'number' && typeof resultObj.operation === 'string' && typeof resultObj.formatted === 'string') {
      return data as CalculationResponse;
    }
  }

  throw new CalculatorApiError('Invalid response format', 'PARSE_ERROR', 500);
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
