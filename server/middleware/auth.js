// server/middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Ensure it matches

const authenticator = (req, res, next) => {
	// Set content type to JSON for all responses from this middleware
	res.setHeader("Content-Type", "application/json");

	try {
		const authHeader = req.headers.authorization;
		console.log("Auth header:", authHeader ? authHeader.substring(0, 20) + "..." : "none");

		if (!authHeader) {
			return res.status(403).json({
				success: false,
				message: "Access denied. No authorization header provided.",
			});
		}

		const token = authHeader.split(" ")[1]; // Extract token from the Authorization header

		if (!token) {
			return res.status(403).json({
				success: false,
				message: "Access denied. No token provided.",
			});
		}

		try {
			console.log("Verifying token with secret:", JWT_SECRET ? "Secret present" : "No secret");
			const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
			console.log("Token decoded successfully, user ID:", decoded.userId);
			req.userId = decoded.userId; // Add the userId from the token to the request
			next(); // Proceed to the next middleware/route handler
		} catch (error) {
			console.error("JWT verification error:", error.message);
			return res.status(401).json({
				success: false,
				message: "Invalid or expired token.",
				error: error.message,
			});
		}
	} catch (error) {
		console.error("Auth middleware error:", error);
		return res.status(500).json({
			success: false,
			message: "Authentication error.",
			error: error.message,
		});
	}
};

export default authenticator;
