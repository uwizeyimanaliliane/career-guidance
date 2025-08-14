const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'career_guidance'
};

async function setupDatabase() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' created or already exists`);

    // Connect to the specific database
    await connection.end();
    connection = await mysql.createConnection(dbConfig);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff', 'teacher') NOT NULL DEFAULT 'staff',
        full_name VARCHAR(255) NOT NULL,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Check if users already exist
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers[0].count === 0) {
      // Hash passwords
      const adminPassword = await bcrypt.hash('admin123', 12);
      const staffPassword = await bcrypt.hash('staff123', 12);

      // Insert seed users
      const users = [
        {
          email: 'admin@cgmis.local',
          password_hash: adminPassword,
          role: 'admin',
          full_name: 'CGMIS Admin'
        },
        {
          email: 'staff@cgmis.local',
          password_hash: staffPassword,
          role: 'staff',
          full_name: 'CGMIS Staff'
        }
      ];

      for (const user of users) {
        await connection.query(
          'INSERT INTO users (email, password_hash, role, full_name) VALUES (?, ?, ?, ?)',
          [user.email, user.password_hash, user.role, user.full_name]
        );
      }
      console.log('✅ Admin users seeded successfully');
      console.log('📧 Admin login: admin@cgmis.local / admin123');
      console.log('📧 Staff login: staff@cgmis.local / staff123');
    } else {
      console.log('ℹ️ Users already exist, skipping seed');
    }

    console.log('\n🎉 Database setup complete!');
    console.log('You can now log in with the seeded credentials.');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
