import express from "express";
import {
	getTransactions,
	createTransaction,
	updateTransaction,
	deleteTransaction,
} from "../controller/TransactionController.js";
import authenticator from "../middleware/auth.js";

const router = express.Router();

// Error handler wrapper for async route handlers
const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch((err) => {
		console.error(`Route error in ${req.method} ${req.originalUrl}:`, err);

		// Always ensure JSON response
		res.setHeader("Content-Type", "application/json");

		res.status(500).json({
			success: false,
			message: "Server error processing request",
			error: err.message,
			path: req.originalUrl,
		});
	});
};

// Fetch transactions
router.get("/", authenticator, asyncHandler(getTransactions));

// Create a new transaction
router.post("/", authenticator, asyncHandler(createTransaction));

// Update an existing transaction
router.put("/:id", authenticator, asyncHandler(updateTransaction));

// Delete a transaction
router.delete("/:id", authenticator, asyncHandler(deleteTransaction));

export default router;
