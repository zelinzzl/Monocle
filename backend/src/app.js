import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import healthRoutes from './routes/health-check.js';
import authRoutes from './routes/auth.js';
import destinationRoutes from './routes/destinations.js';  // ADD THIS

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);  // ADD THIS

app.get('/', (req, res) => {
  res.send('✅ Backend is running...');
});

export default app;