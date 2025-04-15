const pool = require("../config/db.js");

// Session APIs
module.exports.createSession = async (req, res) => {
    try {
        const { sessionId, sessionName, startDate, endDate } = req.body;
        const con = await pool.getConnection();
        
        try {
            await con.query("INSERT INTO sessions (session_id, session_name, start_date, end_date) VALUES (?, ?, ?, ?)",
                [sessionId, sessionName, startDate, endDate]);
            return res.status(200).json({ status: 200, success: { msg: "Session created successfully" } });
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

module.exports.getAllSessions = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const con = await pool.getConnection();
        const [sessions] = await con.query("SELECT * FROM sessions WHERE session_id = ?", [sessionId]);
        con.release();
        return res.status(200).json({ status: 200, result: { records: sessions } });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};

module.exports.getSessionById = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const con = await pool.getConnection();
        const session = await con.query("SELECT * FROM sessions WHERE session_id = ?", [sessionId]);
        con.release();
        return res.status(200).json({ status: 200, result: { records: session } });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};

module.exports.deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const con = await pool.getConnection();
        await con.query("DELETE FROM sessions WHERE session_id = ?", [sessionId]);
        con.release();
        return res.status(200).json({ status: 200, success: { msg: "Session deleted successfully" } });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};

module.exports.updateSession = async (req, res) => {
    try {
        const { sessionId, sessionName, startDate, endDate } = req.body;
        const con = await pool.getConnection();
        await con.query("UPDATE sessions SET session_name = ?, start_date = ?, end_date = ? WHERE session_id = ?",
            [sessionName, startDate, endDate, sessionId]);
        con.release();
        return res.status(200).json({ status: 200, success: { msg: "Session updated successfully" } });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};