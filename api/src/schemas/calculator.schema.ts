import { z } from 'zod';

export const binaryOperationSchema = z.object({
  a: z.number(),
  b: z.number()
});

export const unaryOperationSchema = z.object({
  a: z.number(),
  b: z.number().optional()
});
