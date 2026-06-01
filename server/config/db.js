require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS ? String(process.env.DB_PASS) : (process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : ''),
  database: process.env.DB_NAME || 'db_guru',
  port: process.env.DB_PORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
});

// Connection test
pool.connect()
  .then(client => {
    console.log("Connected to PostgreSQL database");
    client.release();
  })
  .catch(error => {
    console.error("Database connection error:", error.message);
  });

// Wrap pg pool in a promise-like query method to match some mysql behaviors if needed
const queryWrapper = {
  query: async (text, params) => {
    const res = await pool.query(text, params);
    // return array format like mysql2: [rows, fields]
    // Attach rowCount to the rows array for UPDATE/DELETE checks
    const rows = res.rows;
    rows.affectedRows = res.rowCount;
    return [rows, res.fields];
  },
  end: () => pool.end(),
  getConnection: async () => {
    const client = await pool.connect();
    return {
      query: async (text, params) => {
        const res = await client.query(text, params);
        const rows = res.rows;
        rows.affectedRows = res.rowCount;
        return [rows, res.fields];
      },
      beginTransaction: () => client.query('BEGIN'),
      commit: () => client.query('COMMIT'),
      rollback: () => client.query('ROLLBACK'),
      release: () => client.release()
    };
  }
};

module.exports = queryWrapper;