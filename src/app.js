import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import recordRoutes from './routes/records.js';
import dashboardRoutes from './routes/dashboard.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { initDatabase } from './services/db.js';

dotenv.config();

const app = express();
app.use(express.json());

initDatabase();

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/records', recordRoutes);
app.use('/dashboard', dashboardRoutes);

app.use(errorHandler);

export default app;
