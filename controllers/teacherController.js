const pool = require("../config/db.js");
const fs = require('fs');
const path = require('path');
// Dropdown Api
module.exports.getAllTeachersDropdown1 = async (req, res) => {
    try {
        // const {
        //     sectionName
        // } = req.body


        // const sessionNameExistsQuery = `SELECT * FROM teachers WHERE status = 'Active'`;
         const sessionNameExistsQuery = `SELECT * 
         FROM teachers t
         LEFT JOIN cts_detail c ON t.teacher_id = c.teacher_id
         WHERE t.status = 'Active' AND c.teacher_id IS NULL;
         `;

        const con = await pool.getConnection();

        try {

            con.query(sessionNameExistsQuery, (err, result) => {
                
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        status: 500,
                        error: {
                            msg: "Internal server error"
                        }
                    });
                } else {
                    return res.status(200).json({
                        status: 200,
                        result: {
                            records: result
                        }
                    });
                }
            });

            // If the class doesn't exist, you can proceed with further operations
        } catch (error) {
            return res.status(500).json({
                error: {
                    msg: "Internal server error"
                }
            });
        }

    } catch {

    }
}


module.exports.getAllTeachersDropdown = async (req, res) => {
    try {
        const con = await pool.getConnection();

        try {
            const sessionNameExistsQuery = `
                SELECT * 
                FROM teachers t
                LEFT JOIN cts_detail c ON t.id = c.teacher_id
                WHERE t.status = 'Active' AND c.teacher_id IS NULL;
            `;

            const [result] = await con.query(sessionNameExistsQuery);
            return res.status(200).json({
                status: 200,
                result: { records: result }
            });
        } catch (error) {
            console.error("Error executing query:", error);
            return res.status(500).json({ status: 500, error: { msg: "Internal server error" } });
        } finally {
            con.release();
        }
    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ status: 500, error: { msg: "Internal server error" } });
    }
};

// module.exports.getAllTeachers = async (req, res) => {
//     try {
//         const get_all_teacher_query = `
//             SELECT * 
//             FROM teachers
//         `;

//         const con = await pool.getConnection();

//         const results = await connection.query(get_all_teacher_query);
//         return res.status(200).json({
//             status: 200,
//             data: results,
//             message: "Fee created successfully"
//         });
//     } catch (error) {
//         console.error("Internal server error:", error);
//         return res.status(500).json({
//             status: 500,
//             error: {
//                 msg: "Internal server error"
//             }
//         });
//     }
// };


module.exports.getAllTeachers = async (req, res) => {
    try {
        const { first_name, page_number, page_size } = req.body;
        const offset = (page_number - 1) * page_size;

        const get_pagination_teachers_query = `
            SELECT * FROM teachers where first_name	like '%${first_name}%' LIMIT ? OFFSET ?
        `;
        const get_count_teacher_query = `
            SELECT COUNT(*) AS count FROM teachers
        `;

        // Get a connection from the pool
        const con = await pool.getConnection();
        
        try {
            // Execute the queries
            const [students] = await con.query(get_pagination_teachers_query, [parseInt(page_size), offset]);
            const [countResult] = await con.query(get_count_teacher_query);

            // Release the connection back to the pool
            con.release();

            // Convert number values to strings (except `id`)
            const convertedData = students.map(obj => {
                return Object.fromEntries(
                    Object.entries(obj).map(([key, value]) =>
                        key === "id" || typeof value !== "number" ? [key, value] : [key, value.toString()]
                    )
                );
            });

            let finalOutput = {
                count: countResult[0].count,
                teacher: {
                    current_page: page_number,
                    data: convertedData,
                    first_page_url: "",
                    from: 1,
                    next_page_url: "",
                    path: "",
                    per_page: page_size,
                    prev_page_url: null,
                    to: page_size
                }
            };

            return res.status(200).json({
                status: 200,
                count: countResult[0].count,
                data: finalOutput
            });

        } catch (error) {
            // Release connection in case of query error
            con.release();
            console.error("Error executing query:", error);
            return res.status(500).json({ error: { msg: "Internal server error" } });
        }

    } catch (error) {
        console.error("Database connection error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};


module.exports.createTeacher = async (req, res) => {
    let connection;
    try {
        const {
            first_name,
            last_name,
            date_of_birth,
            registration_date,
            phone_number,
            email,
            blood_group_id,
            religion_id,
            gender_id,
            experience_in_years,
            status
        } = req.body;

        // Convert status to match ENUM values
        const statusValue = status === "true" ? "Active" : "Deactivate";

        connection = await pool.getConnection(); // Get a connection from the pool

        // Check if the teacher already exists
        const teacherExistsQuery = `SELECT * FROM teachers WHERE phone_number = ?`;
        const [existingTeacher] = await connection.query(teacherExistsQuery, [phone_number]);

        if (existingTeacher.length > 0) {
            return res.status(400).json({
                status: 400,
                error: { message: "A teacher with this phone already exists" }
            });
        }

        // Insert a new teacher entry
        const insertTeacherQuery = `
            INSERT INTO teachers (
                first_name, last_name, date_of_birth, registration_date, phone_number,
                email, blood_group_id, religion_id, gender_id, experience_in_years, status,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        await connection.query(insertTeacherQuery, [
            first_name, last_name, date_of_birth, registration_date, phone_number,
            email, blood_group_id, religion_id, gender_id, experience_in_years, statusValue
        ]);

        return res.status(201).json({
            status: 201,
            success: { msg: "Teacher create SuccessFully" }
        });
    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({
            status: 500,
            error: { msg: "Internal server error" }
        });
    } finally {
        if (connection) connection.release(); // Ensure the connection is always released
    }
};

module.exports.getTeacher = async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.status(400).json({ error: { msg: "Teacher ID is required" } });
        }

        const get_teacher_by_id = `SELECT * FROM teachers WHERE id = ?`;

        // Get a connection from the pool
        const con = await pool.getConnection();

        try {
            // Execute query using parameterized input to prevent SQL injection
            const [results] = await con.query(get_teacher_by_id, [id]);

            // Release the connection back to the pool
            con.release();

            if (results.length === 0) {
                return res.status(404).json({ error: { msg: "Teacher not found" } });
            }

            return res.status(200).json({
                status: 200,
                data: {
                    teacher: results[0]
                }
            });

        } catch (error) {
            console.error("Error executing query:", error);
            return res.status(500).json({ error: { msg: "Internal server error" } });
        } finally {
            con.release(); // Ensure connection is always released
        }

    } catch (error) {
        console.error("Database connection error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};

module.exports.updateTeacher = async (req, res) => {
    let connection;
    try {
        const {
            first_name,
            last_name,
            date_of_birth,
            registration_date,
            phone_number, // Assuming phone_number is the unique identifier
            email,
            blood_group_id,
            religion_id,
            gender_id,
            experience_in_years,
            status,
            place_of_birth,
            id
        } = req.body;

        // Convert status to match ENUM values
        const statusValue = status === "true" ? "Active" : "Deactivate";

        connection = await pool.getConnection(); // Get a connection from the pool

        // Check if the teacher exists
        // const teacherExistsQuery = `SELECT * FROM teachers WHERE phone_number = ?`;
        // const [existingTeacher] = await connection.query(teacherExistsQuery, [phone_number]);

        // if (existingTeacher.length === 0) {
        //     return res.status(404).json({
        //         status: 404,
        //         error: { message: "Teacher not found" }
        //     });
        // }

        // Update the teacher's information
        const updateTeacherQuery = `
            UPDATE teachers 
            SET 
                first_name = ?, 
                last_name = ?, 
                date_of_birth = ?, 
                registration_date = ?, 
                email = ?, 
                blood_group_id = ?,
                place_of_birth = ?,
                religion_id = ?, 
                gender_id = ?, 
                experience_in_years = ?, 
                status = ?, 
                updated_at = NOW(),
                phone_number = ?
            WHERE id = ?
        `;

        await connection.query(updateTeacherQuery, [
            first_name, last_name, date_of_birth, registration_date, email, 
            blood_group_id, place_of_birth,
            religion_id, gender_id, experience_in_years, statusValue, phone_number, id
        ]);

        return res.status(200).json({
            status: 200,
            responseMessage:"Teacher updated successfully",
            success: { msg: "Teacher updated successfully" }
        });
    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({
            status: 500,
            error: { msg: "Internal server error" }
        });
    } finally {
        if (connection) connection.release(); // Ensure the connection is always released
    }
};


module.exports.updatePicture = async (req, res) => {
    let connection;
    try {
       
        const { teacher_id } = req.body;

        if (!teacher_id) {
            return res.status(400).json({ error: "Student ID is required" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const profilePhoto = req.file.filename; // Get uploaded file name
        
        // Get a connection from the pool
        connection = await pool.getConnection();

        const query = `UPDATE teachers SET profile_photo = ? WHERE id = ?`;
        const [result] = await connection.query(query, [profilePhoto, teacher_id]);

        // Release connection back to the pool
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        console.log("Database update successful:", result);

        return res.status(200).json({
            data: {
                message: "Teacher's profile photo successfully updated!",
                teacher_id,
                profile_photo: profilePhoto
            }
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    } finally {
        if (connection) connection.release(); // Ensure the connection is always released
    }
};
module.exports.getTeacherDocument = async (req, res) => {
    try {
        const { teacher_id } = req.body;
        
        if (!teacher_id) {
            return res.status(200).json({ error: { msg: "Teacher ID is required" } });
        }

        const get_document_by_id = `SELECT * FROM teacher_documents WHERE teacher_id = ?`;

        // Get a connection from the pool
        const con = await pool.getConnection();

        try {
            // Execute query using parameterized input to prevent SQL injection
            const [results] = await con.query(get_document_by_id, [teacher_id]);

            // Release the connection back to the pool
            con.release();

            if (results.length === 0) {
                return res.status(200).json({ error: { msg: "Teacher document not found" } });
            }

            return res.status(200).json({
                status: 200,
                data: {
                        document: results[0]
                    
                }
            });

        } catch (error) {
            console.error("Error executing query:", error);
            return res.status(500).json({ error: { msg: "Internal server error" } });
        } finally {
            con.release(); // Ensure connection is always released
        }

    } catch (error) {
        console.error("Database connection error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};
module.exports.updateDocument = async (req, res) => {
    let connection;
    try {
        // Validate inputs
        const { teacher_id } = req.body;
        if (!teacher_id) {
            return res.status(400).json({ error: "Teacher ID is required" });
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: "At least one file is required" });
        }
        
        // Extract filenames with null checks
        const cv = req.files?.cv?.[0]?.filename || null;
        const cnic = req.files?.cnic?.[0]?.filename || null;
        const matriculation = req.files?.matriculation?.[0]?.filename || null;
        const inter_or_higher = req.files?.inter_or_higher?.[0]?.filename || null;
        const agreement = req.files?.agreement?.[0]?.filename || null;
        const experience_letter = req.files?.experience_letter?.[0]?.filename || null;

        // Ensure at least one document is provided
        if (!cv && !cnic && !matriculation  && !inter_or_higher  && !agreement  && !experience_letter) {
            return res.status(400).json({ error: "No valid documents provided" });
        }

        // Get database connection
        connection = await pool.getConnection();

        // Start transaction
        await connection.beginTransaction();

        // Check existing record
        const checkQuery = "SELECT * FROM teacher_documents WHERE teacher_id = ?";
        const [existingteacher] = await connection.query(checkQuery, [teacher_id]);

        if (existingteacher.length > 0) {


                if(cv && existingteacher[0]?.cv){
                    console.log("in if...", existingteacher[0].cv);
                    await deleteFile(existingteacher[0]?.cv)
                }   
                
                if(cnic && existingteacher[0]?.cnic){
                    console.log("in if...", existingteacher[0].cnic);
                    await deleteFile(existingteacher[0]?.cnic)
                }   
                
                if(matriculation && existingteacher[0]?.matriculation){
                    console.log("in if...", existingteacher[0].matriculation);
                    await deleteFile(existingteacher[0]?.matriculation)
                }   

                if(inter_or_higher && existingteacher[0]?.inter_or_higher){
                    console.log("in if...", existingteacher[0].inter_or_higher);
                    await deleteFile(existingteacher[0]?.inter_or_higher)
                }   

                if(agreement && existingteacher[0]?.agreement){
                    console.log("in if...", existingteacher[0].agreement);
                    await deleteFile(existingteacher[0]?.agreement)
                }   

                if(experience_letter && existingteacher[0]?.experience_letter){
                    console.log("in if...", existingteacher[0].experience_letter);
                    await deleteFile(existingteacher[0]?.experience_letter)
                }   
            

            // Update existing record
            const updateQuery = `
                UPDATE teacher_documents 
                SET 
                    cv = COALESCE(?, cv),
                    cnic = COALESCE(?, cnic),
                    matriculation = COALESCE(?, matriculation),
                    inter_or_higher = COALESCE(?, inter_or_higher),
                    agreement = COALESCE(?, agreement),
                    experience_letter = COALESCE(?, experience_letter)
                WHERE teacher_id = ?
            `;
            await connection.query(updateQuery, [
                cv,
                cnic,
                matriculation,
                inter_or_higher,
                agreement,
                experience_letter,
                teacher_id
            ]);

            await connection.commit();
            return res.status(200).json({
                data: {
                    message: "Teacher documents updated successfully",
                    teacher_id,
                    updated_documents: { cv, cnic, matriculation,inter_or_higher,agreement,experience_letter }
                }
            });
        } else {
            // Insert new record
            const insertQuery = `
                INSERT INTO teacher_documents 
                (teacher_id, cv, cnic, matriculation,inter_or_higher,agreement, experience_letter
               ) 
                VALUES (?, ?, ?, ?,?,?,?)
            `;
            await connection.query(insertQuery, [
                teacher_id,
                cv,
                cnic,
                matriculation,
                inter_or_higher,
                agreement,
                experience_letter
            ]);

            await connection.commit();
            return res.status(201).json({
                data: {
                    message: "Teacher documents added successfully",
                    teacher_id,
                    documents: { cv, cnic, matriculation,inter_or_higher,agreement, experience_letter }
                }
            });
        }
    } catch (error) {
        // Rollback transaction on error
        if (connection) await connection.rollback();
        
        console.error("Error updating document:", error);
        return res.status(500).json({ 
            error: "Internal server error", 
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    } finally {
        if (connection) await connection.release();
    }
};


const deleteFile = (filename) => {
    const filePath = path.join(__dirname,'./../', 'public', 'uploads', filename);
    console.log("filePath",filePath);
    console.log("filepath is: ", filePath)
    // Use fs.unlink() to delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting the file:', err);
        return 0;
      }else{
        console.log("this is in else ")
        return 1;
      }
  
      // console.log('File deleted successfully');
    });
  };
