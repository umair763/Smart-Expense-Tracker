import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		id: { type: String, required: true },
		date: { type: String, required: true },
		time: { type: String, required: true },
		amount: { type: Number, required: true },
		status: { type: String, required: true },
		discount: { type: Number, default: 0 },
		fee_charge: { type: Number, default: 0 },
		depository_institution: { type: String, required: true },
		description: { type: String, required: true },
	},
	{ timestamps: true }
);

// Add indexes for better query performance
TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, status: 1 });

const Transaction = mongoose.model("Transaction", TransactionSchema);

export default Transaction;
