import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root1234',
  database: 'smartbite',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function initializeDatabase() {
  try {
    // Create database if not exists
    const tempConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root1234'
    });
    
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS smartbite;`);
    await tempConnection.end();
    
    // Now create tables in 'smartbite'
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        email VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        goal VARCHAR(50),
        age INT,
        gender VARCHAR(50),
        weightKg FLOAT,
        heightCm FLOAT,
        activityLevel VARCHAR(50),
        targetCalories INT,
        targetProtein INT,
        targetCarbs INT,
        targetFat INT,
        aiRecommendationNote TEXT,
        joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_meals (
        id VARCHAR(255) PRIMARY KEY,
        user_email VARCHAR(255),
        date VARCHAR(50),
        time VARCHAR(50),
        imageUrl LONGTEXT,
        analysis JSON,
        customNotes TEXT,
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id VARCHAR(255) PRIMARY KEY,
        user_email VARCHAR(255),
        date VARCHAR(50),
        time VARCHAR(50),
        type VARCHAR(100),
        duration_minutes INT,
        intensity VARCHAR(50),
        calories_burned INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
      );
    `);
    
    console.log('[Database] MySQL initialized successfully.');
  } catch (error) {
    console.error('[Database Error] Failed to initialize database:', error);
  }
}

export default pool;
