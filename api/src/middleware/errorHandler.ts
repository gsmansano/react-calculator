import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { DivisionByZeroError, InvalidOperandError } from '../domain/calculator';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request payload',
      details: err.issues,
      status: 400
    });
  }

  if (err instanceof DivisionByZeroError || err instanceof InvalidOperandError) {
    return res.status(400).json({
      error: err.code,
      message: err.message,
      status: 400
    });
  }

  // Catch malformed JSON from body parser
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: 'Malformed JSON payload',
      status: 400
    });
  }

  console.error('Unhandled Server Error:', err);
  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred.',
    status: 500
  });
}
