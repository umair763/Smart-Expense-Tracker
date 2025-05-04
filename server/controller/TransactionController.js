import Transaction from "../model/TransactionModel.js";
import mongoose from "mongoose";
import { dbEvents } from "../index.js";
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

		// Filter transactions
		const transactions = await Transaction.find(filter)
			.sort({ date: -1, time: -1 }) // Sort by date and time, most recent first
			.skip((page - 1) * limit)
			.limit(limit);

		// Log results
		console.log(`Found ${transactions.length} matching transactions`);

		// Count total filtered transactions
		const totalTransactions = await Transaction.countDocuments(filter);
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
	try {
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

		await newTransaction.save();

		// Emit event for the notification system : Trigger
		dbEvents.emit("db_change", {
			operation: "insert",
			collection: "transactions",
			documentId: newTransaction._id,
		});

		console.log("Transaction created successfully:", newTransaction._id);
		res.status(201).json({
			message: "Transaction created successfully",
			transaction: newTransaction,
		});
	} catch (error) {
		console.error("Error creating transaction:", error);
		// Send more details about the error to help troubleshoot
		res.status(500).json({
			message: "Failed to create transaction",
			error: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	}
};

// Update a transaction
export const updateTransaction = async (req, res) => {
	try {
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

		// Find the transaction and verify it belongs to the user
		const transaction = await Transaction.findOne({
			_id: transactionId,
			userId: userObjectId,
		});

		console.log("Found transaction:", transaction);

		if (!transaction) {
			return res.status(404).json({
				message: "Transaction not found or you don't have permission to update it",
			});
		}

		// Update the transaction with the new data
		const updatedData = {
			...req.body,
			userId: userObjectId, // Ensure userId remains unchanged
		};

		// Update the transaction
		const updatedTransaction = await Transaction.findByIdAndUpdate(
			transactionId,
			updatedData,
			{ new: true, runValidators: true } // Return the updated doc and run validators
		);

		// Emit event for the notification system : Trigger
		dbEvents.emit("db_change", {
			operation: "update",
			collection: "transactions",
			documentId: transactionId,
		});

		console.log("Transaction updated successfully");
		res.status(200).json({
			message: "Transaction updated successfully",
			transaction: updatedTransaction,
		});
	} catch (error) {
		console.error("Error updating transaction:", error);
		res.status(500).json({
			message: "Failed to update transaction",
			error: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	}
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
	try {
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

		// Find the transaction and verify it belongs to the user
		const transaction = await Transaction.findOne({
			_id: transactionId,
			userId: userObjectId,
		});

		console.log("Found transaction to delete:", transaction);

		if (!transaction) {
			return res.status(404).json({
				message: "Transaction not found or you don't have permission to delete it",
			});
		}

		// Delete the transaction
		await Transaction.findByIdAndDelete(transactionId);

		// Emit event for the notification system : Trigger
		dbEvents.emit("db_change", {
			operation: "delete",
			collection: "transactions",
			documentId: transactionId,
		});

		console.log("Transaction deleted successfully");
		res.status(200).json({
			message: "Transaction deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting transaction:", error);
		res.status(500).json({
			message: "Failed to delete transaction",
			error: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	}
};
