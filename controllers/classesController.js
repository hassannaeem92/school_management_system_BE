const pool = require("../config/db.js");

module.exports.createClass = async (req, res) => {
    try {
        const { className } = req.body;
        const con = await pool.getConnection();

        try {
            // Check if class already exists
            const [classExists] = await con.query(`SELECT * FROM classes WHERE class_name = ?`, [className]);
            console.log(classExists)
            if (classExists.length > 0) {
                return res.status(400).json({ status: 400, error: { msg: "Class already exists!" } });
            }

            // Insert new class
            await con.query(`INSERT INTO classes (class_name) VALUES (?)`, [className]);

            return res.status(200).json({ status: 200, success: { msg: "Class created successfully" } });

        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ error: { msg: "Internal server error" } });
        } finally {
            con.release();
        }
    } catch (error) {
        console.error("Database connection error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};

module.exports.updateClass = async (req, res) => {
    try {
        const { classId, className } = req.body;
        const con = await pool.getConnection();

        try {
            // Check if class already exists
            const [classExists] = await con.query(`SELECT * FROM classes WHERE class_name = ?`, [className]);

            if (classExists.length > 0) {
                return res.status(400).json({ error: { msg: "Class already exists!" } });
            }

            // Update class
            await con.query(`UPDATE classes SET class_name = ? WHERE class_id = ?`, [className, classId]);

            return res.status(200).json({ status: 200, success: { msg: "Class updated successfully" } });

        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ error: { msg: "Internal server error" } });
        } finally {
            con.release();
        }
    } catch (error) {
        console.error("Database connection error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};

module.exports.getAllClass = async (req, res) => {
    try {
        const { searchKeyWord = "", pageNumber = 1, pageSize = 10 } = req.body;
        const offset = (pageNumber - 1) * pageSize;
        const con = await pool.getConnection();

        try {
            // Get total class count
            const [totalResult] = await con.query(`SELECT COUNT(*) AS total FROM classes WHERE class_name LIKE ?`, [`%${searchKeyWord}%`]);

            // Fetch classes
            const [classes] = await con.query(
                `SELECT * FROM classes WHERE class_name LIKE ? ORDER BY class_id DESC LIMIT ? OFFSET ?`,
                [`%${searchKeyWord}%`, parseInt(pageSize), offset]
            );

            return res.status(200).json({
                status: 200,
                total: totalResult[0].total,
                pageSize,
                pageNumber,
                totalPages: Math.ceil(totalResult[0].total / pageSize),
                classes
            });

        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ error: { msg: "Internal server error" } });
        } finally {
            con.release();
        }
    } catch (error) {
        console.error("Database connection error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};

module.exports.getClassById = async (req, res) => {
    try {
        const { classId } = req.body;
        const con = await pool.getConnection();

        try {
            // Fetch class by ID
            const [result] = await con.query(`SELECT * FROM classes WHERE class_id = ?`, [classId]);

            return res.status(200).json({ status: 200, class: result });

        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ error: { msg: "Internal server error" } });
        } finally {
            con.release();
        }
    } catch (error) {
        console.error("Database connection error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};

module.exports.deleteClass = async (req, res) => {
    try {
        const { classIds } = req.body;
        const con = await pool.getConnection();

        try {
            // Validate class existence
            const [classExists] = await con.query(`SELECT * FROM classes WHERE class_id IN (?)`, [classIds]);

            if (classExists.length === 0) {
                return res.status(404).json({ status: 404, error: { msg: "Class not found" } });
            }

            // Delete from related tables
            await con.query(`DELETE FROM cts_detail WHERE class_id IN (?)`, [classIds]);
            await con.query(`DELETE FROM section_student WHERE class_id IN (?)`, [classIds]);

            // Delete from classes table
            const [deleteResult] = await con.query(`DELETE FROM classes WHERE class_id IN (?)`, [classIds]);

            if (deleteResult.affectedRows > 0) {
                return res.status(200).json({ status: 200, msg: "Classes deleted successfully" });
            } else {
                return res.status(404).json({ status: 404, error: { msg: "No matching records found to delete" } });
            }

        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ error: { msg: "Internal server error" } });
        } finally {
            con.release();
        }
    } catch (error) {
        console.error("Database connection error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};
