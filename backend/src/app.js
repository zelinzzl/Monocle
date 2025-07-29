// src/app.js
import express from 'express';
import dotenv from 'dotenv';
import healthRoutes from './routes/health-check.js';


dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// DB Health check route 
app.use('/api/health', healthRoutes);

app.get('/', (req, res) => {
  res.send('✅ Backend is running...');
});

export default app;
