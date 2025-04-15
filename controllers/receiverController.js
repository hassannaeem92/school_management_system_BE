const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Create student receiver
module.exports.createReceiver = async (req, res) => {
    try {
        const { student_id, relation_id, name, cnic, mobile_number } = req.body;
        const sql = `INSERT INTO student_receivers (student_id, relation_id, name, cnic, mobile_number, created_at) VALUES (?, ?, ?, ?, ?, NOW())`;
        const [result] = await pool.execute(sql, [student_id, relation_id, name, cnic, mobile_number]);
        res.status(201).json({ success: true, id: result.insertId, message: "Student`s receiver successfully stored!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all student receivers
module.exports.getAllReceivers = async (req, res) => {
    try {
        const sql = "SELECT * FROM student_receivers WHERE deleted_at IS NULL";
        const [receivers] = await pool.execute(sql);
        res.json({ success: true, data: receivers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get student receiver by ID
module.exports.getReceiverById = async (req, res) => {
    try {
        const { id } = req.body;
        const sql = "SELECT * FROM student_receivers WHERE student_id = ? AND deleted_at IS NULL";
        const [receiver] = await pool.execute(sql, [id]);
        console.log(receiver)
        // if (receiver.length === 0) {
        //     return res.status(404).json({ success: false, message: "Receiver not found" });
        // }
        res.json({ success: true, data: {receiver:receiver[0]} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update student receiver
module.exports.updateReceiver = async (req, res) => {
    try {
        const {  name, cnic, mobile_number,id } = req.body;
        const sql = `
            UPDATE student_receivers 
            SET name = ?, cnic = ?, mobile_number = ?, updated_at = NOW() 
            WHERE student_id = ? AND deleted_at IS NULL
        `;
        const [result] = await pool.execute(sql, [name, cnic, mobile_number, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Receiver not found" });
        }
        res.json({ success: true, message: "Student`s receiver updated successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Soft delete student receiver
module.exports.deleteReceiver = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "UPDATE student_receivers SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL";
        const [result] = await pool.execute(sql, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Receiver not found or already deleted" });
        }
        res.json({ success: true, message: "Receiver deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};