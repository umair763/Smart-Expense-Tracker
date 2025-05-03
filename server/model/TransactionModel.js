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
		type: { type: String, required: true },
		amount: { type: Number, required: true },
		status: { type: String, required: true },
		discount: { type: Number, default: 0 },
		fee_charge: { type: Number, default: 0 },
		depository_institution: { type: String, required: true },
		description: { type: String, required: true },
	},
	{ timestamps: true }
);

export default mongoose.model("Transaction", TransactionSchema);
