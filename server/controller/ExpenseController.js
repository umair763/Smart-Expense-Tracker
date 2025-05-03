import Expense from "../model/ExpenseModel.js";

// Add new expense
export const addExpense = async (req, res) => {
	try {
		// Extract the expense details from the request body
		const { category, item, amount, recordedDate } = req.body;

		// Get userId from the decoded JWT token
		const userId = req.userId; // From the authenticator middleware

		// Validate the required fields
		if (!category || !item || !amount || !recordedDate) {
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

		// Save the expense to the database
		await newExpense.save();

		// Return a success response
		res.status(201).json({ message: "Expense added successfully.", expense: newExpense });
	} catch (error) {
		console.error("Error adding expense:", error);
		res.status(500).json({ message: "Error adding expense." });
	}
};

// Get all expenses for a user
export const getExpenses = async (req, res) => {
	try {
		// Add debugging log to see what's being used for userId
		console.log("Fetching expenses with userId:", req.userId);

		// Change req.user to req.userId to match what's set in the authenticator
		const expenses = await Expense.find({ userId: req.userId });

		// Log the found expenses
		console.log(`Found ${expenses.length} expenses`);

		res.json(expenses);
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
		const expense = await Expense.findOne({ _id: id, userId });

		if (!expense) {
			return res.status(404).json({ message: "Expense not found" });
		}

		res.status(200).json(expense);
	} catch (error) {
		console.error("Error fetching expense:", error);
		res.status(500).json({ error: "Failed to fetch expense" });
	}
};

export const deleteExpense = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.userId;

		console.log("Deleting expense:", id, "for userId:", userId);
		console.log("Request params:", req.params);
		console.log("Request path:", req.path);
		console.log("Full URL:", req.originalUrl);

		// Find the expense and verify it belongs to the user
		const expense = await Expense.findOne({ _id: id, userId });

		console.log("Found expense to delete:", expense);

		if (!expense) {
			return res.status(404).json({ message: "Expense not found or you don't have permission to delete it" });
		}

		// Delete the expense
		await Expense.findByIdAndDelete(id);
		console.log("Expense deleted successfully");
		res.json({ message: "Expense deleted successfully" });
	} catch (err) {
		console.error("Error deleting expense:", err);
		res.status(500).json({ message: "Failed to delete expense", error: err.message });
	}
};

// Update an expense
export const updateExpense = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.userId;
		const updateData = req.body;

		console.log("Updating expense:", id, "for userId:", userId);
		console.log("Update data:", updateData);
		console.log("Request params:", req.params);
		console.log("Request path:", req.path);
		console.log("Full URL:", req.originalUrl);

		// Find the expense and verify it belongs to the user
		const expense = await Expense.findOne({ _id: id, userId });

		console.log("Found expense to update:", expense);

		if (!expense) {
			return res.status(404).json({ message: "Expense not found or you don't have permission to update it" });
		}

		// Validate the required fields
		if (!updateData.category || !updateData.item || !updateData.amount || !updateData.recordedDate) {
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
			return res.status(400).json({
				message: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
				validCategories,
			});
		}

		// Validate update data
		if (updateData.amount && isNaN(Number(updateData.amount))) {
			return res.status(400).json({ message: "Amount must be a valid number" });
		}

		// Try-catch specifically for the database update operation
		try {
			// Update the expense
			const updatedExpense = await Expense.findByIdAndUpdate(id, updateData, {
				new: true,
				runValidators: true,
			});

			console.log("Expense updated successfully");
			res.json({
				message: "Expense updated successfully",
				expense: updatedExpense,
			});
		} catch (dbError) {
			console.error("Database error:", dbError);

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
		res.status(500).json({ message: "Failed to update expense", error: err.message });
	}
};
