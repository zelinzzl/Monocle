// src/app.js
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.send('✅ Backend is running...');
});

export default app;
