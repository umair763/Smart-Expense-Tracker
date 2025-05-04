import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		category: {
			type: String,
			required: true,
			enum: [
				"Housing",
				"Transportation",
				"Food",
				"Healthcare",
				"PersonalCare",
				"Entertainment",
				"Education",
				"FinancialObligations",
				"Taxes",
			],
		},
		item: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		recordedDate: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Add indexes for better query performance
expenseSchema.index({ userId: 1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, recordedDate: 1 });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
