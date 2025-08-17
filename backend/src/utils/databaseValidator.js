import { pool } from '../db.js';

export async function validateDatabaseSchema() {
  console.log('🔍 Validating database schema...');
  
  const requiredTables = [
    'students',
    'counseling_sessions',
    'users',
    'staff'
  ];
  
  const requiredColumns = {
    'students': ['id', 'first_name', 'last_name', 'grade_level', 'career_interest'],
    'counseling_sessions': ['id', 'student_id', 'session_date', 'session_duration', 'counselor_name']
  };
  
  const issues = [];
  
  try {
    // Check if tables exist
    for (const table of requiredTables) {
      const [rows] = await pool.query(
        'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?',
        [table]
      );
      
      if (rows[0].count === 0) {
        issues.push(`❌ Missing table: ${table}`);
      } else {
        console.log(`✅ Table ${table} exists`);
        
        // Check columns for critical tables
        if (requiredColumns[table]) {
          for (const column of requiredColumns[table]) {
            const [colRows] = await pool.query(
              'SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
              [table, column]
            );
            
            if (colRows[0].count === 0) {
              issues.push(`❌ Missing column: ${table}.${column}`);
            } else {
              console.log(`✅ Column ${table}.${column} exists`);
            }
          }
        }
      }
    }
    
    // Check for sample data
    const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM students');
    const [sessionCount] = await pool.query('SELECT COUNT(*) as count FROM counseling_sessions');
    
    console.log(`📊 Students: ${studentCount[0].count}, Sessions: ${sessionCount[0].count}`);
    
    if (issues.length > 0) {
      console.error('❌ Database schema issues found:');
      issues.forEach(issue => console.error(issue));
      return false;
    }
    
    console.log('✅ Database schema validation passed');
    return true;
    
  } catch (error) {
    console.error('❌ Error validating database schema:', error);
    return false;
  }
}

export async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}
