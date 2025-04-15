const dbConnection = require("../config/db.js");





module.exports.createFeeInstallments = async (req, res) => {
    try {
        const {
            id, // This is the id of the fee_transaction to update
            fee_id,
            month,
            paid_amount,
            paid_status,
            payment_method,
            total_amount
        } = req.body;

        // Validate input data
         if (!fee_id || !month || isNaN(parseFloat(paid_amount)) || typeof paid_status !== 'boolean') {
            return res.status(400).json({
                status: 400,
                error: {
                    msg: "Invalid input data"
                }
            });
        }

        const con = await dbConnection();

        // Check if there are pending transactions for the same fee_id when creating a new record
        if (!id) {
            try {
                const getExistingTransactionsQuery = `
                    SELECT COUNT(*) AS pending_transactions
                    FROM fee_transaction
                    WHERE fee_id = ? AND paid_status = 0
                `;

                const results = await con.query(getExistingTransactionsQuery, [fee_id]);
                const pendingTransactions = results[0]?.pending_transactions || 0;

                if (pendingTransactions > 0) {
                    return res.status(400).json({
                        status: 400,
                        error: {
                            msg: "Transaction already in progress for this fee_id"
                        }
                    });
                }
            } catch (error) {
                console.error("Error checking existing transactions:", error);
                return res.status(500).json({
                    error: {
                        msg: "Internal server error"
                    }
                });
            }
        }

        if (id) {
            // Update existing fee transaction
            try {
                const updateInstallmentQuery = `
                    UPDATE fee_transaction
                    SET fee_id = ?, month = ?, paid_amount = ?, paid_status = ?, payment_method = ?, total_amount = ?
                    WHERE transaction_id = ?
                `;

                await con.query(updateInstallmentQuery, [fee_id, month, paid_amount, paid_status, payment_method, total_amount, id]);

                return res.status(200).json({
                    status: 201,
                    success: {
                        msg: "Installment updated successfully"
                    }
                });
            } catch (error) {
                console.error("Error updating installment:", error);
                return res.status(500).json({
                    error: {
                        msg: "Internal server error"
                    }
                });
            }
        } else {
            // Insert new fee transaction
            try {
                const insertInstallmentQuery = `
                    INSERT INTO fee_transaction (fee_id, month, paid_amount, paid_status, payment_method, total_amount)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

                await con.query(insertInstallmentQuery, [fee_id, month, paid_amount, paid_status, payment_method, total_amount]);

                return res.status(201).json({
                    status: 201,
                    success: {
                        msg: "Installment created successfully"
                    }
                });
            } catch (error) {
                console.error("Error inserting installment:", error);
                return res.status(500).json({
                    error: {
                        msg: "Internal server error"
                    }
                });
            }
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: {
                msg: "Internal server error"
            }
        });
    }
};


module.exports.updateFeeInstallments = async (req, res) => {
    try {
        const {
            installment_id,
            fee_id,
            from_date,
            to_date,
            installment_list
        } = req.body;

        if (!installment_id || !fee_id || !from_date || !to_date || !installment_list || !Array.isArray(installment_list)) {
            return res.status(400).json({
                status: 400,
                error: {
                    msg: "Invalid input data"
                }
            });
        }

        const con = await dbConnection();

        try {
            for (const installment of installment_list) {
                const {
                    installment_num,
                    amount,
                    paid_status
                } = installment;

                if (!installment_num || !amount || typeof paid_status !== 'boolean') {
                    return res.status(400).json({
                        status: 400,
                        error: {
                            msg: "Invalid installment data"
                        }
                    });
                }

                const updateInstallmentQuery = `
                    UPDATE fee_installment
                    SET fee_id = ?, from_date = ?, to_date = ?, installment_num = ?, installment_amount = ?, paid_status = ?
                    WHERE installment_id = ?
                `;

                con.query(updateInstallmentQuery, [fee_id, from_date, to_date, installment_num, amount, paid_status, installment_id], (err, result) => {
                    if (err) {
                        console.error("Error executing query:", err);
                        return res.status(500).json({
                            error: {
                                msg: "Internal server error"
                            }
                        });
                    }
                });
            }

            return res.status(200).json({
                status: 200,
                success: {
                    msg: "Installments updated successfully"
                }
            });

        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({
                error: {
                    msg: "Internal server error"
                }
            });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: {
                msg: "Internal server error"
            }
        });
    }
};





module.exports.getById = async (req, res) => {
    try {
        const {
            transaction_id
        } = req.body;

        if (!transaction_id) {
            return res.status(400).json({
                status: 400,
                error: {
                    msg: "Invalid transaction_id"
                }
            });
        }

        const con = await dbConnection();

        const query = `
        SELECT 
            ft.*,
            sf.student_id,
            CONCAT(s.first_name, ' ', s.last_name) AS student_name,
            ss.class_id,
            c.class_name,
            sec.section_id,
            sec.section_name
        FROM 
            fee_transaction ft
            JOIN student_fee sf ON ft.fee_id = sf.fee_id
            JOIN students s ON sf.student_id = s.id
            JOIN section_student ss ON s.id = ss.student_id
            JOIN classes c ON ss.class_id = c.class_id
            JOIN section sec ON ss.section_id = sec.section_id
        WHERE 
            ft.transaction_id = ?
    `;

        con.query(query, [transaction_id], (err, results) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({
                    error: {
                        msg: "Internal server error"
                    }
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    status: 404,
                    error: {
                        msg: "Transaction not found"
                    }
                });
            }

            return res.status(200).json({
                status: 200,
                data: results[0]
            });
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: {
                msg: "Internal server error"
            }
        });
    }
};


module.exports.getStudentFeeDetail = async (req, res) => {
    try {
        const {
            studentId
        } = req.body;

        const con = await dbConnection();

        // Updated query with joins
        let baseQuery = `
            SELECT 
                sf.*, 
                ss.class_id, 
                ss.section_id, 
                c.class_name, 
                s.section_name 
            FROM 
                student_fee sf
            JOIN 
                section_student ss ON sf.student_id = ss.student_id
            JOIN 
                classes c ON ss.class_id = c.class_id
            JOIN 
                section s ON ss.section_id = s.section_id
            WHERE 
                sf.student_id = ?
        `;

        con.query(baseQuery, [studentId], (err, results) => {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).json({
                    error: {
                        msg: "Internal server error"
                    }
                });
            }

            return res.status(200).json({
                status: 200,
                details: results
            });
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: {
                msg: "Internal server error"
            }
        });
    }
};


module.exports.getPendingAmount = async (req, res) => {
    try {
        const { feeId, date } = req.body;
        console.log(`Received feeId: ${feeId}, date: ${date}`);

        const con = await dbConnection();

        // Extract year and month from the date
        const [year, month] = date.split('-');
        console.log(`Extracted year: ${year}, month: ${month}`);

        // Query to get the sum of paid amounts and the total amount for a specific fee_id and month
        let pendingAmountQuery = `
            SELECT 
                total_amount - COALESCE(SUM(paid_amount), 0) AS pending_amount 
            FROM 
                fee_transaction 
            WHERE 
                fee_id = ? AND YEAR(month) = ? AND MONTH(month) = ? AND paid_status = 1
            GROUP BY 
                total_amount
        `;

        con.query(pendingAmountQuery, [feeId, year, month], (err, pendingResults) => {
            if (err) {
                console.error("Error executing pending amount query:", err);
                return res.status(500).json({
                    error: {
                        msg: "Internal server error"
                    }
                });
            }

            console.log(`Pending results: ${JSON.stringify(pendingResults)}`);

            if (pendingResults.length > 0) {
                let pendingAmount = pendingResults[0].pending_amount;
                if (pendingAmount < 0) pendingAmount = 0; // Ensure no negative pending amount

                return res.status(200).json({
                    status: 200,
                    pendingAmount: pendingAmount
                });
            } else {
                // No transaction found, get the total amount for the month
                let totalAmountQuery = `
                    SELECT fee_amount 
                    FROM student_fee 
                    WHERE fee_id = ?
                `;

                con.query(totalAmountQuery, [feeId], (err, totalAmountResults) => {
                    if (err) {
                        console.error("Error executing total amount query:", err);
                        return res.status(500).json({
                            error: {
                                msg: "Internal server error"
                            }
                        });
                    }

                    console.log(`Total amount results: ${JSON.stringify(totalAmountResults)}`);

                    if (totalAmountResults.length > 0) {
                        return res.status(200).json({
                            status: 200,
                            pendingAmount: totalAmountResults[0].fee_amount
                        });
                    } else {
                        return res.status(404).json({
                            error: {
                                msg: "Fee ID not found"
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: {
                msg: "Internal server error"
            }
        });
    }
};

module.exports.getStudentsWithFees = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.body.page_number) || 1;
        const limit = parseInt(req.body.page_size) || 10;
        const offset = (page - 1) * limit;

        // Search keyword parameter
        const searchKeyword = req.body.searchKeyword ? `%${req.body.searchKeyword}%` : '%'; // Default to '%' if no searchKeyword provided

        // SQL query to fetch paginated data with search
        const query = `
            SELECT 
                students.id,
                students.first_name,
                students.last_name,
                students.registration_number,
                student_fee.fee_id,
                student_fee.fee_amount,
                fee_transaction.transaction_id,
                fee_transaction.month,
                fee_transaction.paid_amount,
                fee_transaction.paid_status,
                fee_transaction.payment_date,
                fee_transaction.payment_method,
                fee_transaction.total_amount
            FROM 
                students
            INNER JOIN 
                student_fee ON students.id = student_fee.student_id
            INNER JOIN 
                fee_transaction ON student_fee.fee_id = fee_transaction.fee_id
            WHERE 
                (students.first_name LIKE ? OR students.last_name LIKE ? OR students.registration_number LIKE ?)
            LIMIT ? OFFSET ?;
        `;

        // SQL query to count total records with search
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM students
            INNER JOIN student_fee ON students.id = student_fee.student_id
            INNER JOIN fee_transaction ON student_fee.fee_id = fee_transaction.fee_id
            WHERE 
                (students.first_name LIKE ? OR students.last_name LIKE ? OR students.registration_number LIKE ?);
        `;

        const con = await dbConnection();

        try {
            // Get total count for pagination
            con.query(countQuery, [searchKeyword, searchKeyword, searchKeyword], (err, countResult) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        status: 500,
                        error: {
                            msg: "Internal server error"
                        }
                    });
                }

                const total = countResult[0].total;
                const totalPages = Math.ceil(total / limit);

                // Get paginated data with search
                con.query(query, [searchKeyword, searchKeyword, searchKeyword, limit, offset], (err, result) => {
                    if (err) {
                        console.log(err);
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
                                records: result,
                                pagination: {
                                    total,
                                    totalPages,
                                    currentPage: page,
                                    pageSize: limit
                                }
                            }
                        });
                    }
                });
            });
        } catch (error) {
            return res.status(500).json({
                error: {
                    msg: "Internal server error"
                }
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: {
                msg: "Internal server error"
            }
        });
    }
};


module.exports.deleteTransaction = async (req, res) => {
    try {
        const { transactionIds } = req.body; // Assuming the IDs are passed in the request body
        const con = await dbConnection();

        console.log("transactionIds", transactionIds);

        // Validate if the transaction exists
        const validateQuery = `
            SELECT * FROM fee_transaction WHERE transaction_id IN (?);
        `;

        con.query(validateQuery, [transactionIds], (err, result) => {
            if (err) {
                console.error("Error executing validation query:", err);
                return res.status(500).json({ error: { msg: "Internal server error" } });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    status: 404,
                    error: { msg: "Transaction not found" }
                });
            }

            // Delete the transactions
            const deleteQuery = `
                DELETE FROM fee_transaction 
                WHERE transaction_id IN (?);
            `;
            con.query(deleteQuery, [transactionIds], (err, result) => {
                if (err) {
                    console.error("Error executing deleteQuery:", err);
                    return res.status(500).json({ error: { msg: "Internal server error" } });
                }

                if (result.affectedRows > 0) {
                    return res.status(200).json({
                        status: 200,
                        msg: "Transactions deleted successfully"
                    });
                } else {
                    return res.status(404).json({
                        status: 404,
                        error: { msg: "No matching records found to delete" }
                    });
                }
            });
        });
    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ error: { msg: "Internal server error" } });
    }
};
