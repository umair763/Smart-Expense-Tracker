import Transaction from "../model/TransactionModel.js";
import mongoose from "mongoose";
import { dbEvents } from "../index.js";
import { Parser } from "json2csv";
import moment from "moment";
const { ObjectId } = mongoose.Types;

// Get all transactions with pagination
export const getTransactions = async (req, res) => {
	try {
		// Get the authenticated user's ID from the request
		const userId = req.userId;
		console.log("Fetching transactions for userId:", userId);

		// Parse pagination parameters
		const page = Number.parseInt(req.query.page) || 1;
		const limit = Number.parseInt(req.query.limit) || 10;

		// Get filter parameters from query and clean them
		let { status, id, date } = req.query;

		// Clean filter values
		if (status) status = status.trim();
		if (id) id = id.trim();
		if (date) date = date.trim();

		// Log filter parameters explicitly
		console.log("Filter parameters received:");
		console.log("- Status filter:", status || "not set");
		console.log("- ID filter:", id || "not set");
		console.log("- Date filter:", date || "not set");

		// Create filter object starting with userId
		let filter = {};

		// Create a valid ObjectId
		let userObjectId;
		try {
			userObjectId = new ObjectId(userId);
			filter.userId = userObjectId;
		} catch (err) {
			console.error("Invalid ObjectId:", err);
			return res.status(400).json({ message: "Invalid user ID format" });
		}

		// Add filters individually only if they exist

		// Status filter - exact match
		if (status && status !== "") {
			filter.status = status;
			console.log(`Adding status filter: ${status}`);
		}

		// Transaction ID filter
		if (id && id !== "") {
			// Handle numeric IDs with exact match
			if (/^\d+$/.test(id)) {
				filter.id = id;
				console.log(`Adding exact ID filter: ${id}`);
			} else {
				// For other IDs, use case-insensitive partial matching
				filter.id = { $regex: id, $options: "i" };
				console.log(`Adding ID regex filter: ${id}`);
			}
		}

		// Date filter - exact match
		if (date && date !== "") {
			filter.date = date;
			console.log(`Adding date filter: ${date}`);
		}

		// Log the final query
		console.log("Final filter:", JSON.stringify(filter, null, 2));

		// Filter transactions with READ COMMITTED isolation level (readConcern: "majority")
		const transactions = await Transaction.find(filter, null, {
			readConcern: "majority", // Apply READ COMMITTED isolation level
		})
			.sort({ date: -1, time: -1 }) // Sort by date and time, most recent first
			.skip((page - 1) * limit)
			.limit(limit);

		// Log results
		console.log(`Found ${transactions.length} matching transactions`);

		// Count total filtered transactions with READ COMMITTED isolation level
		const totalTransactions = await Transaction.countDocuments(filter, {
			readConcern: "majority", // Apply READ COMMITTED isolation level
		});
		const totalPages = Math.ceil(totalTransactions / limit);

		// Return response
		res.status(200).json({
			transactions,
			totalPages,
			currentPage: page,
			totalTransactions,
		});
	} catch (error) {
		console.error("Error in getTransactions:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Create a new transaction
export const createTransaction = async (req, res) => {
	// Start a MongoDB session for transaction
	const session = await mongoose.startSession();
	const startTime = Date.now(); // Add timestamp for performance tracking

	try {
		// Start transaction with readConcern "snapshot" for REPEATABLE READ isolation
		session.startTransaction({
			readConcern: "snapshot",
			writeConcern: { w: "majority" },
		});

		console.log("Started transaction with REPEATABLE READ isolation level (snapshot)");

		// Get the authenticated user's ID from the request
		const userId = req.userId;
		console.log("Creating transaction for userId:", userId);

		// Debug: Check the incoming request body
		console.log("Request body:", req.body);

		// Create a valid ObjectId
		let userObjectId;
		try {
			userObjectId = new ObjectId(userId);
		} catch (err) {
			console.error("Invalid ObjectId:", err);
			return res.status(400).json({ message: "Invalid user ID format" });
		}

		// Add the userId to the transaction data
		const transactionData = {
			...req.body,
			userId: userObjectId,
		};

		// Debug: Log the transaction data we're about to save
		console.log("Saving transaction with data:", transactionData);

		const newTransaction = new Transaction(transactionData);

		// Debug: Check if the transaction is valid
		const validationError = newTransaction.validateSync();
		if (validationError) {
			console.error("Validation error:", validationError);
			return res.status(400).json({
				message: "Validation failed",
				errors: validationError.errors,
			});
		}

		// Save within the transaction session
		await newTransaction.save({ session });

		// Commit the transaction
		await session.commitTransaction();
		console.log("Transaction committed successfully");
		
		const executionTime = Date.now() - startTime; // Calculate execution time

		// Emit event for the notification system : Trigger
		dbEvents.emit("db_change", {
			operation: "insert",
			collection: "transactions",
			documentId: newTransaction._id,
			executionTime: executionTime,
			transactionState: "committed"
		});

		console.log("Transaction created successfully:", newTransaction._id);
		res.status(201).json({
			message: "Transaction created successfully",
			transaction: newTransaction,
			isolationLevel: "REPEATABLE READ (snapshot)",
			executionTime: executionTime,
			transactionState: "committed"
		});
	} catch (error) {
		console.error("Error creating transaction:", error);
		const executionTime = Date.now() - startTime; // Calculate execution time

		// Abort the transaction if there's an error
		await session.abortTransaction();
		console.log("Transaction aborted due to error");

		// Emit event for the notification system : Trigger
		dbEvents.emit("db_change", {
			operation: "insert",
			collection: "transactions",
			error: error.message,
			executionTime: executionTime,
			transactionState: "aborted"
		});

		// Send more details about the error to help troubleshoot
		res.status(500).json({
			message: "Failed to create transaction",
			error: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			executionTime: executionTime,
			transactionState: "aborted"
		});
	} finally {
		// End the session
		session.endSession();
		console.log("Transaction session ended");
	}
};

// Update a transaction
export const updateTransaction = async (req, res) => {
	// Start a MongoDB session for transaction
	const session = await mongoose.startSession();
	const startTime = Date.now(); // Add timestamp for performance tracking

	try {
		// Start transaction with readConcern "snapshot" for REPEATABLE READ isolation
		session.startTransaction({
			readConcern: "snapshot",
			writeConcern: { w: "majority" },
		});

		console.log("Started transaction with REPEATABLE READ isolation level (snapshot)");

		// Get the authenticated user's ID from the request
		const userId = req.userId;
		const transactionId = req.params.id;

		console.log("Updating transaction:", transactionId, "for userId:", userId);
		console.log("Update data:", req.body);
		console.log("Request params:", req.params);
		console.log("Request path:", req.path);
		console.log("Full URL:", req.originalUrl);

		// Create a valid ObjectId
		let userObjectId;
		try {
			userObjectId = new ObjectId(userId);
		} catch (err) {
			console.error("Invalid ObjectId:", err);
			return res.status(400).json({ message: "Invalid user ID format" });
		}

		// Find the transaction and verify it belongs to the user within the transaction session
		const transaction = await Transaction.findOne({
			_id: transactionId,
			userId: userObjectId,
		}).session(session);

		console.log("Found transaction:", transaction);

		if (!transaction) {
			// Abort the transaction since we're returning early
			await session.abortTransaction();
			console.log("Transaction aborted - transaction not found");
			session.endSession();

			return res.status(404).json({
				message: "Transaction not found or you don't have permission to update it",
			});
		}

		// Update the transaction with the new data
		const updatedData = {
			...req.body,
			userId: userObjectId, // Ensure userId remains unchanged
		};

		// Update the transaction within the transaction session
		const updatedTransaction = await Transaction.findByIdAndUpdate(transactionId, updatedData, {
			new: true,
			runValidators: true,
			session, // Pass the session to the update operation
		});

		// Commit the transaction
		await session.commitTransaction();
		console.log("Transaction committed successfully");
		
		const executionTime = Date.now() - startTime; // Calculate execution time

		// Emit event for the notification system
		dbEvents.emit("db_change", {
			operation: "update",
			collection: "transactions",
			documentId: updatedTransaction._id,
			executionTime: executionTime,
			transactionState: "committed"
		});

		console.log("Transaction updated successfully");
		res.status(200).json({
			message: "Transaction updated successfully",
			transaction: updatedTransaction,
			isolationLevel: "REPEATABLE READ (snapshot)",
			executionTime: executionTime,
			transactionState: "committed"
		});
	} catch (error) {
		console.error("Error updating transaction:", error);
		const executionTime = Date.now() - startTime; // Calculate execution time

		// Abort the transaction if there's an error
		await session.abortTransaction();
		console.log("Transaction aborted due to error");
		
		// Emit event for the notification system
		dbEvents.emit("db_change", {
			operation: "update",
			collection: "transactions",
			error: error.message,
			executionTime: executionTime,
			transactionState: "aborted"
		});

		res.status(500).json({
			message: "Failed to update transaction",
			error: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			executionTime: executionTime,
			transactionState: "aborted"
		});
	} finally {
		// End the session
		session.endSession();
		console.log("Transaction session ended");
	}
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
	// Start a MongoDB session for transaction
	const session = await mongoose.startSession();
	const startTime = Date.now(); // Add timestamp for performance tracking

	try {
		// Start transaction with readConcern "snapshot" for REPEATABLE READ isolation
		session.startTransaction({
			readConcern: "snapshot",
			writeConcern: { w: "majority" },
		});

		console.log("Started transaction with REPEATABLE READ isolation level (snapshot)");

		// Get the authenticated user's ID from the request
		const userId = req.userId;
		const transactionId = req.params.id;

		console.log("Deleting transaction:", transactionId, "for userId:", userId);
		console.log("Request params:", req.params);
		console.log("Request path:", req.path);
		console.log("Full URL:", req.originalUrl);

		// Create a valid ObjectId
		let userObjectId;
		try {
			userObjectId = new ObjectId(userId);
		} catch (err) {
			console.error("Invalid ObjectId:", err);
			return res.status(400).json({ message: "Invalid user ID format" });
		}

		// Find the transaction and verify it belongs to the user within the transaction session
		const transaction = await Transaction.findOne({
			_id: transactionId,
			userId: userObjectId,
		}).session(session);

		console.log("Found transaction to delete:", transaction);

		if (!transaction) {
			// Abort the transaction since we're returning early
			await session.abortTransaction();
			console.log("Transaction aborted - transaction not found");
			session.endSession();

			return res.status(404).json({
				message: "Transaction not found or you don't have permission to delete it",
			});
		}

		// Delete the transaction within the transaction session
		await Transaction.findByIdAndDelete(transactionId).session(session);

		// Commit the transaction
		await session.commitTransaction();
		console.log("Transaction committed successfully");
		
		const executionTime = Date.now() - startTime; // Calculate execution time

		// Emit event for the notification system
		dbEvents.emit("db_change", {
			operation: "delete",
			collection: "transactions",
			documentId: transactionId,
			executionTime: executionTime,
			transactionState: "committed"
		});

		console.log("Transaction deleted successfully");
		res.status(200).json({
			message: "Transaction deleted successfully",
			isolationLevel: "REPEATABLE READ (snapshot)",
			executionTime: executionTime,
			transactionState: "committed"
		});
	} catch (error) {
		console.error("Error deleting transaction:", error);
		const executionTime = Date.now() - startTime; // Calculate execution time

		// Abort the transaction if there's an error
		await session.abortTransaction();
		console.log("Transaction aborted due to error");
		
		// Emit event for the notification system
		dbEvents.emit("db_change", {
			operation: "delete",
			collection: "transactions",
			error: error.message,
			executionTime: executionTime,
			transactionState: "aborted"
		});

		res.status(500).json({
			message: "Failed to delete transaction",
			error: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			executionTime: executionTime,
			transactionState: "aborted"
		});
	} finally {
		// End the session
		session.endSession();
		console.log("Transaction session ended");
	}
};

// NEW FUNCTION: Generate CSV report for transactions
export const generateTransactionCsv = async (req, res) => {
	try {
		const userId = req.userId;
		console.log("User ID from token:", userId);

		// Get query parameters for filtering
		const { startDate, endDate, status, depositoryInstitution, includeAllDates } = req.query;
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

		// Add status filter if provided
		if (status) {
			filterCriteria.status = status;
		}

		// Add depository institution filter if provided
		if (depositoryInstitution) {
			filterCriteria.depository_institution = depositoryInstitution;
		}

		console.log("Filter criteria:", JSON.stringify(filterCriteria));

		// Get all transactions without filtering first
		const allTransactions = await Transaction.find({}).lean();
		console.log(`Total transactions in DB: ${allTransactions.length}`);

		if (allTransactions.length > 0) {
			console.log("Sample transaction userId type:", typeof allTransactions[0].userId);
			if (allTransactions[0].userId) {
				console.log("Sample transaction userId value:", allTransactions[0].userId.toString());
			}
		}

		// Apply filtering in memory instead of in the query
		let filteredTransactions = allTransactions.filter((transaction) => {
			// Check if this transaction belongs to the user
			const transactionUserId = transaction.userId ? transaction.userId.toString() : "";
			const requestUserId = userId ? userId.toString() : "";
			return transactionUserId === requestUserId;
		});

		console.log(`Found ${filteredTransactions.length} transaction records for this user before additional filtering`);

		// Apply date filtering separately if needed and not downloading all
		if (!downloadAll && startDate && endDate) {
			filteredTransactions = filteredTransactions.filter((transaction) => {
				const recordedDate = transaction.date ? new Date(transaction.date).toISOString().split("T")[0] : "";
				return recordedDate >= startDate && recordedDate <= endDate;
			});
			console.log(`After date filtering: ${filteredTransactions.length} records`);
		} else {
			console.log("Skipping date filtering - downloading all user records");
		}

		// Apply status filtering if needed
		if (status) {
			filteredTransactions = filteredTransactions.filter((transaction) => transaction.status === status);
			console.log(`After status filtering: ${filteredTransactions.length} records`);
		}

		// Apply depository institution filtering if needed
		if (depositoryInstitution) {
			filteredTransactions = filteredTransactions.filter(
				(transaction) => transaction.depository_institution === depositoryInstitution
			);
			console.log(`After depository institution filtering: ${filteredTransactions.length} records`);
		}

		console.log(`Filtered to ${filteredTransactions.length} transaction records for this user`);

		// Define fields for CSV
		const fields = [
			"Transaction ID",
			"Date",
			"Time",
			"Amount",
			"Status",
			"Depository Institution",
			"Description",
			"Discount (%)",
			"Fee/Charge",
			"Created",
		];

		// Return empty CSV with headers if no transactions found instead of 404 error
		if (filteredTransactions.length === 0) {
			console.log("No transaction records found - returning empty CSV with headers");

			// Create CSV parser with just the headers
			const json2csvParser = new Parser({ fields });
			const emptyCsv = json2csvParser.parse([]);

			// Set response headers for file download
			res.setHeader("Content-Type", "text/csv");
			res.setHeader("Content-Disposition", "attachment; filename=transaction-report.csv");

			// Send empty CSV data with headers
			return res.status(200).send(emptyCsv);
		}

		// Prepare data for CSV
		const transactionsData = filteredTransactions.map((transaction) => ({
			"Transaction ID": transaction.id,
			Date: transaction.date,
			Time: transaction.time,
			Amount: `$${transaction.amount.toFixed(2)}`,
			Status: transaction.status,
			"Depository Institution": transaction.depository_institution,
			Description: transaction.description,
			"Discount (%)": transaction.discount || 0,
			"Fee/Charge": transaction.fee_charge || 0,
			Created: moment(transaction.createdAt).format("YYYY-MM-DD HH:mm:ss"),
		}));

		console.log(`Prepared ${transactionsData.length} records for CSV`);

		// Create CSV parser
		const json2csvParser = new Parser({ fields });
		const csv = json2csvParser.parse(transactionsData);

		// Set response headers for file download
		res.setHeader("Content-Type", "text/csv");
		res.setHeader("Content-Disposition", "attachment; filename=transaction-report.csv");

		// Send CSV data
		res.status(200).send(csv);
	} catch (error) {
		console.error("Error generating transaction report:", error);
		res.status(500).json({
			message: "Error generating transaction report",
			error: error.message,
		});
	}
};
