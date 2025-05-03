import express from "express";
import { addExpense, getExpenses, getExpenseById, deleteExpense, updateExpense } from "../controller/ExpenseController.js";
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

// Route to add an expense (POST)
router.post("/", authenticator, asyncHandler(addExpense));

// Route for fetching expenses
router.get("/", authenticator, asyncHandler(getExpenses));

// Route to get an expense by ID (GET)
router.get("/:id", authenticator, asyncHandler(getExpenseById));

// Route to update an expense (PUT)
router.put("/:id", authenticator, asyncHandler(updateExpense));

// Route to delete an expense (DELETE)
router.delete("/:id", authenticator, asyncHandler(deleteExpense));

export default router;
