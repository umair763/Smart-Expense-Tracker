import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/UserRoutes.js";
import expenseRoutes from "./routes/ExpenseRoutes.js";
import transactionRoutes from "./routes/TransactionRoutes.js";
import incomeRoutes from "./routes/IncomeRoutes.js";
import financeSummaryRoutes from "./routes/FinanceSummaryRoutes.js";
import expenseReportRoutes from "./routes/expenseReportRoutes.js";
import { Server } from "socket.io";
import http from "http";
import { EventEmitter } from "events";

// Create a global event emitter for database changes
export const dbEvents = new EventEmitter();

dotenv.config(); // This will load variables from your .env file

const app = express();
const server = http.createServer(app);

// Set up Socket.IO
const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173", // Match your frontend URL
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// Socket.IO connection handling
io.on("connection", (socket) => {
	console.log("Client connected:", socket.id);

	socket.on("disconnect", () => {
		console.log("Client disconnected:", socket.id);
	});
});

// Listen for database events and emit notifications
dbEvents.on("db_change", (changeData) => {
	console.log(`Database change detected:`, changeData);

	// Emit to all connected clients
	io.emit("notification", {
		type: changeData.operation,
		collection: changeData.collection,
		message: `Record ${changeData.operation} on ${changeData.collection}`,
		timestamp: new Date(),
	});
});

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
	.then(() => {
		console.log("MongoDB connected");
	})
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
app.use("/api/finance-summary", financeSummaryRoutes);
app.use("/api/reports", expenseReportRoutes);

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

console.log("/api/finance-summary routes:");
financeSummaryRoutes.stack
	.filter((r) => r.route)
	.forEach((r) => {
		if (r.route && r.route.path) {
			const methods = Object.keys(r.route.methods)
				.map((m) => m.toUpperCase())
				.join(",");
			console.log(`  ${methods} /api/finance-summary${r.route.path}`);
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
	console.error("Available routes: /api/users, /api/expenses, /api/incomes, /api/transactions, /api/finance-summary");
	console.error("Finance Summary routes:");
	financeSummaryRoutes.stack
		.filter((r) => r.route)
		.forEach((r) => {
			if (r.route && r.route.path) {
				const methods = Object.keys(r.route.methods)
					.map((m) => m.toUpperCase())
					.join(",");
				console.error(`  ${methods} /api/finance-summary${r.route.path}`);
			}
		});

	res.setHeader("Content-Type", "application/json");
	res.status(404).json({
		success: false,
		message: `Route not found: ${req.method} ${req.originalUrl}`,
		availableRoutes: [
			// Income routes
			{ method: "GET", path: "/api/incomes" },
			{ method: "POST", path: "/api/incomes" },
			{ method: "GET", path: "/api/incomes/:id" },
			{ method: "PUT", path: "/api/incomes/:id" },
			{ method: "DELETE", path: "/api/incomes/:id" },
			// Finance summary routes
			{ method: "GET", path: "/api/finance-summary" },
			{ method: "GET", path: "/api/finance-summary/test" },
			{ method: "GET", path: "/api/finance-summary/summary/:timeFilter" },
			{ method: "GET", path: "/api/finance-summary/joined" },
			{ method: "GET", path: "/api/finance-summary/aggregated" },
		],
	});
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
