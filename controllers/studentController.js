const pool = require("../config/db.js");
const fs = require('fs');
const path = require('path');

module.exports.getAllStudent = async (req, res) => {
    try {
        const { first_name, page_number, page_size } = req.body;
        const offset = (page_number - 1) * page_size;

        const get_pagination_students_query = `
            SELECT * FROM students where first_name	like '%${first_name}%' LIMIT ? OFFSET ?
        `;
        console.log("get_pagination_students_query",get_pagination_students_query);
        const get_count_student_query = `
            SELECT COUNT(*) AS count FROM students
        `;

        // Get a connection from the pool
        const con = await pool.getConnection();
        
        try {
            // Execute the queries
            const [students] = await con.query(get_pagination_students_query, [page_size, offset]);
            const [countResult] = await con.query(get_count_student_query);

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
                student: {
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


module.exports.createStudentFee = async (req, res) => {
    let connection;
    try {
        const { feeAmount, studentId } = req.body;

        connection = await pool.getConnection(); // Get a connection from the pool

        // Check if the student fee entry already exists
        const feeExistsQuery = `SELECT * FROM student_fee WHERE student_id = ?`;
        const [existingFee] = await connection.query(feeExistsQuery, [studentId]);

        if (existingFee.length > 0) {
            // If fee already exists, update it
            const updateFeeQuery = `
                UPDATE student_fee 
                SET fee_amount = ?
                WHERE student_id = ?
            `;
            await connection.query(updateFeeQuery, [feeAmount, studentId]);

            return res.status(200).json({
                status: 200,
                success: { msg: "Fee updated successfully" }
            });
        } else {
            // Insert a new student fee entry
            const insertFeeQuery = `INSERT INTO student_fee (student_id, fee_amount) VALUES (?, ?)`;
            await connection.query(insertFeeQuery, [studentId, feeAmount]);

            return res.status(200).json({
                status: 200,
                success: { msg: "Fee created successfully" }
            });
        }

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

module.exports.getAmountById = async (req, res) => {
    let connection;
    try {
        const { studentId } = req.body;

        if (!studentId) {
            return res.status(400).json({ status: 400, error: { msg: "Student ID is required" } });
        }

        connection = await pool.getConnection(); // Get a connection from the pool

        const query = `SELECT * FROM student_fee WHERE student_id = ?`;
        const [results] = await connection.query(query, [studentId]);

        return res.status(200).json({
            status: 200,
            amountData: results
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



module.exports.getAllStudentDropdown = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        const query = `
            SELECT s.first_name, s.last_name, s.id, TRIM(s.registration_number) AS registration_number
            FROM students s
            JOIN student_fee sf ON s.id = sf.student_id
        `;
        const [result] = await connection.query(query);

        return res.status(200).json({
            status: 200,
            result: {
                records: result
            }
        });

    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({
            status: 500,
            error: { msg: "Internal server error" }
        });
    } finally {
        if (connection) connection.release(); // Always release the connection
    }
};


module.exports.getStudent = async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.status(400).json({ error: { msg: "Student ID is required" } });
        }

        const get_student_by_id = `SELECT * FROM students WHERE id = ?`;

        // Get a connection from the pool
        const con = await pool.getConnection();

        try {
            // Execute query using parameterized input to prevent SQL injection
            const [results] = await con.query(get_student_by_id, [id]);

            // Release the connection back to the pool
            con.release();

            if (results.length === 0) {
                return res.status(404).json({ error: { msg: "Student not found" } });
            }

            return res.status(200).json({
                status: 200,
                data: {
                    student: results[0]
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


module.exports.addStudent = async (req, res) => {
    let connection;
    try {
        const {
            blood_group_id,
            date_of_birth,
            email,
            first_name,
            gender_id,
            last_name,
            phone_number,
            place_of_birth,
            registration_date,
            religion_id,
            status,
            institute_reg_num // New field added
        } = req.body;

        // Get a connection from the pool
        connection = await pool.getConnection();

        // Check if email exists
        if (email) {
            const [existingStudent] = await connection.query(
                "SELECT * FROM students WHERE email = ?", [email]
            );

            if (existingStudent.length > 0) {
                connection.release();
                return res.status(409).json({ message: "Email is already registered!", code: 409 });
            }
        }

        // Get registration setup details
        const [setupResult] = await connection.query("SELECT * FROM registration_setup LIMIT 1");

        if (setupResult.length === 0) {
            connection.release();
            return res.status(500).json({ error: { message: "Registration setup not found" } });
        }

        let slogan = setupResult[0]?.Slogan;
        let reg_id = setupResult[0]?.reg_id;
        let registration_number = `${slogan}-${reg_id}`;

        // Insert new student
        const insertStudentQuery = `
            INSERT INTO students (
                blood_group_id, date_of_birth, email, first_name, gender_id, 
                last_name, phone_number, place_of_birth, registration_number, 
                registration_date, religion_id, status, institute_reg_num
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            blood_group_id,
            date_of_birth,
            email || null,
            first_name,
            gender_id,
            last_name,
            phone_number,
            place_of_birth,
            registration_number,
            registration_date,
            religion_id,
            status === "true" ? "Active" : "Deactivate",
            institute_reg_num // New field added
        ];

        await connection.query(insertStudentQuery, values);

        // Update registration setup value
        await connection.query(
            "UPDATE registration_setup SET reg_id = ? WHERE id = 1",
            [reg_id + 1]
        );

        connection.release();
        return res.status(201).json({
            message: "Student successfully registered!",
            data: { student: req.body }
        });

    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ error: { message: "Internal server error" } });
    } finally {
        if (connection) connection.release(); // Ensure connection is always released
    }
};


module.exports.updateStudent = async (req, res) => {
    let connection;
    try {
        const {
            id,
            blood_group_id,
            date_of_birth,
            email,
            first_name,
            gender_id,
            last_name,
            phone_number,
            place_of_birth,
            registration_date,
            religion_id,
            status,
            institute_reg_num // New field added
        } = req.body;

        if (!id) {
            return res.status(400).json({ error: { msg: "Student ID is required" } });
        }

        // Get a connection from the pool
        connection = await pool.getConnection();

        // Construct the update query
        const updateStudentQuery = `
            UPDATE students SET 
                blood_group_id = ?, 
                date_of_birth = ?, 
                email = ?, 
                first_name = ?, 
                gender_id = ?, 
                last_name = ?, 
                phone_number = ?, 
                place_of_birth = ?, 
                registration_date = ?, 
                religion_id = ?, 
                status = ?, 
                institute_reg_num = ? 
            WHERE id = ?
        `;

        const values = [
            blood_group_id,
            date_of_birth,
            email,
            first_name,
            gender_id,
            last_name,
            phone_number,
            place_of_birth,
            registration_date,
            religion_id,
            status === "true" ? "Active" : "Deactivate",
            institute_reg_num, // New field added
            id
        ];

        const [result] = await connection.query(updateStudentQuery, values);
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: { msg: "Student not found or no changes made" } });
        }

        return res.status(200).json({
            message: "Student updated successfully!",
            data: { id, ...req.body }
        });

    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    } finally {
        if (connection) connection.release(); // Ensure connection is always released
    }
};


module.exports.updateProfilePhoto = async (req, res) => {
    let connection;
    try {
        const { student_id } = req.body;

        if (!student_id) {
            return res.status(400).json({ error: "Student ID is required" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("Student ID:", student_id);
        const profilePhoto = req.file.filename; // Get uploaded file name
        console.log("Filename:", profilePhoto);

        // Get a connection from the pool
        connection = await pool.getConnection();

        const query = `UPDATE students SET profile_photo = ? WHERE id = ?`;
        const [result] = await connection.query(query, [profilePhoto, student_id]);

        // Release connection back to the pool
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        console.log("Database update successful:", result);

        return res.status(200).json({
            data: {
                message: "Student's profile photo successfully updated!",
                student_id,
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
// documents

// module.exports.updateDocument = async (req, res) => {
//     let connection;
//     try {
//         const { student_id } = req.body;

//         if (!student_id) {
//             return res.status(400).json({ error: "Student ID is required" });
//         }

//         if (!req.files) {
//             return res.status(400).json({ error: "No file uploaded" });
//         }
//         const b_from = (req.files?.b_form && req.files?.b_form.length >  0 ) ? req.files.b_form[0]?.filename : ''; // Get uploaded file name
       
//         const character_certificate = (req.files?.character_certificate && req.files?.character_certificate.length >  0) ? req.files.character_certificate[0].filename : '';  // Get uploaded file name
    
//         const previous_school_result_card = (req.files?.previous_school_result_card && req.files?.previous_school_result_card.length >  0) ? req.files.previous_school_result_card[0].filename : '' ; // Get uploaded file name
//         // const character_certificate = req.files.character_certificate[0].filename; // Get uploaded file name

//         // console.log("Filename:", profilePhoto);

//         // Get a connection from the pool
//         connection = await pool.getConnection();

//         // Check if student exists
//         const checkQuery = `SELECT * FROM student_documents WHERE student_id = ?`;
//         const [existingStudent] = await connection.query(checkQuery, [student_id]);

//         if (existingStudent.length > 0) {
//             // Update if exists
//             const updateQuery = `UPDATE student_documents SET b_form = ?, previous_school_result_card = ? , character_certificate = ? WHERE student_id = ?`;
//             await connection.query(updateQuery, [b_from,previous_school_result_card,character_certificate, student_id]);

//             console.log("Database update successful");

//             return res.status(200).json({
//                 data: {
//                     message: "Student's documents successfully updated!",
//                     student_id,
//                 }
//             });
//         } else {
//             // Insert new record if not exists
//             const insertQuery = `INSERT INTO student_documents (student_id, b_form) VALUES (?, ?)`;
//             await connection.query(insertQuery, [student_id, b_from]);

//             console.log("Database insert successful");

//             return res.status(201).json({
//                 data: {
//                     message: "Student's profile photo successfully added!",
//                     student_id,
//                     profile_photo: b_from
//                 }
//             });
//         }
//     } catch (error) {
//         console.error("Unexpected error:", error);
//         return res.status(500).json({ error: "Internal server error", details: error.message });
//     } finally {
//         if (connection) connection.release(); // Ensure the connection is always released
//     }
// };

module.exports.getStudentDocument = async (req, res) => {
    try {
        const { student_id } = req.body;
        
        if (!student_id) {
            return res.status(200).json({ error: { msg: "Student ID is required" } });
        }

        const get_document_by_id = `SELECT * FROM student_documents WHERE student_id = ?`;

        // Get a connection from the pool
        const con = await pool.getConnection();

        try {
            // Execute query using parameterized input to prevent SQL injection
            const [results] = await con.query(get_document_by_id, [student_id]);

            // Release the connection back to the pool
            con.release();

            if (results.length === 0) {
                return res.status(200).json({ error: { msg: "student document not found" } });
            }

            return res.status(200).json({
                status: 200,
                data: {
                    student: {
                        document: results[0]
                    } 
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
        const { student_id } = req.body;
        if (!student_id) {
            return res.status(200).json({ error: "Student ID is required" });
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(200).json({ error: "At least one file is required" });
        }
        
        // Extract filenames with null checks
        const b_form = req.files?.b_form?.[0]?.filename || null;
        const character_certificate = req.files?.character_certificate?.[0]?.filename || null;
        const previous_school_result_card = req.files?.previous_school_result_card?.[0]?.filename || null;

        // Ensure at least one document is provided
        if (!b_form && !character_certificate && !previous_school_result_card) {
            return res.status(200).json({ message: "No valid documents provided" });
        }

        // Get database connection
        connection = await pool.getConnection();

        // Start transaction
        await connection.beginTransaction();

        // Check existing record
        const checkQuery = "SELECT * FROM student_documents WHERE student_id = ?";
        const [existingStudent] = await connection.query(checkQuery, [student_id]);

        if (existingStudent.length > 0) {


                if(b_form && existingStudent[0]?.b_form){
                    console.log("in if...", existingStudent[0].b_form);
                    await deleteFile(existingStudent[0]?.b_form)
                }   
                
                if(previous_school_result_card && existingStudent[0]?.previous_school_result_card){
                    console.log("in if...", existingStudent[0].previous_school_result_card);
                    await deleteFile(existingStudent[0]?.previous_school_result_card)
                }   
                
                if(character_certificate && existingStudent[0]?.character_certificate){
                    console.log("in if...", existingStudent[0].character_certificate);
                    await deleteFile(existingStudent[0]?.character_certificate)
                }   
            

            // Update existing record
            const updateQuery = `
                UPDATE student_documents 
                SET 
                    b_form = COALESCE(?, b_form),
                    character_certificate = COALESCE(?, character_certificate),
                    previous_school_result_card = COALESCE(?, previous_school_result_card)
                WHERE student_id = ?
            `;
            await connection.query(updateQuery, [
                b_form,
                character_certificate,
                previous_school_result_card,
                student_id
            ]);

            await connection.commit();
            return res.status(200).json({
                data: {
                    message: "Student documents updated successfully",
                    student_id,
                    updated_documents: { b_form, character_certificate, previous_school_result_card }
                }
            });
        } else {
            // Insert new record
            const insertQuery = `
                INSERT INTO student_documents 
                (student_id, b_form, character_certificate, previous_school_result_card) 
                VALUES (?, ?, ?, ?)
            `;
            await connection.query(insertQuery, [
                student_id,
                b_form,
                character_certificate,
                previous_school_result_card
            ]);

            await connection.commit();
            return res.status(201).json({
                data: {
                    message: "Student documents added successfully",
                    student_id,
                    documents: { b_form, character_certificate, previous_school_result_card }
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

