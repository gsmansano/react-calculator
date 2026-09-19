import express from 'express';
import cors from 'cors';
import calculatorRoutes from './routes/v1/calculator.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', calculatorRoutes);

// Error handler must be the last middleware
app.use(errorHandler);

export default app;
