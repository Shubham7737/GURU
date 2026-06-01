const pool = require("../../config/db");

// GET ALL CLIENTS with search, filter, pagination
exports.getAllClients = async (req, res) => {
  try {
    const { search, role, sort, page, limit } = req.query;

    let sql = `SELECT id, name, email, role, "createdat" FROM tbl_users`;
    let countSql = `SELECT COUNT(*) as total FROM tbl_users`;
    let conditions = [];
    let params = [];
    let paramIndex = 1;

    // Search by name or email
    if (search) {
      conditions.push(`(LOWER(name) LIKE $${paramIndex} OR LOWER(email) LIKE $${paramIndex})`);
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    // Filter by role
    if (role && role !== 'all') {
      conditions.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      sql += whereClause;
      countSql += whereClause;
    }

    // Sorting
    if (sort === 'name_asc') {
      sql += ` ORDER BY name ASC`;
    } else if (sort === 'name_desc') {
      sql += ` ORDER BY name DESC`;
    } else if (sort === 'oldest') {
      sql += ` ORDER BY "createdat" ASC`;
    } else {
      sql += ` ORDER BY "createdat" DESC`;
    }

    // Get total count
    const [countRows] = await pool.query(countSql, params);
    const total = parseInt(countRows[0]?.total || 0);

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const [rows] = await pool.query(sql, params);

    return res.status(200).json({
      success: true,
      message: "Clients retrieved successfully",
      data: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE CLIENT
exports.getSingleClient = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `SELECT id, name, email, role, "createdat" FROM tbl_users WHERE id = $1`;
    const [rows] = await pool.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CLIENTS STATS
exports.getClientsStats = async (req, res) => {
  try {
    const [totalRows] = await pool.query(`SELECT COUNT(*) as total FROM tbl_users`);
    const [studentRows] = await pool.query(`SELECT COUNT(*) as total FROM tbl_users WHERE role = 'student'`);

    // Clients registered today
    const [todayRows] = await pool.query(
      `SELECT COUNT(*) as total FROM tbl_users WHERE DATE("createdat") = CURRENT_DATE`
    );

    // Clients registered this month
    const [monthRows] = await pool.query(
      `SELECT COUNT(*) as total FROM tbl_users WHERE EXTRACT(MONTH FROM "createdat") = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM "createdat") = EXTRACT(YEAR FROM CURRENT_DATE)`
    );

    return res.status(200).json({
      success: true,
      data: {
        total: parseInt(totalRows[0]?.total || 0),
        students: parseInt(studentRows[0]?.total || 0),
        today: parseInt(todayRows[0]?.total || 0),
        thisMonth: parseInt(monthRows[0]?.total || 0),
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE CLIENT
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "DELETE FROM tbl_users WHERE id = $1";
    const [result] = await pool.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
