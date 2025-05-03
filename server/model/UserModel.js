import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	image: {
		type: String, // Change to String to store base64 image
		default: null,
	},
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

export default User;
