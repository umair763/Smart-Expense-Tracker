// server/controllers/UserControllers.js
import User from "../model/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
	return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const googleSignIn = async (req, res) => {
	try {
		const { token } = req.body;
		if (!token) return res.status(400).json({ message: "Google token is required" });

		const ticket = await oauthClient.verifyIdToken({
			idToken: token,
			audience: GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		const { email, name, picture } = payload;

		const imageResponse = await axios.get(picture, { responseType: "arraybuffer" });
		const base64Image = `data:image/jpeg;base64,${Buffer.from(imageResponse.data, "binary").toString("base64")}`;

		let user = await User.findOne({ email });

		if (!user) {
			user = new User({
				name,
				email,
				image: base64Image, // Store as base64 string
				password: await bcrypt.hash("tempPassword123", 10),
			});

			await user.save();
		}

		const jwtToken = generateToken(user._id);

		res.status(200).json({
			message: "Google Sign-In successful",
			token: jwtToken,
			user: { name: user.name, email: user.email, image: base64Image },
		});
	} catch (error) {
		console.error("Google Sign-In Error:", error);
		res.status(500).json({ message: "Failed to authenticate user", error: error.message });
	}
};

// Configure multer for image uploads
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
	fileFilter: (_, file, cb) => {
		if (!file.mimetype.startsWith("image/")) {
			return cb(new Error("Invalid file type. Only image files are allowed."), false);
		}
		cb(null, true);
	},
}).single("image");

// Register a new user
export const registerUser = async (req, res) => {
	upload(req, res, async (err) => {
		if (err) {
			console.error("Error uploading file:", err.message);
			return res.status(400).json({ message: err.message });
		}

		try {
			const { name, email, password } = req.body;

			if (!name || !email || !password) {
				return res.status(400).json({ message: "Email, name, and password are required." });
			}

			const existingUser = await User.findOne({ email });
			if (existingUser) {
				return res.status(400).json({ message: "Email already in use." });
			}

			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			// Store the image as a base64 string
			let base64Image = null;
			if (req.file) {
				base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
			}

			const newUser = new User({
				name,
				email,
				password: hashedPassword,
				image: base64Image, // Store as base64 string
			});

			await newUser.save();

			const token = generateToken(newUser._id);

			return res.status(201).json({
				message: "User registered successfully.",
				token,
				user: {
					id: newUser._id,
					name: newUser.name,
					email: newUser.email,
					image: base64Image,
				},
			});
		} catch (error) {
			console.error("Registration error:", error.message);
			return res.status(500).json({ message: "Server error. Please try again." });
		}
	});
};

// Login user
export const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const token = generateToken(user._id);

		res.status(200).json({
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				image: user.image, // This will now be a base64 string if exists
			},
		});
	} catch (error) {
		console.error("Error during login:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get user profile
export const getUserProfile = async (req, res) => {
	try {
		const userId = req.userId;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				image: user.image, // This will be a base64 string if exists
			},
		});
	} catch (error) {
		console.error("Error fetching user profile:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
