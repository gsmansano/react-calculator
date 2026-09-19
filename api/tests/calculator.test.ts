import { describe, test, expect } from 'vitest';
import {
  add,
  subtract,
  multiply,
  divide,
  power,
  sqrt,
  percentage,
  DivisionByZeroError,
  InvalidOperandError,
  normalizePrecision
} from '../src/domain/calculator';

describe('Calculator Domain Logic', () => {
  describe('add', () => {
    test.each([
      [1, 2, 3],
      [-1, -1, -2],
      [0.1, 0.2, 0.3], // IEEE 754 precision test
      [0, 0, 0]
    ])('add(%n, %n) should return %n', (a, b, expected) => {
      expect(add(a, b)).toBe(expected);
    });
  });

  describe('subtract', () => {
    test.each([
      [5, 3, 2],
      [-1, -1, 0],
      [0.3, 0.1, 0.2], // IEEE 754 precision test
      [0, 5, -5]
    ])('subtract(%n, %n) should return %n', (a, b, expected) => {
      expect(subtract(a, b)).toBe(expected);
    });
  });

  describe('multiply', () => {
    test.each([
      [2, 3, 6],
      [-2, 3, -6],
      [0.7, 0.1, 0.07], // IEEE 754 precision test
      [1, 0, 0]
    ])('multiply(%n, %n) should return %n', (a, b, expected) => {
      expect(multiply(a, b)).toBe(expected);
    });
  });

  describe('divide', () => {
    test.each([
      [6, 3, 2],
      [-6, 2, -3],
      [0.3, 0.1, 3],
      [5, 2, 2.5]
    ])('divide(%n, %n) should return %n', (a, b, expected) => {
      expect(divide(a, b)).toBe(expected);
    });

    test('should throw DivisionByZeroError when dividing by zero', () => {
      expect(() => divide(5, 0)).toThrow(DivisionByZeroError);
    });
  });

  describe('power', () => {
    test.each([
      [2, 3, 8],
      [5, 0, 1],
      [4, 0.5, 2], // Fractional exponent
      [2, -1, 0.5]
    ])('power(%n, %n) should return %n', (a, b, expected) => {
      expect(power(a, b)).toBe(expected);
    });
  });

  describe('sqrt', () => {
    test.each([
      [9, 3],
      [0, 0],
      [2.25, 1.5]
    ])('sqrt(%n) should return %n', (a, expected) => {
      expect(sqrt(a)).toBe(expected);
    });

    test('should throw InvalidOperandError for negative numbers', () => {
      expect(() => sqrt(-1)).toThrow(InvalidOperandError);
    });
  });

  describe('percentage', () => {
    test.each([
      [50, 0.5],
      [100, 1],
      [0, 0],
      [33.3, 0.333]
    ])('percentage(%n) should return %n', (a, expected) => {
      expect(percentage(a)).toBe(expected);
    });
  });

  describe('Precision & Error Boundaries', () => {
    test('should throw InvalidOperandError for Infinity', () => {
      // 10^1000 overflows to Infinity
      expect(() => power(10, 1000)).toThrow(InvalidOperandError);
    });

    test('normalizePrecision should throw InvalidOperandError for NaN', () => {
      expect(() => normalizePrecision(NaN)).toThrow(InvalidOperandError);
    });
  });
});
