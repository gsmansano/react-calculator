import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Calculator API Integration Tests', () => {
  describe('Happy Path: Binary Operations', () => {
    it.each([
      ['/add', { a: 5, b: 3 }, 8],
      ['/subtract', { a: 5, b: 3 }, 2],
      ['/multiply', { a: 5, b: 3 }, 15],
      ['/divide', { a: 6, b: 3 }, 2],
      ['/power', { a: 2, b: 3 }, 8]
    ])('POST /api/v1%s with %j should return %n', async (endpoint, payload, expected) => {
      const res = await request(app)
        .post(`/api/v1${endpoint}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ result: expected });
    });
  });

  describe('Happy Path: Unary Operations', () => {
    it.each([
      ['/sqrt', { a: 9 }, 3],
      ['/percentage', { a: 50 }, 0.5]
    ])('POST /api/v1%s with %j should return %n', async (endpoint, payload, expected) => {
      const res = await request(app)
        .post(`/api/v1${endpoint}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ result: expected });
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/add')
        .send({ a: 5 }); // Missing 'b'

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
      expect(res.body.details).toBeDefined();
    });

    it('should return 400 for non-numeric values', async () => {
      const res = await request(app)
        .post('/api/v1/add')
        .send({ a: 5, b: 'three' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for malformed JSON', async () => {
      const res = await request(app)
        .post('/api/v1/add')
        .set('Content-Type', 'application/json')
        .send('{"a": 5, "b": 3'); // Missing closing brace

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('BAD_REQUEST');
      expect(res.body.message).toBe('Malformed JSON payload');
    });
  });

  describe('Domain Errors', () => {
    it('should return 400 and DIVISION_BY_ZERO for division by zero', async () => {
      const res = await request(app)
        .post('/api/v1/divide')
        .send({ a: 5, b: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('DIVISION_BY_ZERO');
    });

    it('should return 400 and INVALID_OPERAND for negative square root', async () => {
      const res = await request(app)
        .post('/api/v1/sqrt')
        .send({ a: -1 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_OPERAND');
    });
  });
});
