const pool = require("../config/conn.js"); // Ensure correct database connection import

// ✅ Add Parent
module.exports.addParent = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { 
            address, email, father_name, father_number, father_occupation, home_number, 
            mother_name, mother_number, mother_occupation, postal_address, student_id
        } = req.body;

        // Check if the student_id already exists
        const checkQuery = `SELECT 1 FROM student_parents WHERE student_id = ? LIMIT 1`;
        const [existingRecord] = await connection.query(checkQuery, [student_id]);

        if (existingRecord.length > 0) {
            // ✅ Record exists, perform an update
            const updateQuery = `
                UPDATE student_parents SET 
                    father_name = ?, father_number = ?, father_occupation = ?, home_number = ?, 
                    mother_name = ?, mother_number = ?, mother_occupation = ?, address = ?, 
                    postal_address = ?, email = ?, updated_at = NOW()
                WHERE student_id = ?`;

            const updateValues = [
                father_name, father_number, father_occupation, home_number, 
                mother_name, mother_number, mother_occupation, address, postal_address, 
                email === "" ? null : email, student_id
            ];

            await connection.query(updateQuery, updateValues);
            return res.status(200).json({ message: "Student`s parent updated successfully!", data: { student_id } });
        } else {
            // ❌ Record does NOT exist, insert a new record
            const insertQuery = `
                INSERT INTO student_parents (
                    student_id, father_name, father_number, father_occupation, home_number, 
                    mother_name, mother_number, mother_occupation, address, postal_address, email,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

            const insertValues = [
                student_id, father_name, father_number, father_occupation, home_number, 
                mother_name, mother_number, mother_occupation, address, postal_address, 
                email === "" ? null : email
            ];

            await connection.query(insertQuery, insertValues);
            return res.status(201).json({ message: "Student`s parent successfully stored!", data: { student_id } });
        }
    } catch (error) {
        console.error("Error in addParent function:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    } finally {
        if (connection) connection.release();
    }
};

// ✅ Get Parent by ID
module.exports.getParentById = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.body;
        console.log("id", id);
        console.log()

        if (!id) {
            console.log("id not found")
            return res.status(400).json({ error: { msg: "Student ID is required" } });
        }

        const query = `SELECT * FROM student_parents WHERE student_id = ?`;
        const [results] = await connection.query(query, [id]);
        console.log("result",results)
        if (results.length > 0) {
            return res.status(200).json({ 
                message: "Parent retrieved successfully!", 
                data: { student: { parent: results[0] } } 
            });
        } else {
            console.log("results not fond", results)
            return res.status(200).json({ message: ""});    
        }
    } catch (error) {
        console.error("Error in getParentById function:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    } finally {
        if (connection) connection.release();
    }
};


// ✅ Get All Parents
module.exports.getAllParents = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const query = `SELECT * FROM student_parents`;
        const [results] = await connection.query(query);

        return res.status(200).json({ message: "Parents retrieved successfully!", data: results });

    } catch (error) {
        console.error("Error in getAllParents function:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    } finally {
        if (connection) connection.release();
    }
};

// ✅ Update Parent by ID
module.exports.updateParentById = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        let { 
            address, email, father_name, father_number, father_occupation, home_number, 
            mother_name, mother_number, mother_occupation, postal_address, id
        } = req.body;
        
        const updateQuery = `
            UPDATE student_parents SET 
                father_name = ?, father_number = ?, father_occupation = ?, home_number = ?,
                mother_name = ?, mother_number = ?, mother_occupation = ?, address = ?, 
                postal_address = ?, email = ?, updated_at = NOW()
            WHERE student_id = ?`;

        const values = [
            father_name, father_number, father_occupation, home_number, 
            mother_name, mother_number, mother_occupation, address, postal_address, 
            email === "" ? null : email, parseInt(id, 10)
        ];

        const [result] = await connection.query(updateQuery, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Parent not found" });
        }

        return res.status(200).json({ message: "Student's parent updated successfully!" });

    } catch (error) {
        console.error("Error in updateParentById function:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    } finally {
        if (connection) connection.release();
    }
};

// ✅ Update Parent Picture
module.exports.updateParentPicture = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { student_id } = req.body;

        if (!student_id) {
            return res.status(400).json({ error: "Student ID is required" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const profilePhoto = req.file.filename; // Get uploaded file name

        const query = `UPDATE student_parents SET parents_picture = ? WHERE student_id = ?`;
        const [result] = await connection.query(query, [profilePhoto, student_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Parent not found" });
        }

        return res.status(200).json({
            data: {
                message: "Parent’s profile photo successfully updated!",
                student_id,
                profile_photo: profilePhoto
            }
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    } finally {
        if (connection) connection.release();
    }
};


