const pool = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config(); // Ensure environment variables are loaded

module.exports.loginUser = async (req, res) => {
    let connection;
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                error: { msg: "Invalid email or password" }
            });
        }

        connection = await pool.getConnection(); // Get connection from the pool

        const userQuery = `SELECT * FROM users WHERE email = ?`;
        const [users] = await connection.query(userQuery, [email]);

        if (users.length === 0) {
            return res.status(401).json({ status: 401, message: "Invalid credentials" });
        }

        const user = users[0];

        let nodeHash = user.password.replace("$2y$", "$2b$"); // Adjust bcrypt hash format

        const isMatch = await bcrypt.compare(password, nodeHash);
        if (!isMatch) {
            return res.status(401).json({ status: 401, message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30d" }
        );

        // Remove sensitive fields before sending response
        const { password: _, email_verified_at, remember_token, ...userData } = user;

        return res.status(200).json({
            status: 200,
            data: { status:200,  user: userData, token, message: "Admin successfully logged in!" }
        });

    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({
            status: 500,
            error: { msg: "Internal server error" }
        });
    } finally {
        if (connection) connection.release(); // Release the connection back to the pool
    }
};
