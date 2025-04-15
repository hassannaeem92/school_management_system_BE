const pool = require("../config/conn.js"); // Ensure correct database connection import

// ✅ Add or Update Guardian
module.exports.addOrUpdateGuardian = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { student_id, name, mobile_number, occupation, home_number, address, postal_address, email } = req.body;

        // Check if guardian record exists
        const checkQuery = `SELECT 1 FROM guardians WHERE student_id = ? LIMIT 1`;
        const [existingRecord] = await connection.query(checkQuery, [student_id]);

        if (existingRecord.length > 0) {
            // ✅ Update existing guardian
            const updateQuery = `
                UPDATE guardians SET 
                    name = ?, mobile_number = ?, occupation = ?, home_number = ?, 
                    address = ?, postal_address = ?, email = ?, updated_at = NOW()
                WHERE student_id = ?`;
            
            await connection.query(updateQuery, [
                name, mobile_number, occupation, home_number, address, postal_address,
                email === "" ? null : email, student_id
            ]);
            return res.status(200).json({ message: "Guardian updated successfully!", data: { student_id } });
        } else {
            // ❌ Insert new guardian
            const insertQuery = `
                INSERT INTO guardians (
                    student_id, name, mobile_number, occupation, home_number, address, postal_address, email,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
            
            await connection.query(insertQuery, [
                student_id, name, mobile_number, occupation, home_number, address, postal_address,
                email === "" ? null : email
            ]);
            return res.status(201).json({ message: "Guardian successfully stored!", data: { student_id } });
        }
    } catch (error) {
        console.error("Error in addOrUpdateGuardian function:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    } finally {
        if (connection) connection.release();
    }
};

// ✅ Get Guardian by Student ID
module.exports.getGuardianByStudentId = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { student_id } = req.body;

        if (!student_id) {
            return res.status(400).json({ error: { msg: "Student ID is required" } });
        }

        const query = `SELECT * FROM guardians WHERE student_id = ?`;
        const [results] = await connection.query(query, [student_id]);

        if (results.length > 0) {
            return res.status(200).json({ message: "Guardian retrieved successfully!", data: results[0] });
        } else {
            return res.status(404).json({ message: "Guardian not found" });
        }
    } catch (error) {
        console.error("Error in getGuardianByStudentId function:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    } finally {
        if (connection) connection.release();
    }
};

// ✅ Get All Guardians
module.exports.getAllGuardians = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const query = `SELECT * FROM guardians`;
        const [results] = await connection.query(query);

        return res.status(200).json({ message: "Guardians retrieved successfully!", data: results });
    } catch (error) {
        console.error("Error in getAllGuardians function:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    } finally {
        if (connection) connection.release();
    }
};

// ✅ Delete Guardian by Student ID
module.exports.deleteGuardianByStudentId = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { student_id } = req.body;

        if (!student_id) {
            return res.status(400).json({ error: { msg: "Student ID is required" } });
        }

        const deleteQuery = `DELETE FROM guardians WHERE student_id = ?`;
        const [result] = await connection.query(deleteQuery, [student_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Guardian not found" });
        }

        return res.status(200).json({ message: "Guardian deleted successfully!" });
    } catch (error) {
        console.error("Error in deleteGuardianByStudentId function:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    } finally {
        if (connection) connection.release();
    }
};
