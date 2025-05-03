import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/UserRoutes.js";
import expenseRoutes from "./routes/ExpenseRoutes.js";
import transactionRoutes from "./routes/TransactionRoutes.js";
import incomeRoutes from "./routes/IncomeRoutes.js";

dotenv.config(); // This will load variables from your .env file

const app = express();

// Middleware
app.use(
	express.json({
		limit: "1mb",
		extended: true,
		verify: (req, res, buf) => {
			try {
				JSON.parse(buf);
			} catch (e) {
				res.status(400).json({ error: "Invalid JSON" });
				throw new Error("Invalid JSON");
			}
		},
	})
);
app.use(express.urlencoded({ extended: true }));

// Allow your frontend's origin
app.use(
	cors({
		origin: "http://localhost:5173", // Adjust according to your frontend URL
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

// Database Connection
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB connection error:", err));

// Add route debugging
app.use((req, res, next) => {
	console.log(`${req.method} ${req.originalUrl} - Request received`);

	// Add timing middleware
	const start = Date.now();
	res.on("finish", () => {
		const duration = Date.now() - start;
		console.log(`${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`);
	});

	next();
});

// Routes
console.log("Registering route handlers...");
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/transactions", transactionRoutes);

// Print all registered routes for debugging
console.log("=== REGISTERED ROUTES ===");
console.log("/api/incomes routes:");
incomeRoutes.stack
	.filter((r) => r.route)
	.forEach((r) => {
		if (r.route && r.route.path) {
			const methods = Object.keys(r.route.methods)
				.map((m) => m.toUpperCase())
				.join(",");
			console.log(`  ${methods} /api/incomes${r.route.path}`);
		}
	});
console.log("========================");

// Global error handler middleware
app.use((err, req, res, next) => {
	console.error("Global error:", err);

	// Set content type to ensure JSON response
	res.setHeader("Content-Type", "application/json");

	// Send JSON error response
	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal Server Error",
		error: process.env.NODE_ENV === "development" ? err.stack : undefined,
	});
});

// Handle 404 errors with JSON response
app.use((req, res) => {
	console.error(`404 ERROR: Route not found: ${req.method} ${req.originalUrl}`);

	// Log all registered routes for comparison
	console.error("Available routes: /api/users, /api/expenses, /api/incomes, /api/transactions");
	console.error("Income routes:");
	incomeRoutes.stack
		.filter((r) => r.route)
		.forEach((r) => {
			if (r.route && r.route.path) {
				const methods = Object.keys(r.route.methods)
					.map((m) => m.toUpperCase())
					.join(",");
				console.error(`  ${methods} /api/incomes${r.route.path}`);
			}
		});

	res.setHeader("Content-Type", "application/json");
	res.status(404).json({
		success: false,
		message: `Route not found: ${req.method} ${req.originalUrl}`,
		availableRoutes: [
			{ method: "GET", path: "/api/incomes" },
			{ method: "POST", path: "/api/incomes" },
			{ method: "GET", path: "/api/incomes/:id" },
			{ method: "PUT", path: "/api/incomes/:id" },
			{ method: "DELETE", path: "/api/incomes/:id" },
		],
	});
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
