const pool = require("../config/db.js");

module.exports.createSubjectMapping = async (req, res) => {
    try {
        const { description, subject_id, smester_id } = req.body;
        const con = await pool.getConnection();

        try {
            const [exists] = await con.query(
                `SELECT * FROM smester_subject_mapping WHERE subject_id = ? AND smester_id = ?`,
                [subject_id, smester_id]
            );

            if (exists.length > 0) {
                return res.status(400).json({ status: 400, error: { msg: "Mapping already exists!" } });
            }

            await con.query(
                `INSERT INTO smester_subject_mapping (description, subject_id, smester_id) VALUES (?, ?, ?)`,
                [description, subject_id, smester_id]
            );

            return res.status(200).json({ status: 200, success: { msg: "Mapping created successfully" } });

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

module.exports.updateSubjectMapping = async (req, res) => {
    try {
        const { id, description, subject_id, smester_id } = req.body;
        const con = await pool.getConnection();

        try {
            const [exists] = await con.query(
                `SELECT * FROM smester_subject_mapping WHERE subject_id = ? AND smester_id = ? AND id != ?`,
                [subject_id, smester_id, id]
            );
            if (exists.length > 0) {
                return res.status(400).json({ error: { msg: "Mapping with this subject and semester already exists!" } });
            }

            await con.query(
                `UPDATE smester_subject_mapping SET description = ?, subject_id = ?, smester_id = ? WHERE id = ?`,
                [description, subject_id, smester_id, id]
            );

            return res.status(200).json({ status: 200, success: { msg: "Mapping updated successfully" } });

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

module.exports.getAllSubjectMappings = async (req, res) => {
    try {
        const { searchKeyWord = "", pageNumber = 1, pageSize = 10 } = req.body;
        const offset = (pageNumber - 1) * pageSize;
        const con = await pool.getConnection();

        try {
            const [totalResult] = await con.query(
                `SELECT COUNT(*) AS total FROM smester_subject_mapping WHERE description LIKE ?`,
                [`%${searchKeyWord}%`]
            );

            const [records] = await con.query(
                `SELECT * FROM smester_subject_mapping WHERE description LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?`,
                [`%${searchKeyWord}%`, parseInt(pageSize), offset]
            );

            return res.status(200).json({
                status: 200,
                total: totalResult[0].total,
                pageSize,
                pageNumber,
                totalPages: Math.ceil(totalResult[0].total / pageSize),
                mappings: records
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

module.exports.getSubjectMappingById = async (req, res) => {
    try {
        const { id } = req.body;
        const con = await pool.getConnection();

        try {
            const [result] = await con.query(`SELECT * FROM smester_subject_mapping WHERE id = ?`, [id]);

            return res.status(200).json({ status: 200, mapping: result });

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

module.exports.deleteSubjectMappings = async (req, res) => {
    try {
        const { ids } = req.body;
        const con = await pool.getConnection();

        try {
            const [exists] = await con.query(`SELECT * FROM smester_subject_mapping WHERE id IN (?)`, [ids]);

            if (exists.length === 0) {
                return res.status(404).json({ status: 404, error: { msg: "Mappings not found" } });
            }

            const [deleteResult] = await con.query(`DELETE FROM smester_subject_mapping WHERE id IN (?)`, [ids]);

            if (deleteResult.affectedRows > 0) {
                return res.status(200).json({ status: 200, msg: "Mappings deleted successfully" });
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
