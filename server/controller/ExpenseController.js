import Expense from "../model/ExpenseModel.js";
import { dbEvents } from "../index.js";
import mongoose from "mongoose";

// Add new expense
export const addExpense = async (req, res) => {
	// Start a MongoDB session for transaction
	const session = await mongoose.startSession();

	try {
		// Start transaction with readConcern "snapshot" for REPEATABLE READ isolation
		session.startTransaction({
			readConcern: "snapshot",
			writeConcern: { w: "majority" },
		});

		console.log("Started transaction with REPEATABLE READ isolation level (snapshot)");

		// Extract the expense details from the request body
		const { category, item, amount, recordedDate } = req.body;

		// Get userId from the decoded JWT token
		const userId = req.userId; // From the authenticator middleware

		// Validate the required fields
		if (!category || !item || !amount || !recordedDate) {
			// Abort the transaction since we're returning early
			await session.abortTransaction();
			console.log("Transaction aborted - validation failed");
			session.endSession();

			return res.status(400).json({ message: "All fields are required." });
		}

		// Create the new expense
		const newExpense = new Expense({
			category,
			item,
			amount,
			recordedDate,
			userId, // Set userId to the extracted userId
		});

		// Save the expense to the database within the transaction session
		await newExpense.save({ session });

		// Commit the transaction
		await session.commitTransaction();
		console.log("Transaction committed successfully");

		// Emit event for the notification system : Trigger
		dbEvents.emit("db_change", {
			operation: "insert",
			collection: "expenses",
			documentId: newExpense._id,
		});

		// Return a success response
		res.status(201).json({
			message: "Expense added successfully.",
			expense: newExpense,
			isolationLevel: "REPEATABLE READ (snapshot)",
		});
	} catch (error) {
		console.error("Error adding expense:", error);

		// Abort the transaction if there's an error
		await session.abortTransaction();
		console.log("Transaction aborted due to error");

		res.status(500).json({ message: "Error adding expense." });
	} finally {
		// End the session
		session.endSession();
		console.log("Transaction session ended");
	}
};

// Get all expenses for a user
export const getExpenses = async (req, res) => {
	try {
		// Add debugging log to see what's being used for userId
		console.log("Fetching expenses with userId:", req.userId);

		// Change req.user to req.userId to match what's set in the authenticator
		// Apply READ COMMITTED isolation level
		const expenses = await Expense.find({ userId: req.userId }, null, {
			readConcern: "majority", // Apply READ COMMITTED isolation level
		});

		// Log the found expenses
		console.log(`Found ${expenses.length} expenses`);

		res.json({
			expenses,
			isolationLevel: "READ COMMITTED (majority)",
		});
	} catch (err) {
		console.error("Error fetching expenses:", err);
		res.status(500).json({ message: "Failed to fetch expenses", error: err.message });
	}
};

// Get a specific expense
export const getExpenseById = async (req, res) => {
	const { id } = req.params;
	// Change req.user to req.userId here as well
	const userId = req.userId;

	try {
		// Apply READ COMMITTED isolation level
		const expense = await Expense.findOne({ _id: id, userId }, null, {
			readConcern: "majority", // Apply READ COMMITTED isolation level
		});

		if (!expense) {
			return res.status(404).json({ message: "Expense not found" });
		}

		res.status(200).json({
			expense,
			isolationLevel: "READ COMMITTED (majority)",
		});
	} catch (error) {
		console.error("Error fetching expense:", error);
		res.status(500).json({ error: "Failed to fetch expense" });
	}
};

export const deleteExpense = async (req, res) => {
	// Start a MongoDB session for transaction
	const session = await mongoose.startSession();

	try {
		// Start transaction with readConcern "snapshot" for REPEATABLE READ isolation
		session.startTransaction({
			readConcern: "snapshot",
			writeConcern: { w: "majority" },
		});

		console.log("Started transaction with REPEATABLE READ isolation level (snapshot)");

		const { id } = req.params;
		const userId = req.userId;

		console.log("Deleting expense:", id, "for userId:", userId);
		console.log("Request params:", req.params);
		console.log("Request path:", req.path);
		console.log("Full URL:", req.originalUrl);

		// Find the expense and verify it belongs to the user within the transaction session
		const expense = await Expense.findOne({ _id: id, userId }).session(session);

		console.log("Found expense to delete:", expense);

		if (!expense) {
			// Abort the transaction since we're returning early
			await session.abortTransaction();
			console.log("Transaction aborted - expense not found");
			session.endSession();

			return res.status(404).json({ message: "Expense not found or you don't have permission to delete it" });
		}

		// Delete the expense within the transaction session
		await Expense.findByIdAndDelete(id).session(session);

		// Commit the transaction
		await session.commitTransaction();
		console.log("Transaction committed successfully");

		// Emit event for the notification system : Trigger
		dbEvents.emit("db_change", {
			operation: "delete",
			collection: "expenses",
			documentId: id,
		});

		console.log("Expense deleted successfully");
		res.json({
			message: "Expense deleted successfully",
			isolationLevel: "REPEATABLE READ (snapshot)",
		});
	} catch (err) {
		console.error("Error deleting expense:", err);

		// Abort the transaction if there's an error
		await session.abortTransaction();
		console.log("Transaction aborted due to error");

		res.status(500).json({ message: "Failed to delete expense", error: err.message });
	} finally {
		// End the session
		session.endSession();
		console.log("Transaction session ended");
	}
};

// Update an expense
export const updateExpense = async (req, res) => {
	// Start a MongoDB session for transaction
	const session = await mongoose.startSession();

	try {
		// Start transaction with readConcern "snapshot" for REPEATABLE READ isolation
		session.startTransaction({
			readConcern: "snapshot",
			writeConcern: { w: "majority" },
		});

		console.log("Started transaction with REPEATABLE READ isolation level (snapshot)");

		const { id } = req.params;
		const userId = req.userId;
		const updateData = req.body;

		console.log("Updating expense:", id, "for userId:", userId);
		console.log("Update data:", updateData);
		console.log("Request params:", req.params);
		console.log("Request path:", req.path);
		console.log("Full URL:", req.originalUrl);

		// Find the expense and verify it belongs to the user within the transaction session
		const expense = await Expense.findOne({ _id: id, userId }).session(session);

		console.log("Found expense to update:", expense);

		if (!expense) {
			// Abort the transaction since we're returning early
			await session.abortTransaction();
			console.log("Transaction aborted - expense not found");
			session.endSession();

			return res.status(404).json({ message: "Expense not found or you don't have permission to update it" });
		}

		// Validate the required fields
		if (!updateData.category || !updateData.item || !updateData.amount || !updateData.recordedDate) {
			// Abort the transaction since we're returning early
			await session.abortTransaction();
			console.log("Transaction aborted - validation failed");
			session.endSession();

			return res.status(400).json({ message: "All fields are required." });
		}

		// Validate category is one of the allowed values
		const validCategories = [
			"Housing",
			"Transportation",
			"Food",
			"Healthcare",
			"PersonalCare",
			"Entertainment",
			"Education",
			"FinancialObligations",
			"Taxes",
		];

		if (!validCategories.includes(updateData.category)) {
			// Abort the transaction since we're returning early
			await session.abortTransaction();
			console.log("Transaction aborted - invalid category");
			session.endSession();

			return res.status(400).json({
				message: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
				validCategories,
			});
		}

		// Validate update data
		if (updateData.amount && isNaN(Number(updateData.amount))) {
			// Abort the transaction since we're returning early
			await session.abortTransaction();
			console.log("Transaction aborted - invalid amount");
			session.endSession();

			return res.status(400).json({ message: "Amount must be a valid number" });
		}

		// Try-catch specifically for the database update operation
		try {
			// Update the expense within the transaction session
			const updatedExpense = await Expense.findByIdAndUpdate(id, updateData, {
				new: true,
				runValidators: true,
				session, // Pass the session to the update operation
			});

			// Commit the transaction
			await session.commitTransaction();
			console.log("Transaction committed successfully");

			// Emit event for the notification system : Trigger
			dbEvents.emit("db_change", {
				operation: "update",
				collection: "expenses",
				documentId: id,
			});

			console.log("Expense updated successfully");
			res.json({
				message: "Expense updated successfully",
				expense: updatedExpense,
				isolationLevel: "REPEATABLE READ (snapshot)",
			});
		} catch (dbError) {
			console.error("Database error:", dbError);

			// Abort the transaction due to database error
			await session.abortTransaction();
			console.log("Transaction aborted due to database error");

			// Check for validation errors
			if (dbError.name === "ValidationError") {
				const validationErrors = {};

				// Extract specific validation errors
				for (const field in dbError.errors) {
					validationErrors[field] = dbError.errors[field].message;
				}

				return res.status(400).json({
					message: "Validation failed",
					errors: validationErrors,
				});
			}

			// General database error
			return res.status(500).json({
				message: "Database error during update",
				error: dbError.message,
			});
		}
	} catch (err) {
		console.error("Error updating expense:", err);

		// Abort the transaction if there's an error
		await session.abortTransaction();
		console.log("Transaction aborted due to error");

		res.status(500).json({ message: "Failed to update expense", error: err.message });
	} finally {
		// End the session
		session.endSession();
		console.log("Transaction session ended");
	}
};
