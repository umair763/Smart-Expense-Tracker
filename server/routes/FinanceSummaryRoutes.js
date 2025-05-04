import express from "express";
import {
	getFinanceSummary,
	getJoinedFinancialData,
	getAggregatedFinancialData,
} from "../controller/FinanceSummaryController.js";
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

// Root route
router.get("/", (req, res) => {
	console.log("Finance summary root route accessed: " + req.originalUrl);
	console.log("Full request path: " + JSON.stringify(req.path));
	console.log(
		"Router stack:",
		router.stack.map((r) => (r.route ? r.route.path : "middleware"))
	);

	res.json({
		success: true,
		message: "Finance summary API is working. Available endpoints: /test, /summary/:timeFilter, /joined, /aggregated",
		availableEndpoints: [
			{ method: "GET", path: "/api/finance-summary/test" },
			{ method: "GET", path: "/api/finance-summary/summary/:timeFilter" },
			{ method: "GET", path: "/api/finance-summary/joined" },
			{ method: "GET", path: "/api/finance-summary/aggregated" },
		],
	});
});

// Basic test route that doesn't require the controller
router.get("/test", (req, res) => {
	console.log("Finance summary test route accessed");
	res.json({
		success: true,
		message: "Finance summary API is working",
	});
});

// Route to get finance summary by time filter (week, month, year, all)
router.get("/summary/:timeFilter", authenticator, asyncHandler(getFinanceSummary));

// Route to get joined financial data
router.get("/joined", authenticator, asyncHandler(getJoinedFinancialData));

// Route to get aggregated financial data using MongoDB's aggregation framework
router.get("/aggregated", authenticator, asyncHandler(getAggregatedFinancialData));

export default router;
