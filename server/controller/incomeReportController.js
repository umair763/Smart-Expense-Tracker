import Income from "../model/IncomeModel.js";
import mongoose from "mongoose";
import moment from "moment";
import { Parser } from "json2csv";

/**
 * Generate CSV report for incomes
 * @route GET /api/reports/incomes/csv
 * @access Private
 */
export const generateIncomeCsv = async (req, res) => {
	try {
		const userId = req.userId;
		console.log("User ID from token:", userId);

		// Get query parameters for filtering
		const { startDate, endDate, category, includeAllDates } = req.query;
		const downloadAll = includeAllDates === "true" || (!startDate && !endDate);

		console.log("Download all dates:", downloadAll);

		// Build filter criteria
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
			filterCriteria.date = {
				$gte: startDate,
				$lte: endDate,
			};
		}

		// Add category filter if provided
		if (category) {
			filterCriteria.category = category;
		}

		console.log("Filter criteria:", JSON.stringify(filterCriteria));

		// Get all incomes without filtering first
		const allIncomes = await Income.find({}).lean();
		console.log(`Total incomes in DB: ${allIncomes.length}`);

		if (allIncomes.length > 0) {
			console.log("Sample income userId type:", typeof allIncomes[0].userId);
			if (allIncomes[0].userId) {
				console.log("Sample income userId value:", allIncomes[0].userId.toString());
			}
		}

		// Apply filtering in memory instead of in the query
		let filteredIncomes = allIncomes.filter((income) => {
			// Check if this income belongs to the user
			const incomeUserId = income.userId ? income.userId.toString() : "";
			const requestUserId = userId ? userId.toString() : "";
			return incomeUserId === requestUserId;
		});

		console.log(`Found ${filteredIncomes.length} income records for this user before additional filtering`);

		// Apply date filtering separately if needed and not downloading all
		if (!downloadAll && startDate && endDate) {
			filteredIncomes = filteredIncomes.filter((income) => {
				const recordedDate = income.date ? new Date(income.date).toISOString().split("T")[0] : "";
				return recordedDate >= startDate && recordedDate <= endDate;
			});
			console.log(`After date filtering: ${filteredIncomes.length} records`);
		} else {
			console.log("Skipping date filtering - downloading all user records");
		}

		// Apply category filtering if needed
		if (category) {
			filteredIncomes = filteredIncomes.filter((income) => income.category === category);
			console.log(`After category filtering: ${filteredIncomes.length} records`);
		}

		console.log(`Filtered to ${filteredIncomes.length} income records for this user`);

		if (filteredIncomes.length === 0) {
			return res.status(404).json({ message: "No income records found for the specified criteria" });
		}

		// Prepare data for CSV
		const incomesData = filteredIncomes.map((income) => ({
			Description: income.description,
			Category: income.category,
			Amount: `$${income.amount.toFixed(2)}`,
			Date: income.date,
			Time: income.time,
			ID: income.id,
			Created: moment(income.createdAt).format("YYYY-MM-DD HH:mm:ss"),
		}));

		console.log(`Prepared ${incomesData.length} records for CSV`);

		// Define fields for CSV
		const fields = ["Description", "Category", "Amount", "Date", "Time", "ID", "Created"];

		// Create CSV parser
		const json2csvParser = new Parser({ fields });
		const csv = json2csvParser.parse(incomesData);

		// Set response headers for file download
		res.setHeader("Content-Type", "text/csv");
		res.setHeader("Content-Disposition", "attachment; filename=income-report.csv");

		// Send CSV data
		res.status(200).send(csv);
	} catch (error) {
		console.error("Error generating income report:", error);
		res.status(500).json({
			message: "Error generating income report",
			error: error.message,
		});
	}
};
