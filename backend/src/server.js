import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { pool } from './db.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import studentsRoutes from './routes/students.routes.js';
import sessionRoutes from './routes/sessions.routes.js'; // ✅ plural sessions
import metricsRoutes from './routes/metrics.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004'
    ],
    credentials: true,
  })
);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/sessions', sessionRoutes);   // ✅ plural here
app.use('/api/metrics', metricsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Error:', err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Duplicate entry found' });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({ message: 'Referenced record not found' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

const port = process.env.PORT || 3004;

// Import database utilities
import { validateDatabaseSchema } from './utils/databaseValidator.js';
import { setupDatabase } from './utils/setupDatabase.js';

// Test DB connection
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your .env file for correct database credentials');
    console.error('Required: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT');
    return false;
  }
}

// Start server
async function startServer() {
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    process.exit(1);
  }
  
  // Validate and setup database
  const schemaValid = await validateDatabaseSchema();
  if (!schemaValid) {
    console.log('🔄 Attempting to setup database schema...');
    const setupSuccess = await setupDatabase();
    if (!setupSuccess) {
      console.error('❌ Failed to setup database schema');
      process.exit(1);
    }
  }
  
  // Re-validate after setup
  await validateDatabaseSchema();
  
  app.listen(port, () => {
    console.log(`✅ Backend running on http://localhost:${port}`);
    console.log(`✅ Health check: http://localhost:${port}/api/health`);
  });
}

startServer();
