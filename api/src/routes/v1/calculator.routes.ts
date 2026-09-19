import { Router } from 'express';
import {
  add, subtract, multiply, divide, power, sqrt, percentage
} from '../../domain/calculator';
import { binaryOperationSchema, unaryOperationSchema } from '../../schemas/calculator.schema';

const router = Router();

router.post('/add', (req, res) => {
  const { a, b } = binaryOperationSchema.parse(req.body);
  res.json({ result: add(a, b) });
});

router.post('/subtract', (req, res) => {
  const { a, b } = binaryOperationSchema.parse(req.body);
  res.json({ result: subtract(a, b) });
});

router.post('/multiply', (req, res) => {
  const { a, b } = binaryOperationSchema.parse(req.body);
  res.json({ result: multiply(a, b) });
});

router.post('/divide', (req, res) => {
  const { a, b } = binaryOperationSchema.parse(req.body);
  res.json({ result: divide(a, b) });
});

router.post('/power', (req, res) => {
  const { a, b } = binaryOperationSchema.parse(req.body);
  res.json({ result: power(a, b) });
});

router.post('/sqrt', (req, res) => {
  const { a } = unaryOperationSchema.parse(req.body);
  res.json({ result: sqrt(a) });
});

router.post('/percentage', (req, res) => {
  const { a } = unaryOperationSchema.parse(req.body);
  res.json({ result: percentage(a) });
});

export default router;
