import express from "express";
import {
	addIncome,
	getIncomes,
	getIncomeById,
	deleteIncome,
	getIncomeStats,
	updateIncome,
} from "../controller/IncomeController.js";
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

// Simple routes first - no parameters
router.get("/", authenticator, asyncHandler(getIncomes));
router.post("/", authenticator, asyncHandler(addIncome));
router.get("/stats", authenticator, asyncHandler(getIncomeStats));

// Parameter routes - must come after non-parameter routes
router.get("/:id", authenticator, asyncHandler(getIncomeById));
router.put(
	"/:id",
	authenticator,
	asyncHandler((req, res) => {
		console.log("PUT /:id route hit with ID:", req.params.id);
		console.log("Request body:", req.body);
		return updateIncome(req, res);
	})
);
router.delete("/:id", authenticator, asyncHandler(deleteIncome));

export default router;
