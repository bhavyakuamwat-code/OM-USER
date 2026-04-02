import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'om_packers_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection and create table if not exists
const initializeDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database!');
    
    // Create the entries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        movingFrom VARCHAR(255) NOT NULL,
        movingTo VARCHAR(255) NOT NULL,
        query TEXT,
        entryDate DATE NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    connection.release();
    console.log('Database table "user_entries" is ready.');
  } catch (error) {
    console.error('Error connecting to MySQL:', error.message);
    console.log('\n--- Troubleshooting ---');
    console.log('1. Ensure MySQL is running on your machine.');
    console.log('2. Check your credentials in server/.env');
    console.log('3. Ensure the database "om_packers_db" exists.');
  }
};

initializeDB();

export default pool;
