const { Pool } = require("pg");
require("dotenv").config();

async function initDB() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
    
    database: process.env.DB_NAME || 'db_guru',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log("Initializing PostgreSQL database schema...");

    // 1. Create tbl_admin_registration for Authentication
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_admin_registration (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        profile_pic VARCHAR(255) NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ tbl_admin_registration table ready");

    // 2. Create tbl_admin_otp
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_admin_otp (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL
      );
    `);
    console.log("✓ tbl_admin_otp table ready");

    // 3. Create tbl_membership
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_membership (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        duration_time VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ tbl_membership table ready");

    // 4. Create tbl_class
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_class (
        id SERIAL PRIMARY KEY,
        class_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Add status column if it doesn't exist (for existing databases)
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tbl_class' AND column_name = 'status') THEN
          ALTER TABLE tbl_class ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        END IF;
      END $$;
    `);
    console.log("✓ tbl_class table ready (with status column)");

    // 5. Create tbl_subject
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_subject (
        id SERIAL PRIMARY KEY,
        class_id INTEGER,
        subject_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add class_id and status column if it doesn't exist (for existing databases)
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tbl_subject' AND column_name = 'status') THEN
          ALTER TABLE tbl_subject ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tbl_subject' AND column_name = 'class_id') THEN
          ALTER TABLE tbl_subject ADD COLUMN class_id INTEGER;
        END IF;
      END $$;
    `);
    console.log("✓ tbl_subject table ready (with class_id and status columns)");

    // 6. Create tbl_courses
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_courses (
        id SERIAL PRIMARY KEY,
        course_title VARCHAR(255) NOT NULL,
        class_id INTEGER,
        subject_id INTEGER,
        membership_id INTEGER,
        course_duration INTEGER,
        intro_video VARCHAR(255),
        course_image VARCHAR(255),
        course_description TEXT,
        passing_percentage INTEGER DEFAULT 40,
        status VARCHAR(50) DEFAULT 'active',
        chapters TEXT,
        final_exam TEXT,
        selected_subject VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      ALTER TABLE tbl_courses
      ADD COLUMN IF NOT EXISTS course_image VARCHAR(255);
    `);
    console.log("✓ tbl_courses table ready");

    // 7. Create tbl_course_chapters
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_course_chapters (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES tbl_courses(id) ON DELETE CASCADE,
        chapter_no INTEGER,
        chapter_title VARCHAR(255),
        chapter_description TEXT,
        video_url VARCHAR(255),
        is_free INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ tbl_course_chapters table ready");

    // 8. Create tbl_chapter_quiz
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_chapter_quiz (
        id SERIAL PRIMARY KEY,
        chapter_id INTEGER REFERENCES tbl_course_chapters(id) ON DELETE CASCADE,
        question TEXT,
        option_a TEXT,
        option_b TEXT,
        option_c TEXT,
        option_d TEXT,
        correct_answer VARCHAR(10),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ tbl_chapter_quiz table ready");

    // 9. Create tbl_final_exam
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_final_exam (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES tbl_courses(id) ON DELETE CASCADE,
        question TEXT,
        option_a TEXT,
        option_b TEXT,
        option_c TEXT,
        option_d TEXT,
        correct_answer VARCHAR(10),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ tbl_final_exam table ready");

    // 10. Create tbl_users (Client/Student Registration)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ tbl_users table ready");

    // Seed Main Admin
    const bcrypt = require('bcryptjs');
    const adminHashedPass = await bcrypt.hash('guru123', 10);
    
    const adminResult = await pool.query("SELECT * FROM tbl_admin_registration WHERE username = 'danushubham18@gmail.com'");
    if (adminResult.rows.length === 0) {
      await pool.query(
        "INSERT INTO tbl_admin_registration (username, password) VALUES ($1, $2)",
        ['danushubham18@gmail.com', adminHashedPass]
      );
      console.log("✓ Admin seeded (danushubham18@gmail.com / guru123)");
    }

    console.log("Database schema successfully initialized in PostgreSQL!");
  } catch (error) {
    console.error("Database initialization error:", error);
  } finally {
    await pool.end();
  }
}

initDB();
