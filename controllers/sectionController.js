const pool = require("../config/db.js");

module.exports.createSection = async (req, res) => {
    try {
        const { sectionName } = req.body;
        const con = await pool.getConnection();

        try {
            // Check if section already exists
            const [sectionExists] = await con.query("SELECT * FROM section WHERE section_name = ?", [sectionName]);

            if (sectionExists.length > 0) {
                return res.status(400).json({ status: 400, error: { msg: "Section already exists!" } });
            }

            // Insert new section
            await con.query("INSERT INTO section (section_name) VALUES (?)", [sectionName]);

            return res.status(200).json({ status: 200, success: { msg: "Section created successfully" } });

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

//dropDown api
module.exports.getAllSection = async (req, res) => {
    try {
        const con = await pool.getConnection();
        
        try {
            const [sections] = await con.query("SELECT * FROM section");
            return res.status(200).json({ status: 200, result: { records: sections } });
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


// module.exports.assignSectionToTeacher1 = async (req, res) => {
//     try {
//         const assignments = req.body;
//         const con = await dbConnection();
//         const checkExistsQuery = `SELECT * FROM cts_detail WHERE section_id = ? AND teacher_id = ? AND class_id = ?`;

//         for (const assignment of assignments) {
//             const { sectionId, teacherId, classId } = assignment;
            
//             // Check if the assignment already exists
//             con.query(checkExistsQuery, [sectionId, teacherId, classId], (err, results) => {
//                 if (err) {
//                     console.error("Error executing check query:", err);
//                     return res.status(500).json({ error: { msg: "Database query failed during check" } });
//                 }

//                 if (results.length > 0) {
//                     // If the record exists, send a conflict response
//                     return res.status(409).json({
//                         error: { msg: "Teacher is already Assign" }
//                     });
//                 } else {
//                     // Proceed with insertion if no existing record found
//                     const insertSectionQuery = `INSERT INTO cts_detail (section_id, teacher_id, class_id) VALUES (?, ?, ?)`;
//                     con.query(insertSectionQuery, [sectionId, teacherId, classId], (insertErr, result) => {
//                         if (insertErr) {
//                             console.error("Error executing insert query:", insertErr);
//                             return res.status(500).json({ error: { msg: "Failed to assign teacher to section" } });
//                         }

//                         // Send a success response
//                         return res.status(200).json({
//                             status: 200,
//                             success: { msg: "Teacher assigned to section successfully" }
//                         });
//                     });
//                 }
//             });
//         }
//     } catch (error) {
//         console.error("Server error:", error);
//         return res.status(500).json({
//             error: { msg: "Internal server error" }
//         });
//     }
// }

// module.exports.assignSectionToTeacher2 = async (req, res) => {
//     const con = await dbConnection();  // Make sure this properly opens and manages a new connection
//     try {
//         var assignments = req.body;

//         const upsertQuery = `
//             INSERT INTO cts_detail (section_id, teacher_id, class_id)
//             VALUES (?, ?, ?)
//             ON DUPLICATE KEY UPDATE
//             cts_id = VALUES(?);  // Perform a trivial update if the row already exists
//         `;

//         // Create an array of promises for each assignment
//         const promises = assignments.map(assignment => {
//             const { sectionId, teacherId, classId } = assignment;
//             return queryPromise(con, upsertQuery, [sectionId, teacherId, classId, ctsId]);
//         });

//         // Wait for all the promises to resolve
//         await Promise.all(promises);

//         // Send a success response once all teachers are assigned or updated
//         res.status(200).json({
//             success: {
//                 status: 200,
//                 msg: "Teachers assigned or updated in sections successfully"
//             }
//         });
//     } catch (error) {
//         console.error("Error while assigning or updating teachers to sections:", error);
        
//         // Only send an error response if no response has been sent yet
//         if (!res.headersSent) {
//             res.status(500).json({ error: { msg: "Failed to assign or update teachers to sections" } });
//         }
//     } finally {
//         // Ensure that the database connection is closed
//         if (con) con.end();
//     }
// };

// module.exports.assignSectionToTeacher5 = async (req, res) => {
//     const con = await dbConnection(); // Make sure this properly opens and manages a new connection
//     try {
//         var assignments = req.body;
        
//         const { teacherSectionlist, deleteList } = req.body;

//         // Handle each assignment one at a time using Promise.all to wait on all operations
//         const promises = teacherSectionlist.map(async (ctsId, sectionId, teacherId, classId) => {
//             // const { ctsId, sectionId, teacherId, classId } = assignment;

//             if (ctsId && ctsId !== null) {
//                 // Update the existing record
//                 const updateQuery = `
//                     UPDATE cts_detail
//                     SET section_id = ?, teacher_id = ?, class_id = ?
//                     WHERE cts_id = ?;
//                 `;
//                 return queryPromise(con, updateQuery, [sectionId, teacherId, classId, ctsId]);
//             } else {
//                 // Insert a new record
//                 const insertQuery = `
//                     INSERT INTO cts_detail (section_id, teacher_id, class_id)
//                     VALUES (?, ?, ?);
//                 `;
//                 return queryPromise(con, insertQuery, [sectionId, teacherId, classId]);
//             }
//         });


//         const deletePromises = deleteList.map(async (deleteId) => {
//             const deleteQuery = `
//                 DELETE FROM cts_detail
//                 WHERE cts_id = ?;
//             `;
//             return queryPromise(con, deleteQuery, [deleteId]);
//         });

//         // Wait for all the promises to resolve
//         await Promise.all([...promises, ...deletePromises]);

//         // Send a success response once all teachers are assigned or updated
//         res.status(200).json({
//             success: {
//                 status: 200,
//                 msg: "Teachers assigned or updated in sections successfully"
//             }
//         });
//     } catch (error) {
//         console.error("Error while assigning or updating teachers to sections:", error);

//         // Only send an error response if no response has been sent yet
//         if (!res.headersSent) {
//             res.status(500).json({ error: { msg: "Failed to assign or update teachers to sections" } });
//         }
//     } finally {
//         // Ensure that the database connection is closed
//         if (con) con.end();
//     }
// };

module.exports.assignSectionToTeacher = async (req, res) => {
    try {
        const { teacherSectionlist, deleteList } = req.body;
        const con = await pool.getConnection();

        try {
            // Handle assignments
            const promises = teacherSectionlist.map(async ({ ctsId, sectionId, teacherId, classId }) => {
                if (ctsId) {
                    await con.query(
                        "UPDATE cts_detail SET section_id = ?, teacher_id = ?, class_id = ? WHERE cts_id = ?",
                        [sectionId, teacherId, classId, ctsId]
                    );
                } else {
                    await con.query(
                        "INSERT INTO cts_detail (section_id, teacher_id, class_id) VALUES (?, ?, ?)",
                        [sectionId, teacherId, classId]
                    );
                }
            });

            // Handle deletions
            const deletePromises = deleteList.map(async ([deleteId]) => {
                await con.query("DELETE FROM cts_detail WHERE cts_id = ?", [deleteId]);
            });

            await Promise.all([...promises, ...deletePromises]);

            return res.status(200).json({ status: 200, success: { msg: "Teachers assigned or updated in sections successfully" } });
        } catch (error) {
            console.error("Error while assigning or updating teachers to sections:", error);
            return res.status(500).json({ error: { msg: "Failed to assign or update teachers to sections" } });
        } finally {
            con.release();
        }
    } catch (error) {
        console.error("Database connection error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};








function queryPromise(con, query, values = []) {
    return new Promise((resolve, reject) => {
        con.query(query, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}


module.exports.assignStudentToSection = async (req, res) => {
    const con = await dbConnection(); // Ensure this properly opens a new connection
    try {
        const {classId, sectionId, studentIds } = req.body;

        const insertQuery = `INSERT INTO section_student (section_id, student_id, class_id) VALUES (?, ?, ?)`;

        // Create an array of promises for each studentId using the connection
        const promises = studentIds.map(studentId => 
            queryPromise(con, insertQuery, [sectionId, studentId, classId])
        );

        // Wait for all the promises to resolve
        await Promise.all(promises);

        // Send a success response once all students are assigned
        res.status(200).json({ status: 200, success: { msg: "Students assigned to section successfully" } });
    } catch (error) {
        console.error("Error while assigning students to section:", error);

        // Only send an error response if no response has been sent yet
        if (!res.headersSent) {
            res.status(500).json({status: 500, error: { msg: "Failed to assign students to section" } });
        }
    } finally {
        // Ensure that the database connection is closed
        if (con) con.end();
    }
};


module.exports.getUnassignedStudents = async (req, res) => {
    try {
        const {
            searchkeyWord,
            pageNumber,
            pageSize
        } = req.body


        // const getAllClassQuery = `SELECT * FROM classes`;
        const offset = (pageNumber - 1) * pageSize; // Calculate the offset
        const con = await dbConnection();

        // let baseQuery = `SELECT * FROM classes WHERE class_name LIKE "%${searchkeyWord}%" ORDER BY class_name LIMIT \`${pageSize}\` OFFSET \`${offset}\``;
        let baseQuery = `SELECT * FROM students WHERE id NOT IN (SELECT student_id FROM section_student) AND 
       ( first_name LIKE ? OR 
        last_name LIKE ? OR 
        date_of_birth LIKE ? OR 
        place_of_birth LIKE ? OR 
        registration_date LIKE ? OR 
        registration_number LIKE ? OR 
        phone_number LIKE ? OR 
        email LIKE ? OR 
        status LIKE ?  )         
        ORDER BY id DESC LIMIT ? OFFSET ?`;

        let countQuery = ` SELECT COUNT(*) AS total FROM students WHERE id NOT IN (SELECT student_id FROM section_student) AND first_name LIKE "%${searchkeyWord}%"`;
        const searchLike = `%${searchkeyWord}%`

        try {


            const totalResult = await new Promise((resolve, reject) => {
               con.query(countQuery, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });


            con.query(baseQuery, [searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, parseInt(pageSize), offset], (err, results) => {
                if (err) {
                    console.error("Error executing query:", err);
                    return res.status(500).json({ error: { msg: "Internal server error" } });
                }

                return res.status(200).json({
                    status: 200,
                    total: totalResult,
                    pageSize,
                    pageNumber,
                    totalPages: Math.ceil(totalResult / pageSize),
                    students: results
                });
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

module.exports.getAssignedStudents1 = async (req, res) => {
    try {
        const {
            sectionId,
            searchkeyWord,
            classId,
            pageNumber,
            pageSize
        } = req.body


        // const getAllClassQuery = `SELECT * FROM classes`;
         const offset = (pageNumber - 1) * pageSize; // Calculate the offset
        const con = await dbConnection();

        // let baseQuery = `SELECT * FROM classes WHERE class_name LIKE "%${searchkeyWord}%" ORDER BY class_name LIMIT \`${pageSize}\` OFFSET \`${offset}\``;
        let baseQuery = `SELECT * FROM students
        WHERE id IN (
            SELECT student_id FROM section_student WHERE section_id = ? AND class_id = ?
        )
        AND (
            first_name LIKE ? OR 
            last_name LIKE ? OR 
            date_of_birth LIKE ? OR 
            place_of_birth LIKE ? OR 
            registration_date LIKE ? OR 
            registration_number LIKE ? OR 
            phone_number LIKE ? OR 
            email LIKE ? OR 
            status LIKE ?
        )
        ORDER BY id DESC LIMIT ? OFFSET ?
        `;

        let countQuery = ` SELECT COUNT(*) AS total FROM students WHERE id NOT IN (SELECT student_id FROM section_student) AND first_name LIKE "%${searchkeyWord}%"`;
        const searchLike = `%${searchkeyWord}%`

        try {

            const totalResult = await new Promise((resolve, reject) => {
               con.query(countQuery, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            console.log(totalResult);

            con.query(baseQuery, [sectionId, classId, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, pageSize, offset], (err, results) => {
                if (err) {
                    console.error("Error executing query:", err);
                    return res.status(500).json({ error: { msg: "Internal server error" } });
                }

                return res.status(200).json({
                    status: 200,
                    total: results.length,
                    students: results
                });
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

module.exports.getAssignedStudents = async (req, res) => {
    try {
        const { sectionId, searchkeyWord, classId, pageNumber, pageSize } = req.body;
        const con = await dbConnection();

        const offset = (pageNumber - 1) * pageSize; // Calculate the offset

        const baseQuery = `
            SELECT * FROM students
            WHERE id IN (
                SELECT student_id FROM section_student WHERE section_id = ? AND class_id = ?
            )
            AND (
                first_name LIKE ? OR 
                last_name LIKE ? OR 
                date_of_birth LIKE ? OR 
                place_of_birth LIKE ? OR 
                registration_date LIKE ? OR 
                registration_number LIKE ? OR 
                phone_number LIKE ? OR 
                email LIKE ? OR 
                status LIKE ?
            )
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        `;

        const countQuery = `
            SELECT COUNT(*) AS total FROM students
            WHERE id IN (
                SELECT student_id FROM section_student WHERE section_id = ? AND class_id = ?
            )
            AND (
                first_name LIKE ? OR 
                last_name LIKE ? OR 
                date_of_birth LIKE ? OR 
                place_of_birth LIKE ? OR 
                registration_date LIKE ? OR 
                registration_number LIKE ? OR 
                phone_number LIKE ? OR 
                email LIKE ? OR 
                status LIKE ?
            )
        `;

        const searchLike = `%${searchkeyWord}%`;

        try {
            // const totalResult = await new Promise((resolve, reject) => {
            //     con.query(countQuery, [sectionId, classId, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike], (err, results) => {
            //         if (err) reject(err);
            //         else resolve(results[0].total);
            //     });
            // });

            const totalResult = await new Promise((resolve, reject) => {
                con.query(countQuery, [sectionId, classId, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // const results = await new Promise((resolve, reject) => {
            //     con.query(baseQuery, [sectionId, classId, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, parseInt(pageSize), offset], (err, results) => {
            //         if (err) reject(err);
            //         else resolve(results);
            //     });
            // });

            const results = await new Promise((resolve, reject) => {
                con.query(baseQuery, [sectionId, classId, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, searchLike, parseInt(pageSize), offset], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            return res.status(200).json({
                status: 200,
                total: totalResult,
                pageSize,
                pageNumber,
                totalPages: Math.ceil(totalResult / pageSize),
                students: results
            });
        } catch (error) {
            console.error("Error executing query:", error);
            return res.status(500).json({ error: { msg: "Internal server error" } });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};


module.exports.deleteStudentsFromSection = async (req, res) => {
    try {
        const { sectionId, studentIds, classId } = req.body;
        const con = await dbConnection();

        // Validate sectionId and studentIds
        const validateQuery = `
            SELECT * FROM section WHERE section_id = ?;
        `;
        const section = await con.query(validateQuery, [sectionId]);
        if (section.length === 0) {
            return res.status(404).json({
                status: 404,
                error: { msg: "Section not found" }
            });
        }


        // Query to delete specific students from section_student table
        const deleteQuery = `
            DELETE FROM section_student 
            WHERE section_id = ? AND class_id = ? AND student_id IN (?)
        `;

        // Execute the delete query
        con.query(deleteQuery, [sectionId, classId, studentIds], (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({ error: { msg: "Internal server error" } });
            }

            // Check if any rows were affected by the delete operation
            if (result.affectedRows > 0) {
                return res.status(200).json({
                    status: 200,
                    msg: "Students deleted from section successfully"
                });
            } else {
                return res.status(404).json({
                    status: 404,
                    error: { msg: "No matching records found to delete" }
                });
            }
        });
    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};

module.exports.getTeacherSectionData = async (req, res) => {
    try {
        const {
            classId
        } = req.body


        // const getAllClassQuery = `SELECT * FROM classes`;
        const con = await dbConnection();

        // let baseQuery = `SELECT * FROM classes WHERE class_name LIKE "%${searchkeyWord}%" ORDER BY class_name LIMIT \`${pageSize}\` OFFSET \`${offset}\``;
        // let baseQuery = `SELECT * FROM cts_detail WHERE class_id = \"${classId}\"`;
        let baseQuery = `
        
        SELECT 
                cts_detail.*, 
                section.section_name, 
                teachers.first_name, 
                teachers.last_name 
            FROM 
                cts_detail 
            INNER JOIN 
                section ON cts_detail.section_id = section.section_id 
            INNER JOIN 
                teachers ON cts_detail.teacher_id = teachers.id 
            WHERE 
                cts_detail.class_id = \"${classId}\"
        
        `;
        

        try {


            con.query(baseQuery, (err, results) => {
                if (err) {
                    console.error("Error executing query:", err);
                    return res.status(500).json({ error: { msg: "Internal server error" } });
                }

                return res.status(200).json({
                    status: 200,
                    teacherSectionData: results
                });
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




// module.exports getUnassignedStudents = async (req, res) => {
//     try {
//         // Query to select students who are not in the section_student table
//         const query = `
//             SELECT * FROM students
//             WHERE student_id NOT IN (
//                 SELECT student_id FROM section_student
//             )
//         `;
        
//         // Execute the query
//         const unassignedStudents = await queryDatabase(query);

//         // Return the result
//         return res.status(200).json( status: 200, success: { students: unassignedStudents });

//     } catch (error) {
//         console.error("Internal server error:", error);
//         return res.status(500).json({ error: { msg: "Internal server error" } });
//     }
// };



// module.exports assignSectionToTeacher = async (req, res) => {
//     try {
      
//         var assignments = req.body

//         const insertSectionQuery = `INSERT INTO cts_detail (section_id, teacher_id, class_id) VALUES (?, ?, ?)`;
//         const con = await dbConnection();

//         try {
                 
//                 for (const assignment of assignments) {
//                     const { sectionId, teacherId, classId } = assignment;
//                     con.query(insertSectionQuery, [sectionId, teacherId, classId], (err, result) => {
//                         if (err) {
//                             console.error("Error executing query:", err);
//                             return res.status(500).json({ error: { msg: "Failed to assign teacher to section" } });
//                         }
//                     });
//                 } 
//                     return res.status(200).json({
//                         status: 200,
//                         success: {
//                             msg: "Teacher Assign to Section successfully"
//                         }
//                     });
                
        
            
//             // con.query(sessionNameExistsQuery, (err, result) => {
//             //     if (err) {
//             //         console.error("Error executing query:", err);
//             //         return;
//             //     }
//             //     if (result.length > 0) {
//             //         return res
//             //             .status(400)
//             //             .json({
//             //                 error: {
//             //                     msg: "Session already exist!"
//             //                 }
//             //             });
//             //     } else {

//             //         con.query(insertSessionQuery, [sectionName], (err, result) => {
//             //             if (err) {
//             //                 console.log(err);
//             //             } else {
//             //                 return res.status(200).json({
//             //                     status: 200,
//             //                     success: {
//             //                         msg: "Section created successfully"
//             //                     }
//             //                 });
//             //             }
//             //         });
//             //     }
//             // });

//             // If the class doesn't exist, you can proceed with further operations
//         } catch (error) {
//             return res.status(500).json({
//                 error: {
//                     msg: "Internal server error"
//                 }
//             });
//         }

//     } catch {

//     }
// }

// return Assigne Teacher or Section

// module.exports assignStudentToSection = async (req, res) => {
//     try {
//         // Receive array of student IDs and section ID from the request body
//         const { studentIds, sectionId } = req.body;
//         const con = await dbConnection();

//          const insertQuery = `INSERT INTO section_student (section_id, student_id) VALUES (?, ?)`;
       

//         for (const obj of studentIds) {
//             const object = { studentId: obj, sectionId: sectionId };
//             con.query(insertQuery, [object.sectionId, object.studentId], (err, result) => {
//                 if (err) {
//                     console.error("Error executing query:", err);
//                     return res.status(500).json({ error: { msg: "Failed to assign Student to section" } });
//                 }
//             });
//         }
//         return res.status(200).json({ success: { status: 200, msg: "Students assigned to section successfully" } });


//     } catch (error) {
//         console.error("Internal server error:", error);
//         return res.status(500).json({ status: 500, error: { msg: "Internal server error" } });
//     }
// };
