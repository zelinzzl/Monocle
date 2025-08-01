import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import healthRoutes from './routes/health-check.js';
import authRoutes from './routes/auth.js';
import destinationRoutes from './routes/destinations.js';
import alertsRoutes from './routes/alerts-routes.js';
import insuranceRoutes from './routes/insurance-routes.js';
import riskRoutes from './routes/riskRoutes.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Updated CORS configuration for httpOnly cookies
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // This is crucial for httpOnly cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

// Cookie parser middleware - Add this BEFORE body parsing
app.use(cookieParser());

// Body parsing
app.use(express.json({limit: '10mb'})); // Increased limit for larger payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/risk', riskRoutes);

app.get('/', (req, res) => {
  res.send('✅ Backend is running...');
});

export default app;