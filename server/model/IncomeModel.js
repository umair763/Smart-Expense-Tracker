import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
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
			],
		},
		amount: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		date: {
			type: String,
			required: true,
		},
		time: {
			type: String,
			required: true,
		},
		id: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Income = mongoose.model("Income", incomeSchema);

export default Income;
