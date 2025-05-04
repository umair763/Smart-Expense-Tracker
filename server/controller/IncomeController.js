import Income from "../model/IncomeModel.js";
import mongoose from "mongoose";
import { dbEvents } from "../index.js";

// Add new income
export const addIncome = async (req, res) => {
	try {
		// Log the incoming request for debugging
		console.log("Income add request received:", {
			body: req.body,
			userId: req.userId,
			headers: req.headers,
		});

		// Extract the income details from the request body
		const { category, amount, description, date, time, id } = req.body;

		// Get userId from the decoded JWT token
		const userId = req.userId; // From the authenticator middleware

		// Validate the required fields with detailed error messages
		const missingFields = [];
		if (!category) missingFields.push("category");
		if (!amount) missingFields.push("amount");
		if (!description) missingFields.push("description");
		if (!date) missingFields.push("date");
		if (!time) missingFields.push("time");
		if (!id) missingFields.push("id");

		if (missingFields.length > 0) {
			return res.status(400).json({
				message: "Missing required fields",
				missingFields,
				receivedFields: Object.keys(req.body),
			});
		}

		// Additional validation for amount
		const parsedAmount = parseFloat(amount);
		if (isNaN(parsedAmount) || parsedAmount <= 0) {
			return res.status(400).json({ message: "Amount must be a positive number" });
		}

		// Create the new income
		const newIncome = new Income({
			category,
			amount: parsedAmount,
			description,
			date,
			time,
			id,
			userId: new mongoose.Types.ObjectId(userId), // Ensure userId is a valid ObjectId
		});

		// Validate the income model
		const validationError = newIncome.validateSync();
		if (validationError) {
			return res.status(400).json({
				message: "Validation failed",
				errors: validationError.errors,
			});
		}

		// Save the income to the database
		await newIncome.save();

		// Emit event for the notification system : Trigger
		dbEvents.emit("db_change", {
			operation: "insert",
			collection: "incomes",
			documentId: newIncome._id,
		});

		// Return a success response
		return res.status(201).json({ message: "Income added successfully.", income: newIncome });
	} catch (error) {
		console.error("Error adding income:", error);
		// Ensure we always return JSON
		return res.status(500).json({
			message: "Error adding income.",
			error: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	}
};

// Get all incomes for a user
export const getIncomes = async (req, res) => {
	try {
		// Add debugging log to see what's being used for userId
		console.log("Fetching incomes with userId:", req.userId);

		// Ensure userId is a valid ObjectId
		const userObjectId = new mongoose.Types.ObjectId(req.userId);

		// Find incomes for this user
		const incomes = await Income.find({ userId: userObjectId });

		// Log the found incomes
		console.log(`Found ${incomes.length} income records`);

		res.json({ incomes });
	} catch (err) {
		console.error("Error fetching incomes:", err);
		res.status(500).json({ message: "Failed to fetch incomes", error: err.message });
	}
};

// Get a specific income
export const getIncomeById = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.userId;

		// Ensure userId is a valid ObjectId
		const userObjectId = new mongoose.Types.ObjectId(userId);

		const income = await Income.findOne({ _id: id, userId: userObjectId });

		if (!income) {
			return res.status(404).json({ message: "Income not found" });
		}

		res.status(200).json({ income });
	} catch (error) {
		console.error("Error fetching income:", error);
		res.status(500).json({ error: "Failed to fetch income", message: error.message });
	}
};

// Delete income
export const deleteIncome = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.userId;

		// Ensure userId is a valid ObjectId
		const userObjectId = new mongoose.Types.ObjectId(userId);

		const income = await Income.findOne({ _id: id, userId: userObjectId });

		if (!income) {
			return res.status(404).json({ message: "Income not found" });
		}

		// Delete the income
		await Income.findByIdAndDelete(id);

		// Emit event for the notification system : Trigger
		dbEvents.emit("db_change", {
			operation: "delete",
			collection: "incomes",
			documentId: id,
		});

		res.json({ message: "Income deleted successfully" });
	} catch (err) {
		console.error("Error deleting income:", err);
		res.status(500).json({ message: "Failed to delete income", error: err.message });
	}
};

// Get income statistics
export const getIncomeStats = async (req, res) => {
	try {
		const userId = req.userId;
		const userObjectId = new mongoose.Types.ObjectId(userId);

		// Total income amount
		const totalIncome = await Income.aggregate([
			{ $match: { userId: userObjectId } },
			{ $group: { _id: null, total: { $sum: "$amount" } } },
		]);

		// Income by category
		const incomeByCategory = await Income.aggregate([
			{ $match: { userId: userObjectId } },
			{ $group: { _id: "$category", total: { $sum: "$amount" } } },
			{ $sort: { total: -1 } },
		]);

		// Recent income (last 7 days)
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

		const recentIncome = await Income.find({
			userId: userObjectId,
			date: { $gte: sevenDaysAgoStr },
		}).sort({ date: -1, time: -1 });

		res.json({
			totalIncome: totalIncome.length > 0 ? totalIncome[0].total : 0,
			incomeByCategory,
			recentIncome,
		});
	} catch (error) {
		console.error("Error fetching income statistics:", error);
		res.status(500).json({ message: "Failed to fetch income statistics", error: error.message });
	}
};

// Update income
export const updateIncome = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.userId;
		const updateData = req.body;

		console.log("Updating income:", id, "for userId:", userId);
		console.log("Update data:", JSON.stringify(updateData));
		console.log("Request params:", req.params);
		console.log("Request path:", req.path);
		console.log("Full URL:", req.originalUrl);

		// Find the income and verify it belongs to the user
		const income = await Income.findOne({ _id: id, userId });

		console.log("Found income to update:", income);

		if (!income) {
			return res.status(404).json({ message: "Income not found or you don't have permission to update it" });
		}

		// Validate the required fields
		const missingFields = [];
		if (!updateData.category) missingFields.push("category");
		if (!updateData.amount) missingFields.push("amount");
		if (!updateData.description) missingFields.push("description");
		if (!updateData.date) missingFields.push("date");
		if (!updateData.time) missingFields.push("time");
		if (!updateData.id) missingFields.push("id");

		if (missingFields.length > 0) {
			return res.status(400).json({
				message: "Missing required fields",
				missingFields,
				receivedFields: Object.keys(updateData),
			});
		}

		// Validate category is one of the allowed values
		const validCategories = [
			"Salary",
			"Freelance",
			"Business",
			"Investments",
			"Dividends",
			"Rental",
			"YouTube",
			"Trading",
			"Interest",
			"Royalties",
			"Commission",
			"Consulting",
			"Gifts",
			"Others",
		];

		if (!validCategories.includes(updateData.category)) {
			return res.status(400).json({
				message: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
				validCategories,
			});
		}

		// Validate amount is a positive number
		const parsedAmount = parseFloat(updateData.amount);
		if (isNaN(parsedAmount) || parsedAmount <= 0) {
			return res.status(400).json({ message: "Amount must be a positive number" });
		}

		// Ensure amount is a number in the update data
		updateData.amount = parsedAmount;

		// Update the income
		const updatedIncome = await Income.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		});

		// Emit event for the notification system : Trigger
		dbEvents.emit("db_change", {
			operation: "update",
			collection: "incomes",
			documentId: id,
		});

		console.log("Income updated successfully");
		res.json({
			message: "Income updated successfully",
			income: updatedIncome,
		});
	} catch (err) {
		console.error("Error updating income:", err);
		res.status(500).json({ message: "Failed to update income", error: err.message });
	}
};
