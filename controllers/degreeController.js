const pool = require("../config/db.js");

module.exports.createDegree = async (req, res) => {
    try {
        const { name } = req.body; // 'name' corresponds to the degree name
        const con = await pool.getConnection();

        try {
            // Check if degree already exists
            const [degreeExists] = await con.query(`SELECT * FROM degree WHERE name = ?`, [name]);
            if (degreeExists.length > 0) {
                return res.status(400).json({ status: 400, error: { msg: "Degree already exists!" } });
            }

            // Insert new degree
            await con.query(`INSERT INTO degree (name) VALUES (?)`, [name]);

            return res.status(200).json({ status: 200, success: { msg: "Degree created successfully" } });

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


module.exports.updateDegree = async (req, res) => {
    try {
        const { id, name } = req.body;
        const con = await pool.getConnection();

        try {
            const [degreeExists] = await con.query(`SELECT * FROM degree WHERE name = ? AND id != ?`, [name, id]);
            if (degreeExists.length > 0) {
                return res.status(400).json({ error: { msg: "Degree with this name already exists!" } });
            }

            await con.query(`UPDATE degree SET name = ? WHERE id = ?`, [name, id]);

            return res.status(200).json({ status: 200, success: { msg: "Degree updated successfully" } });

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



module.exports.getAllDegree = async (req, res) => {
    try {
        const { searchKeyWord = "", pageNumber = 1, pageSize = 10 } = req.body;
        const offset = (pageNumber - 1) * pageSize;
        const con = await pool.getConnection();

        try {
            const [totalResult] = await con.query(`SELECT COUNT(*) AS total FROM degree WHERE name LIKE ?`, [`%${searchKeyWord}%`]);

            const [degrees] = await con.query(
                `SELECT * FROM degree WHERE name LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?`,
                [`%${searchKeyWord}%`, parseInt(pageSize), offset]
            );

            return res.status(200).json({
                status: 200,
                total: totalResult[0].total,
                pageSize,
                pageNumber,
                totalPages: Math.ceil(totalResult[0].total / pageSize),
                degrees
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


module.exports.getDegreeById = async (req, res) => {
    try {
        const { id } = req.body;
        const con = await pool.getConnection();

        try {
            const [result] = await con.query(`SELECT * FROM degree WHERE id = ?`, [id]);

            return res.status(200).json({ status: 200, degree: result });

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


module.exports.deleteDegree = async (req, res) => {
    try {
        const { ids } = req.body;
        const con = await pool.getConnection();

        try {
            const [degreeExists] = await con.query(`SELECT * FROM degree WHERE id IN (?)`, [ids]);

            if (degreeExists.length === 0) {
                return res.status(404).json({ status: 404, error: { msg: "Degrees not found" } });
            }

            const [deleteResult] = await con.query(`DELETE FROM degree WHERE id IN (?)`, [ids]);

            if (deleteResult.affectedRows > 0) {
                return res.status(200).json({ status: 200, msg: "Degrees deleted successfully" });
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
