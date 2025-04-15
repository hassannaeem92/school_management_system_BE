const pool = require("../config/db.js");




module.exports.getBloodGroups = async (req, res) => {
    let connection;
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();

        let get_blood_group_query = `
            SELECT id AS id, blood_group AS blood_group FROM blood_groups
        `;

        const [results] = await connection.query(get_blood_group_query);

        // Release connection back to the pool
        connection.release();

        return res.status(200).json({
            data: {
                blood_groups: results
            }
        });

    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({
            error: { msg: "Internal server error" }
        });
    } finally {
        if (connection) connection.release(); // Ensure the connection is always released
    }
};



module.exports.getReligions = async (req, res) => {
    let connection;
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();

        let get_religions_query = `SELECT id AS id, religion AS religion FROM religions`;

        const [results] = await connection.query(get_religions_query);

        return res.status(200).json({
            data: {
                religions: results
            }
        });

    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    } finally {
        if (connection) connection.release(); // Ensure the connection is always released
    }
};

    
module.exports.getGender = async (req, res) => {
    let connection;
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();

        let get_gender_query = `SELECT id AS id, gender AS gender FROM genders`;

        const [results] = await connection.query(get_gender_query);

        return res.status(200).json({
            data: {
                genders: results
            }
        });

    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    } finally {
        if (connection) connection.release(); // Ensure the connection is always released
    }
};

module.exports.getAllRelations = async (req, res) => {
    try {
        const sql = "SELECT * FROM receiver_relations WHERE deleted_at IS NULL";
        const [relations] = await pool.execute(sql);
        res.json({ success: true, data: {receiver_relations:relations}});
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
