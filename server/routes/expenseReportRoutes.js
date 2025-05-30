import express from "express";
import { generateExpenseCsv } from "../controller/expenseReportController.js";
import { generateIncomeCsv } from "../controller/incomeReportController.js";
import { generateTransactionCsv } from "../controller/TransactionController.js";
import authenticator from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/reports/expenses/csv
// @desc    Generate and download expense report as CSV
// @access  Private
router.get('/expenses/csv', authenticator, generateExpenseCsv);

// @route   GET /api/reports/incomes/csv
// @desc    Generate and download income report as CSV
// @access  Private
router.get("/incomes/csv", authenticator, generateIncomeCsv);

// @route   GET /api/reports/transactions/csv
// @desc    Generate and download transaction report as CSV
// @access  Private
router.get("/transactions/csv", authenticator, generateTransactionCsv);

export default router;
