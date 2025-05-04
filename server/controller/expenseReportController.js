import Expense from "../model/ExpenseModel.js";
import mongoose from "mongoose";
import moment from "moment";
import { Parser } from "json2csv";

/**
 * Generate CSV report for expenses
 * @route GET /api/reports/expenses/csv
 * @access Private
 */
export const generateExpenseCsv = async (req, res) => {
	try {
		const userId = req.userId;
		console.log("User ID from token:", userId);

		// Get query parameters for filtering
		const { startDate, endDate, category, includeAllDates } = req.query;
		const downloadAll = includeAllDates === "true" || (!startDate && !endDate);

		console.log("Download all dates:", downloadAll);

		// Build filter criteria
		// Convert userId to ObjectId if it's not already
		let filterCriteria = {};

		if (userId) {
			// Only add userId filter if it's present
			try {
				// Convert to ObjectId if it's not already one
				filterCriteria.userId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
			} catch (err) {
				console.error("Error converting userId to ObjectId:", err);
				// Fall back to using the raw userId
				filterCriteria.userId = userId;
			}
		}

		// Add date range filter if provided and not downloading all
		if (!downloadAll && startDate && endDate) {
			filterCriteria.recordedDate = {
				$gte: startDate,
				$lte: endDate,
			};
		}

		// Add category filter if provided
		if (category) {
			filterCriteria.category = category;
		}

		console.log("Filter criteria:", JSON.stringify(filterCriteria));

		// Get all expenses without filtering first to debug
		const allExpenses = await Expense.find({}).limit(10).lean();
		console.log(`Total expenses in DB (sampled 10): ${allExpenses.length}`);

		if (allExpenses.length > 0) {
			console.log("Sample expense:", JSON.stringify(allExpenses[0]));
			console.log("Sample expense userId type:", typeof allExpenses[0].userId);
			if (allExpenses[0].userId) {
				console.log("Sample expense userId value:", allExpenses[0].userId.toString());
			}
		}

		// Fetch all expenses first
		const expenses = await Expense.find({}).lean();
		console.log(`Found ${expenses.length} expense records total`);

		// Apply filtering in memory
		let filteredExpenses = expenses.filter((expense) => {
			// Check if this expense belongs to the user
			const expenseUserId = expense.userId ? expense.userId.toString() : "";
			const requestUserId = userId ? userId.toString() : "";

			return expenseUserId === requestUserId;
		});

		console.log(`Found ${filteredExpenses.length} expense records for this user before additional filtering`);

		// Apply date filtering separately if needed and not downloading all
		if (!downloadAll && startDate && endDate) {
			filteredExpenses = filteredExpenses.filter((expense) => {
				// Convert dates to YYYY-MM-DD format for comparison
				const expenseDate = expense.recordedDate ? new Date(expense.recordedDate).toISOString().split("T")[0] : "";
				return expenseDate >= startDate && expenseDate <= endDate;
			});
			console.log(`After date filtering: ${filteredExpenses.length} records`);
		} else {
			console.log("Skipping date filtering - downloading all user records");
		}

		// Apply category filtering if needed
		if (category) {
			filteredExpenses = filteredExpenses.filter((expense) => expense.category === category);
			console.log(`After category filtering: ${filteredExpenses.length} records`);
		}

		console.log(`Filtered to ${filteredExpenses.length} expense records for this user`);

		if (filteredExpenses.length === 0) {
			return res.status(404).json({ message: "No expense records found for the specified criteria" });
		}

		// Prepare data for CSV
		const expensesData = filteredExpenses.map((expense) => ({
			Item: expense.item,
			Category: expense.category,
			Amount: `$${expense.amount.toFixed(2)}`,
			Date: expense.recordedDate,
			Created: moment(expense.createdAt).format("YYYY-MM-DD HH:mm:ss"),
		}));

		console.log(`Prepared ${expensesData.length} records for CSV`);

		// Define fields for CSV
		const fields = ["Item", "Category", "Amount", "Date", "Created"];

		// Create CSV parser
		const json2csvParser = new Parser({ fields });
		const csv = json2csvParser.parse(expensesData);

		// Set response headers for file download
		res.setHeader("Content-Type", "text/csv");
		res.setHeader("Content-Disposition", "attachment; filename=expense-report.csv");

		// Send CSV data
		res.status(200).send(csv);
	} catch (error) {
		console.error("Error generating expense report:", error);
		res.status(500).json({
			message: "Error generating expense report",
			error: error.message,
		});
	}
};
