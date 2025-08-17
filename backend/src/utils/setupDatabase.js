import { pool } from '../db.js';

export async function setupDatabase() {
  console.log('🔧 Setting up database schema...');
  
  try {
    // Create students table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        grade_level VARCHAR(20),
        career_interest VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create counseling_sessions table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS counseling_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        session_date DATE NOT NULL,
        session_duration DECIMAL(5,2) DEFAULT 0,
        counselor_name VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);
    
    // Create users table for authentication
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') DEFAULT 'staff',
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Add missing columns to existing tables
    await pool.query(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS grade_level VARCHAR(20),
      ADD COLUMN IF NOT EXISTS career_interest VARCHAR(255)
    `);
    
    await pool.query(`
      ALTER TABLE counseling_sessions 
      ADD COLUMN IF NOT EXISTS session_duration DECIMAL(5,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS counselor_name VARCHAR(100)
    `);
    
    console.log('✅ Database schema setup completed');
    
    // Insert sample data if tables are empty
    const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM students');
    if (studentCount[0].count === 0) {
      console.log('📊 Adding sample data...');
      
      await pool.query(`
        INSERT INTO students (first_name, last_name, email, grade_level, career_interest) VALUES
        ('John', 'Doe', 'john.doe@example.com', '11', 'Engineering'),
        ('Jane', 'Smith', 'jane.smith@example.com', '12', 'Medicine'),
        ('Mike', 'Johnson', 'mike.johnson@example.com', '10', 'Computer Science'),
        ('Sarah', 'Williams', 'sarah.williams@example.com', '11', 'Business'),
        ('David', 'Brown', 'david.brown@example.com', '12', 'Arts')
      `);
      
      await pool.query(`
        INSERT INTO counseling_sessions (student_id, session_date, session_duration, counselor_name, notes) VALUES
        (1, '2024-01-15', 45.00, 'Dr. Smith', 'Initial consultation'),
        (1, '2024-02-10', 30.00, 'Dr. Smith', 'Follow-up session'),
        (2, '2024-01-20', 60.00, 'Dr. Johnson', 'Career guidance'),
        (3, '2024-02-05', 45.00, 'Dr. Williams', 'Academic planning'),
        (4, '2024-02-15', 30.00, 'Dr. Smith', 'College applications')
      `);
      
      console.log('✅ Sample data added');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    return false;
  }
}
