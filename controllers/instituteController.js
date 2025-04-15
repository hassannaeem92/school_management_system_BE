const pool = require("../config/db.js");


module.exports.createOrUpdateInstitute = async (req, res) => {
    let connection;
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();

        const { name, founded_year, phone, address, reg_num, primary_color, secondary_color, logo, founder_name } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const companylogo = req.file.filename; // Get uploaded file name

        // Check if the record with ID 1 exists
        const checkQuery = `SELECT id FROM institute_setup WHERE id = 1`;
        const [rows] = await connection.query(checkQuery);

        if (rows.length > 0) {
            // Update existing record with ID 1
            const updateQuery = `
                UPDATE institute_setup SET 
                    name = ?,
                    founded_year = ?,
                    phone = ?,
                    address = ?,
                    reg_num = ?,
                    primary_color = ?,
                    secondary_color = ?,
                    logo = ?,
                    founder_name = ?
                WHERE id = 1
            `;
            await connection.query(updateQuery, [name, founded_year, phone, address, reg_num, primary_color, secondary_color, companylogo, founder_name]);
            
            // Release connection back to the pool
            connection.release();
            return res.status(200).json({
                message: "Institute updated successfully",
                instituteId: 1
            });
        } else {
            // Insert new record with ID 1
            const insertQuery = `
                INSERT INTO institute_setup (id, name, founded_year, phone, address, reg_num, primary_color, secondary_color, logo, founder_name)
                VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await connection.query(insertQuery, [name, founded_year, phone, address, reg_num, primary_color, secondary_color, companylogo, founder_name]);
            
            // Release connection back to the pool
            connection.release();
            return res.status(201).json({
                message: "Institute created successfully",
                instituteId: 1
            });
        }

    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({
            error: { msg: "Internal server error" }
        });
    } finally {
        if (connection) connection.release(); // Ensure the connection is always released
    }
};

module.exports.getAllInstitutes = async (req, res) => {
    let connection;
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();

        // SQL Query to get all institutes
        const selectQuery = `SELECT * FROM institute_setup`;
        
        const [results] = await connection.query(selectQuery);
        
        // Release connection back to the pool
        connection.release();

        return res.status(200).json({
            data: results.length > 0 ? results[0] : null
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