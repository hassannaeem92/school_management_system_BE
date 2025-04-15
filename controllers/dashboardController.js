const pool = require("../config/db.js");


module.exports.getAnalytics = async (req, res) => {
    try {
        
        const count_student_query = `SELECT count(*) as total_students FROM students`;
        const active_students_query = `SELECT count(*) as active_students FROM students a where a.status = 'Active';`;
        const total_teachers_query = `SELECT count(*) as total_teachers FROM teachers`;
        const active_teachers_query = `SELECT count(*) as active_teachers FROM teachers`;

        // Get a connection from the pool
        const con = await pool.getConnection();
        let data = {};
        try {
            // Execute query using parameterized input to prevent SQL injection
            const [totalStudentsResult] = await con.query(count_student_query);
            const [totalActiveStudentsResult] = await con.query(active_students_query);
            const [totalTeachersResult] = await con.query(total_teachers_query);
            const [activeTeachersResult] = await con.query(active_teachers_query);
        
            // Extract values from the first row
            data.totalStudents = totalStudentsResult[0]?.total_students || 0;
            data.totalActiveStudents = totalActiveStudentsResult[0]?.active_students || 0;
            data.totalTeachers = totalTeachersResult[0]?.total_teachers || 0;
            data.activeTeachers = activeTeachersResult[0]?.active_teachers || 0;
            
            con.release();

            return res.status(200).json({
                status: 200,
                data: data
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
