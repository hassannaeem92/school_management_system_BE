const pool = require("../config/db.js");

module.exports.createSubject = async (req, res) => {
    try {
        const { name, description = null } = req.body;
        const con = await pool.getConnection();

        try {
            const [subjectExists] = await con.query(`SELECT * FROM subjects WHERE name = ?`, [name]);
            if (subjectExists.length > 0) {
                return res.status(400).json({ status: 400, error: { msg: "Subject already exists!" } });
            }

            await con.query(`INSERT INTO subjects (name, description) VALUES (?, ?)`, [name, description]);

            return res.status(200).json({ status: 200, success: { msg: "Subject created successfully" } });

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


module.exports.updateSubject = async (req, res) => {
    try {
        const { id, name, description = null } = req.body;
        const con = await pool.getConnection();

        try {
            const [subjectExists] = await con.query(`SELECT * FROM subjects WHERE name = ? AND id != ?`, [name, id]);
            if (subjectExists.length > 0) {
                return res.status(400).json({ error: { msg: "Subject with this name already exists!" } });
            }

            await con.query(`UPDATE subjects SET name = ?, description = ? WHERE id = ?`, [name, description, id]);

            return res.status(200).json({ status: 200, success: { msg: "Subject updated successfully" } });

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


module.exports.getAllSubjects = async (req, res) => {
    try {
        const { searchKeyWord = "", pageNumber = 1, pageSize = 10 } = req.body;
        const offset = (pageNumber - 1) * pageSize;
        const con = await pool.getConnection();

        try {
            const [totalResult] = await con.query(`SELECT COUNT(*) AS total FROM subjects WHERE name LIKE ?`, [`%${searchKeyWord}%`]);

            const [subjects] = await con.query(
                `SELECT * FROM subjects WHERE name LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?`,
                [`%${searchKeyWord}%`, parseInt(pageSize), offset]
            );

            return res.status(200).json({
                status: 200,
                total: totalResult[0].total,
                pageSize,
                pageNumber,
                totalPages: Math.ceil(totalResult[0].total / pageSize),
                subjects
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


module.exports.getSubjectById = async (req, res) => {
    try {
        const { id } = req.body;
        const con = await pool.getConnection();

        try {
            const [result] = await con.query(`SELECT * FROM subjects WHERE id = ?`, [id]);

            return res.status(200).json({ status: 200, subject: result });

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


module.exports.deleteSubject = async (req, res) => {
    try {
        const { ids } = req.body;
        const con = await pool.getConnection();

        try {
            const [subjectExists] = await con.query(`SELECT * FROM subjects WHERE id IN (?)`, [ids]);

            if (subjectExists.length === 0) {
                return res.status(404).json({ status: 404, error: { msg: "Subjects not found" } });
            }

            const [deleteResult] = await con.query(`DELETE FROM subjects WHERE id IN (?)`, [ids]);

            if (deleteResult.affectedRows > 0) {
                return res.status(200).json({ status: 200, msg: "Subjects deleted successfully" });
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
