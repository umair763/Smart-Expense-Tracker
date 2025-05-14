import Expense from "../model/ExpenseModel.js";
import Income from "../model/IncomeModel.js";
import Transaction from "../model/TransactionModel.js";
import User from "../model/UserModel.js";
import mongoose from "mongoose";

// Get finance summary with aggregated data from expenses, income, and transactions
export const getFinanceSummary = async (req, res) => {
	try {
		const { timeFilter } = req.params;
		const userId = req.userId;

		console.log(`Fetching finance summary for user: ${userId} with timeFilter: ${timeFilter}`);

		// Validate timeFilter
		if (!["week", "month", "year", "all"].includes(timeFilter)) {
			return res.status(400).json({
				success: false,
				message: "Invalid time filter. Use 'week', 'month', 'year', or 'all'.",
			});
		}

		// Convert userId to MongoDB ObjectId
		const userObjectId = new mongoose.Types.ObjectId(userId);

		// Calculate date range based on timeFilter
		const currentDate = new Date();
		let startDate = new Date();

		if (timeFilter === "week") {
			startDate.setDate(currentDate.getDate() - 7);
		} else if (timeFilter === "month") {
			startDate.setMonth(currentDate.getMonth() - 1);
		} else if (timeFilter === "year") {
			startDate.setFullYear(currentDate.getFullYear() - 1);
		} else {
			// "all" - set to a very old date to include everything
			startDate = new Date(0); // January 1, 1970
		}

		// Format dates for string comparison (assuming dates are stored as strings like "YYYY-MM-DD")
		const startDateStr = startDate.toISOString().split("T")[0];

		// First, get the user details with READ COMMITTED isolation
		const user = await User.findById(userId, null, { readConcern: "majority" });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Get filtered expenses, income, and transactions in parallel with READ COMMITTED isolation
		const [expenses, income, transactions] = await Promise.all([
			Expense.find(
				{
					userId: userObjectId,
					recordedDate: { $gte: startDateStr },
				},
				null,
				{ readConcern: "majority" }
			),
			Income.find(
				{
					userId: userObjectId,
					date: { $gte: startDateStr },
				},
				null,
				{ readConcern: "majority" }
			),
			Transaction.find(
				{
					userId: userObjectId,
					date: { $gte: startDateStr },
				},
				null,
				{ readConcern: "majority" }
			),
		]);

		// Return the data
		return res.status(200).json({
			success: true,
			timeFilter,
			name: user.name,
			expenses,
			income,
			transactions,
		});
	} catch (error) {
		console.error("Error getting finance summary:", error);
		return res.status(500).json({
			success: false,
			message: "Error fetching financial summary",
			error: error.message,
		});
	}
};

// Get a joined view of financial data across expenses, income and transactions
export const getJoinedFinancialData = async (req, res) => {
	try {
		const userId = req.userId;

		// Convert userId to MongoDB ObjectId
		const userObjectId = new mongoose.Types.ObjectId(userId);

		// First, get the user details with READ COMMITTED isolation
		const user = await User.findById(userId, null, { readConcern: "majority" });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Get expenses, income, and transactions in parallel for better performance with READ COMMITTED isolation
		const [expenses, income, transactions] = await Promise.all([
			Expense.find({ userId: userObjectId }, null, { readConcern: "majority" }),
			Income.find({ userId: userObjectId }, null, { readConcern: "majority" }),
			Transaction.find({ userId: userObjectId }, null, { readConcern: "majority" }),
		]);

		// Transform the data into the desired format
		const records = [];

		// Process expenses
		expenses.forEach((expense) => {
			records.push({
				name: user.name,
				income_category: null,
				income_amount: null,
				income_date: null,
				expense_category: expense.category,
				expense_amount: expense.amount,
				expense_date: expense.recordedDate,
				transaction_amount: null,
				transaction_status: null,
				transaction_date: null,
			});
		});

		// Process income
		income.forEach((inc) => {
			records.push({
				name: user.name,
				income_category: inc.category,
				income_amount: inc.amount,
				income_date: inc.date,
				expense_category: null,
				expense_amount: null,
				expense_date: null,
				transaction_amount: null,
				transaction_status: null,
				transaction_date: null,
			});
		});

		// Process transactions
		transactions.forEach((transaction) => {
			records.push({
				name: user.name,
				income_category: null,
				income_amount: null,
				income_date: null,
				expense_category: null,
				expense_amount: null,
				expense_date: null,
				transaction_amount: transaction.amount,
				transaction_status: transaction.status,
				transaction_date: transaction.date,
			});
		});

		return res.status(200).json({
			success: true,
			data: {
				user: {
					name: user.name,
					email: user.email,
				},
				records,
			},
		});
	} catch (error) {
		console.error("Error fetching joined financial data:", error);
		return res.status(500).json({
			success: false,
			message: "Error fetching financial data",
			error: error.message,
		});
	}
};

// Get financial data with MongoDB's aggregation framework
export const getAggregatedFinancialData = async (req, res) => {
	// Start a MongoDB session for transaction
	const session = await mongoose.startSession();

	try {
		// Start transaction with readConcern "snapshot" for REPEATABLE READ isolation
		session.startTransaction({
			readConcern: "snapshot",
			writeConcern: { w: "majority" },
		});

		console.log("Started transaction with REPEATABLE READ isolation level (snapshot)");
		const userId = req.userId;

		// Convert userId to MongoDB ObjectId
		const userObjectId = new mongoose.Types.ObjectId(userId);

		// Get user data within the transaction
		const userData = await User.aggregate([
			// Match the specific user
			{ $match: { _id: userObjectId } },

			// Lookup expenses
			{
				$lookup: {
					from: "expenses",
					let: { userId: "$_id" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
						{
							$project: {
								_id: 0,
								name: "$$ROOT.name",
								income_category: null,
								income_amount: null,
								income_date: null,
								expense_category: "$category",
								expense_amount: "$amount",
								expense_date: "$recordedDate",
								transaction_amount: null,
								transaction_status: null,
								transaction_date: null,
							},
						},
					],
					as: "expenseRecords",
				},
			},

			// Lookup income
			{
				$lookup: {
					from: "incomes",
					let: { userId: "$_id" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
						{
							$project: {
								_id: 0,
								name: "$$ROOT.name",
								income_category: "$category",
								income_amount: "$amount",
								income_date: "$date",
								expense_category: null,
								expense_amount: null,
								expense_date: null,
								transaction_amount: null,
								transaction_status: null,
								transaction_date: null,
							},
						},
					],
					as: "incomeRecords",
				},
			},

			// Lookup transactions
			{
				$lookup: {
					from: "transactions",
					let: { userId: "$_id" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
						{
							$project: {
								_id: 0,
								name: "$$ROOT.name",
								income_category: null,
								income_amount: null,
								income_date: null,
								expense_category: null,
								expense_amount: null,
								expense_date: null,
								transaction_amount: "$amount",
								transaction_status: "$status",
								transaction_date: "$date",
							},
						},
					],
					as: "transactionRecords",
				},
			},

			// Combine all records
			{
				$project: {
					_id: 0,
					user: {
						name: "$name",
						email: "$email",
					},
					records: {
						$concatArrays: ["$expenseRecords", "$incomeRecords", "$transactionRecords"],
					},
				},
			},
		]).session(session); // Associate the aggregation with the session

		// Commit the transaction to ensure REPEATABLE READ guarantees are maintained
		await session.commitTransaction();
		console.log("Transaction committed successfully");

		// Handle no results case
		if (!userData || userData.length === 0) {
			return res.status(200).json({
				success: true,
				data: {
					user: { name: "Unknown", email: "unknown" },
					records: [],
				},
				message: "No financial data found for user",
				isolationLevel: "REPEATABLE READ (snapshot)",
			});
		}

		return res.status(200).json({
			success: true,
			data: userData[0],
			isolationLevel: "REPEATABLE READ (snapshot)",
		});
	} catch (error) {
		console.error("Error in MongoDB aggregation:", error);

		// Abort the transaction if there's an error
		await session.abortTransaction();
		console.log("Transaction aborted due to error");

		return res.status(500).json({
			success: false,
			message: "Error aggregating financial data",
			error: error.message,
		});
	} finally {
		// End the session
		session.endSession();
		console.log("Transaction session ended");
	}
};
