const pool = require("../config/db.js");

module.exports.createSemester = async (req, res) => {
    try {
        const { name, degree_id } = req.body;
        const con = await pool.getConnection();

        try {
            const [exists] = await con.query(
                `SELECT * FROM smester WHERE name = ? AND degree_id = ?`,
                [name, degree_id]
            );

            if (exists.length > 0) {
                return res.status(400).json({ status: 400, error: { msg: "Semester already exists for this degree!" } });
            }

            await con.query(`INSERT INTO smester (name, degree_id) VALUES (?, ?)`, [name, degree_id]);

            return res.status(200).json({ status: 200, success: { msg: "Semester created successfully" } });

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

module.exports.updateSemester = async (req, res) => {
    try {
        const { id, name, degree_id } = req.body;
        const con = await pool.getConnection();

        try {
            const [exists] = await con.query(
                `SELECT * FROM smester WHERE name = ? AND degree_id = ? AND id != ?`,
                [name, degree_id, id]
            );

            if (exists.length > 0) {
                return res.status(400).json({ error: { msg: "Semester with this name already exists for the degree!" } });
            }

            await con.query(`UPDATE smester SET name = ?, degree_id = ? WHERE id = ?`, [name, degree_id, id]);

            return res.status(200).json({ status: 200, success: { msg: "Semester updated successfully" } });

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

module.exports.getAllSemesters = async (req, res) => {
    try {
        const { searchKeyWord = "", pageNumber = 1, pageSize = 10 } = req.body;
        const offset = (pageNumber - 1) * pageSize;
        const con = await pool.getConnection();

        try {
            const [totalResult] = await con.query(
                `SELECT COUNT(*) AS total FROM smester WHERE name LIKE ?`,
                [`%${searchKeyWord}%`]
            );

            const [semesters] = await con.query(
                `SELECT * FROM smester WHERE name LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?`,
                [`%${searchKeyWord}%`, parseInt(pageSize), offset]
            );

            return res.status(200).json({
                status: 200,
                total: totalResult[0].total,
                pageSize,
                pageNumber,
                totalPages: Math.ceil(totalResult[0].total / pageSize),
                semesters
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

module.exports.getSemesterById = async (req, res) => {
    try {
        const { id } = req.body;
        const con = await pool.getConnection();

        try {
            const [result] = await con.query(`SELECT * FROM smester WHERE id = ?`, [id]);

            return res.status(200).json({ status: 200, semester: result });

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

module.exports.deleteSemesters = async (req, res) => {
    try {
        const { ids } = req.body;
        const con = await pool.getConnection();

        try {
            const [exists] = await con.query(`SELECT * FROM smester WHERE id IN (?)`, [ids]);

            if (exists.length === 0) {
                return res.status(404).json({ status: 404, error: { msg: "Semesters not found" } });
            }

            const [deleteResult] = await con.query(`DELETE FROM smester WHERE id IN (?)`, [ids]);

            if (deleteResult.affectedRows > 0) {
                return res.status(200).json({ status: 200, msg: "Semesters deleted successfully" });
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
