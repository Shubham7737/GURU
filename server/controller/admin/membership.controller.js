const pool = require("../../config/db");

// GET ALL
exports.getAllData = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = "SELECT * FROM tbl_membership";
    let params = [];

    if (status) {
      sql += " WHERE status = $1";
      params.push(status);
    }

    const [rows] = await pool.query(sql, params);

    // if (err) {
    //   return res.status(500).json({
    //   success: false,
    //   message: "data not found",
    // });
    // }

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

    const sql = "SELECT * FROM tbl_membership WHERE id = $1";

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
    const { name, status, duration_time, price } = req.body;

    if (!name || !duration_time || !price) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check for duplicate name
    const [existing] = await pool.query("SELECT id FROM tbl_membership WHERE name = $1", [name]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A membership plan with this name already exists",
      });
    }

    const sql = "INSERT INTO tbl_membership (name, duration_time, price, status) VALUES ($1, $2, $3, $4) RETURNING id";

    const [result] = await pool.query(sql, [name, duration_time, price, status]);

    return res.status(201).json({
      success: true,
      message: "Data created successfully",
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
    const { name, price , duration_time, status } = req.body;

    // Check for duplicate name (excluding current ID)
    const [existing] = await pool.query("SELECT id FROM tbl_membership WHERE name = $1 AND id != $2", [name, id]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Another membership plan with this name already exists",
      });
    }

    const sql =
      "UPDATE tbl_membership SET name = $1, duration_time = $2, price = $3, status = $4 WHERE id = $5";

    const [result] = await pool.query(sql, [
      name, duration_time, price,
      status,
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
      message: "Data updated successfully",
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

    const sql = "DELETE FROM tbl_membership WHERE id = $1";

    const [result] = await pool.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};