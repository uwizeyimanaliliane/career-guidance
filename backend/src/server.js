import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { pool } from './db.js';
import authRoutes from './routes/auth.routes.js';
import studentsRoutes from './routes/students.routes.js';
import sessionsRoutes from './routes/sessions.routes.js';
import metricsRoutes from './routes/metrics.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004'
  ],
  credentials: true 
}));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Enhanced error handler
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Duplicate entry found' });
  }
  
  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({ message: 'Referenced record not found' });
  }
  
  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Internal Server Error';
    
  res.status(statusCode).json({ 
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const port = process.env.PORT || 3004;

// Test database connection
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  await testDatabaseConnection();
  app.listen(port, () => {
    console.log(`✅ Backend running on http://localhost:${port}`);
  });
}

startServer();
