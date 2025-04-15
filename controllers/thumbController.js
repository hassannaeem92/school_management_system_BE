const pool = require("../config/conn.js"); // Ensure correct database connection import

// ✅ Add or Update Student Thumb
module.exports.addOrUpdateStudentThumb = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { student_id, relation, name, impression_picture } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("Student ID:", student_id);
        const profilePhoto = req.file.filename; // Get uploaded file name
        console.log("Filename:", profilePhoto);
        // Check if student_thumb already exists for the given student_id
        const checkQuery = `SELECT 1 FROM student_thumb WHERE student_id = ? LIMIT 1`;
        const [existingRecord] = await connection.query(checkQuery, [student_id]);

        if (existingRecord.length > 0) {
            // ✅ Update existing record
            const updateQuery = `
                UPDATE student_thumb SET 
                    relation = ?, name = ?, impression_picture = ?
                WHERE student_id = ?`;
            
            const updateValues = [relation, name, profilePhoto, student_id];
            await connection.query(updateQuery, updateValues);
            return res.status(200).json({ staus:200,message: "Student thumb updated successfully!" });
        } else {
            // ❌ Insert new record
            const insertQuery = `
                INSERT INTO student_thumb (student_id, relation, name, impression_picture)
                VALUES (?, ?, ?, ?)`;
            
            const insertValues = [student_id, relation, name, profilePhoto];
            await connection.query(insertQuery, insertValues);
            return res.status(201).json({ status:200,message: "Student thumb added successfully!" });
        }
    } catch (error) {
        console.error("Error in addOrUpdateStudentThumb function:", error);
        return res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
};

// ✅ Get Student Thumb by Student ID
module.exports.getStudentThumbById = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { student_id } = req.params;
        
        const query = `SELECT * FROM student_thumb WHERE student_id = ?`;
        const [results] = await connection.query(query, [student_id]);

        if (results.length > 0) {
            return res.status(200).json({ message: "Student thumb retrieved successfully!", data: results[0] });
        } else {
            return res.status(404).json({ message: "Student thumb not found." });
        }
    } catch (error) {
        console.error("Error in getStudentThumbById function:", error);
        return res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
};

// ✅ Get All Student Thumbs
module.exports.getAllStudentThumbs = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const query = `SELECT * FROM student_thumb`;
        const [results] = await connection.query(query);

        return res.status(200).json({ message: "All student thumbs retrieved successfully!", data: results });
    } catch (error) {
        console.error("Error in getAllStudentThumbs function:", error);
        return res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
};

// ✅ Delete Student Thumb by ID
module.exports.deleteStudentThumb = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { student_id } = req.params;

        const deleteQuery = `DELETE FROM student_thumb WHERE student_id = ?`;
        const [result] = await connection.query(deleteQuery, [student_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Student thumb not found." });
        }
        return res.status(200).json({ message: "Student thumb deleted successfully!" });
    } catch (error) {
        console.error("Error in deleteStudentThumb function:", error);
        return res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
};
