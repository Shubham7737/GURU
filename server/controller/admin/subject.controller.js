const pool = require("../../config/db");

// GET ALL SUBJECTS
exports.getAllData = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT 
        s.*,
        c.class_name
      FROM tbl_subject s
      LEFT JOIN tbl_class c ON s.class_id = c.id
    `;
    
    let params = [];
    if (status) {
      sql += " WHERE s.status = $1";
      params.push(status);
    }

    sql += " ORDER BY s.id DESC";
    const [rows] = await pool.query(sql, params);

    const mappedData = rows.map(item => {
      let subjectNameParsed;
      try {
        subjectNameParsed = JSON.parse(item.subject_name);
      } catch (e) {
        subjectNameParsed = item.subject_name;
      }

      let statusString;
      if (item.status === 0 || item.status === 'active') {
        statusString = 'active';
      } else if (item.status === 1 || item.status === 'inactive') {
        statusString = 'inactive';
      } else {
        statusString = String(item.status).toLowerCase();
      }

      return {
        ...item,
        subject_name: subjectNameParsed,
        status: statusString
      };
    });

    return res.status(200).json({
      success: true,
      data: mappedData,
    });
  } catch (error) {
    console.error('GET ALL SUBJECTS ERROR:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE SUBJECT
exports.getSingleData = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        s.*,
        c.class_name
      FROM tbl_subject s
      LEFT JOIN tbl_class c ON s.class_id = c.id
      WHERE s.id = $1
    `;
    const [rows] = await pool.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    let subjectNameParsed;
    try {
      subjectNameParsed = JSON.parse(rows[0].subject_name);
    } catch (e) {
      subjectNameParsed = rows[0].subject_name;
    }

    let statusString;
    if (rows[0].status === 0 || rows[0].status === 'active') {
      statusString = 'active';
    } else if (rows[0].status === 1 || rows[0].status === 'inactive') {
      statusString = 'inactive';
    } else {
      statusString = String(rows[0].status).toLowerCase();
    }

    return res.status(200).json({
      success: true,
      data: {
        ...rows[0],
        subject_name: subjectNameParsed,
        status: statusString
      },
    });
  } catch (error) {
    console.error('GET SINGLE SUBJECT ERROR:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE SUBJECT
exports.createData = async (req, res) => {
  try {
    const { class_id, subject_name, status } = req.body;

    // console.log('=== CREATE SUBJECT REQUEST ===');
    // console.log('req.body:', req.body);

    if (!class_id || !subject_name) {
      return res.status(400).json({
        success: false,
        message: "Class and Subject are required",
      });
    }

    const normalizedStatus = status && status.toLowerCase() === 'inactive' ? 'inactive' : 'active';

    const subjectNameToSave = Array.isArray(subject_name) 
      ? JSON.stringify(subject_name) 
      : subject_name;

    // Check for duplicate subject in the SAME class
    const [existing] = await pool.query("SELECT id FROM tbl_subject WHERE class_id = $1 AND subject_name = $2", [class_id, subjectNameToSave]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This subject already exists for this class",
      });
    }

    const sql = "INSERT INTO tbl_subject (class_id, subject_name, status) VALUES ($1, $2, $3) RETURNING id";
    const values = [class_id, subjectNameToSave, normalizedStatus];

    // console.log('SQL Query:', sql);
    // console.log('SQL Values:', values);

    const [result] = await pool.query(sql, values);

    // console.log('Insert Result:', result);

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      insertId: result[0]?.id || result.insertId,
    });
  } catch (error) {
    console.error('CREATE SUBJECT ERROR:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE SUBJECT
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id, subject_name, status } = req.body;

    // console.log('=== UPDATE SUBJECT REQUEST ===');
    // console.log('ID:', id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const normalizedStatus = status && status.toLowerCase() === 'inactive' ? 'inactive' : 'active';

    const subjectNameToSave = Array.isArray(subject_name) 
      ? JSON.stringify(subject_name) 
      : subject_name;

    // Check for duplicate subject (excluding current ID)
    const [existing] = await pool.query("SELECT id FROM tbl_subject WHERE class_id = $1 AND subject_name = $2 AND id != $3", [class_id, subjectNameToSave, id]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Another subject with this name already exists in this class",
      });
    }

    const sql = "UPDATE tbl_subject SET class_id = $1, subject_name = $2, status = $3 WHERE id = $4";
    const values = [class_id, subjectNameToSave, normalizedStatus, id];

    // console.log('SQL Query:', sql);
    // console.log('SQL Values:', values);

    const [result] = await pool.query(sql, values);

    // console.log('Update Result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
    });
  } catch (error) {
    console.error('UPDATE SUBJECT ERROR:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE SUBJECT
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log('=== DELETE SUBJECT REQUEST ===');
    // console.log('ID:', id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const sql = "DELETE FROM tbl_subject WHERE id = $1";
    const [result] = await pool.query(sql, [id]);

    // console.log('Delete Result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error('DELETE SUBJECT ERROR:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};