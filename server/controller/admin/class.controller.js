const pool = require("../../config/db");

// GET ALL
exports.getAllData = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = "SELECT * FROM tbl_class ORDER BY id DESC";
    let params = [];

    if (status) {
      sql = "SELECT * FROM tbl_class WHERE status = $1 ORDER BY id DESC";
      params.push(status);
    }

    const [rows] = await pool.query(sql, params);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE
exports.getSingleData = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "SELECT * FROM tbl_class WHERE id = $1";

    const [rows] = await pool.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
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

// CREATE
exports.createData = async (req, res) => {
  try {
    const { class_name, status } = req.body;

    if (!class_name) {
      return res.status(400).json({
        success: false,
        message: "Class name is required",
      });
    }

    // Check for duplicate name
    const [existing] = await pool.query("SELECT id FROM tbl_class WHERE class_name = $1", [class_name]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A class with this name already exists",
      });
    }

    const sql = "INSERT INTO tbl_class (class_name, status) VALUES ($1, $2) RETURNING id";

    const [result] = await pool.query(sql, [class_name, status || 'active']);

    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      insertId: result[0]?.id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_name, status } = req.body;

    // Check for duplicate name (excluding current ID)
    const [existing] = await pool.query("SELECT id FROM tbl_class WHERE class_name = $1 AND id != $2", [class_name, id]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Another class with this name already exists",
      });
    }

    const sql =
      "UPDATE tbl_class SET class_name = $1, status = $2 WHERE id = $3";

    const [result] = await pool.query(sql, [
      class_name,
      status || 'active',
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Class updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "DELETE FROM tbl_class WHERE id = $1";

    const [result] = await pool.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};