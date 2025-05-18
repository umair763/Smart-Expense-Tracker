// /backend/scripts/seedData.js
import axios from "axios";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { format } from "date-fns";

dotenv.config();

// Configuration
const CONFIG = {
	BASE_URL: "http://localhost:5000",
	USER_ID: "68234777624dafa64bfc89a7",
	JWT_TOKEN:
		" Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODIzNDc3NzYyNGRhZmE2NGJmYzg5YTciLCJpYXQiOjE3NDc1NTE4MDEsImV4cCI6MTc0ODE1NjYwMX0.EHjY3JgEUTQo0zhgIAvErMaZigzYdczhnavDw05fUlw",
	START_DATE: new Date("2024-12-01"),
	END_DATE: new Date("2025-05-30"),
	EXPENSE_COUNT: 500,
	TRANSACTION_COUNT: 500,
	INCOME_COUNT: {
		MIN: 60,
		MAX: 80,
	},
};

// Setup axios with authentication header
const api = axios.create({
	baseURL: CONFIG.BASE_URL,
	headers: {
		"Content-Type": "application/json",
		Authorization: CONFIG.JWT_TOKEN,
	},
});

// Utility function to generate random date between start and end dates
const getRandomDate = (start, end) => {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Format date to YYYY-MM-DD
const formatDate = (date) => {
	return format(date, "yyyy-MM-dd");
};

// Format time to HH:MM
const formatTime = (date) => {
	return format(date, "HH:mm");
};

// Generate a random amount within a range
const getRandomAmount = (min, max, decimals = 2) => {
	const amount = Math.random() * (max - min) + min;
	return parseFloat(amount.toFixed(decimals));
};

// Generate all months in the range
const generateMonthsInRange = () => {
	const months = [];
	let currentDate = new Date(CONFIG.START_DATE);

	while (currentDate <= CONFIG.END_DATE) {
		months.push(new Date(currentDate));
		currentDate.setMonth(currentDate.getMonth() + 1);
	}

	return months;
};

// EXPENSE DATA GENERATION
const generateExpenses = async () => {
	console.log(`\n🔹 Generating ${CONFIG.EXPENSE_COUNT} expense records...`);

	const expenseCategories = [
		"Housing",
		"Transportation",
		"Food",
		"Healthcare",
		"PersonalCare",
		"Entertainment",
		"Education",
		"FinancialObligations",
		"Taxes",
	];

	// Category-specific items and amount ranges
	const categoryItems = {
		Housing: {
			items: [
				"Rent or Mortgage",
				"Property Taxes",
				"Homeowners Insurance",
				"Renters Insurance",
				"Utilities",
				"Home Maintenance and Repairs",
			],
			minAmount: 1000,
			maxAmount: 3000,
		},
		Transportation: {
			items: [
				"Vehicle Payments",
				"Fuel",
				"Vehicle Insurance",
				"Public Transportation",
				"Vehicle Maintenance and Repairs",
				"Parking Fees",
			],
			minAmount: 250,
			maxAmount: 1200,
		},
		Food: {
			items: ["Groceries", "Dining Out"],
			minAmount: 500,
			maxAmount: 20000,
		},
		Healthcare: {
			items: [
				"Health Insurance Premiums",
				"Doctor Visits and Medical Tests",
				"Prescription Medications",
				"Dental Care",
				"Vision Care",
			],
			minAmount: 500,
			maxAmount: 1500,
		},
		PersonalCare: {
			items: ["Haircuts and Styling", "Personal Care Products", "Clothing and Footwear"],
			minAmount: 1000,
			maxAmount: 3000,
		},
		Entertainment: {
			items: ["Streaming Services", "Cable or Satellite TV", "Hobbies and Interests", "Movies and Theater"],
			minAmount: 500,
			maxAmount: 1000,
		},
		Education: {
			items: ["Tuition Fees", "Books and Supplies", "Student Loans"],
			minAmount: 2000,
			maxAmount: 100000,
		},
		FinancialObligations: {
			items: ["Credit Card Payments", "Loans", "Savings", "Retirement Savings"],
			minAmount: 500,
			maxAmount: 15000,
		},
		Taxes: {
			items: ["Income Taxes", "Property Taxes", "Sales Tax"],
			minAmount: 1000,
			maxAmount: 20000,
		},
	};

	const expensePromises = [];

	for (let i = 0; i < CONFIG.EXPENSE_COUNT; i++) {
		const randomDate = getRandomDate(CONFIG.START_DATE, CONFIG.END_DATE);
		const category = faker.helpers.arrayElement(expenseCategories);
		const categoryData = categoryItems[category];

		const expense = {
			userId: CONFIG.USER_ID,
			category: category,
			item: faker.helpers.arrayElement(categoryData.items),
			amount: getRandomAmount(categoryData.minAmount, categoryData.maxAmount),
			recordedDate: formatDate(randomDate),
		};

		// Post to expenses API with delay to prevent API rate limiting
		const promise = new Promise((resolve) => {
			setTimeout(() => {
				api.post("/api/expenses", expense)
					.then((response) => {
						if (i % 50 === 0) {
							console.log(`✅ Created ${i} expenses so far...`);
						}
						resolve(response.data);
					})
					.catch((error) => {
						console.error(`Error creating expense ${i}:`, error.message);
						if (error.response) {
							console.error(error.response.data);
						}
						resolve(null);
					});
			}, i * 20); // 20ms delay between requests
		});

		expensePromises.push(promise);
	}

	await Promise.all(expensePromises);
	console.log(`✅ Successfully generated ${CONFIG.EXPENSE_COUNT} expense records`);
};

// TRANSACTION DATA GENERATION
const generateTransactions = async () => {
	console.log(`\n🔹 Generating ${CONFIG.TRANSACTION_COUNT} transaction records...`);

	const statuses = ["Successful", "Failed"];
	const depositories = [
		"Interbanking",
		"Habib-Bank",
		"United-Bank",
		"MCB-Bank",
		"Allied-Bank",
		"Askari-Bank",
		"Meezan-Bank",
		"Bank-Alfalah",
		"Faysal-Bank",
		"Cash-Transaction",
		"Credit-Card",
		"Digital-Wallet",
	];

	const transactionDescriptions = [
		"Online Purchase",
		"Grocery Shopping",
		"Bill Payment",
		"Subscription Renewal",
		"Restaurant Payment",
		"ATM Withdrawal",
		"Transfer to Savings",
		"Mobile Payment",
		"Travel Booking",
		"Insurance Premium",
		"Utility Bill",
		"Retail Purchase",
		"Gas Station",
		"Healthcare Payment",
		"Digital Service",
		"Electronics Purchase",
		"Home Improvement",
		"Membership Fee",
		"Donation",
		"Education Payment",
	];

	const transactionPromises = [];

	// Distribute transactions evenly across each month
	const monthlyCount = Math.floor(CONFIG.TRANSACTION_COUNT / 6);
	const months = generateMonthsInRange();

	let completedCount = 0;

	for (const month of months) {
		const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
		let transactions = monthlyCount;

		// Adjust for partial months (May 2025)
		if (month.getMonth() === 4 && month.getFullYear() === 2025) {
			transactions = Math.floor(transactions * (15 / daysInMonth));
		}

		for (let i = 0; i < transactions; i++) {
			// Distribute transactions throughout the month
			const day = Math.floor(Math.random() * daysInMonth) + 1;
			const date = new Date(month.getFullYear(), month.getMonth(), day);

			// Keep transaction date within range
			if (date < CONFIG.START_DATE || date > CONFIG.END_DATE) continue;

			const randomTime = new Date(date);
			randomTime.setHours(Math.floor(Math.random() * 24));
			randomTime.setMinutes(Math.floor(Math.random() * 60));

			const status = faker.helpers.arrayElement(statuses);
			// Failed transactions tend to have lower amounts
			const maxAmount = status === "Failed" ? 500 : 2000;

			const transaction = {
				userId: CONFIG.USER_ID,
				id: uuidv4(),
				date: formatDate(date),
				time: formatTime(randomTime),
				amount: getRandomAmount(10, maxAmount),
				status: status,
				discount: Math.random() > 0.7 ? getRandomAmount(1, 50) : 0, // 30% chance of discount
				fee_charge: Math.random() > 0.8 ? getRandomAmount(1, 20) : 0, // 20% chance of fee
				depository_institution: faker.helpers.arrayElement(depositories),
				description: faker.helpers.arrayElement(transactionDescriptions),
			};

			const promise = new Promise((resolve) => {
				setTimeout(() => {
					api.post("/api/transactions", transaction)
						.then((response) => {
							completedCount++;
							if (completedCount % 50 === 0) {
								console.log(`✅ Created ${completedCount} transactions so far...`);
							}
							resolve(response.data);
						})
						.catch((error) => {
							console.error(`Error creating transaction:`, error.message);
							if (error.response) {
								console.error(error.response.data);
							}
							resolve(null);
						});
				}, i * 20); // 20ms delay between requests
			});

			transactionPromises.push(promise);
		}
	}

	await Promise.all(transactionPromises);
	console.log(`✅ Successfully generated ${completedCount} transaction records`);
};

// INCOME DATA GENERATION
const generateIncomes = async () => {
	// Determine total number of income records
	const totalIncomeCount = faker.number.int({
		min: CONFIG.INCOME_COUNT.MIN,
		max: CONFIG.INCOME_COUNT.MAX,
	});

	console.log(`\n🔹 Generating ${totalIncomeCount} income records...`);

	const incomeCategories = [
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
	];

	// Monthly recurring categories and their typical amounts
	const monthlyRecurring = {
		Salary: {
			minAmount: 60000,
			maxAmount: 80000,
			description: ["Monthly Salary", "Base Pay", "Bonus"],
		},
		Investments: {
			minAmount: 100000,
			maxAmount: 200000,
			description: ["Stock Dividend", "ETF Returns", "Investment Income"],
		},
		Rental: {
			minAmount: 1000,
			maxAmount: 3000,
			description: ["Property Rental", "Apartment Lease", "House Rental Income"],
		},
		Trading: {
			minAmount: 20000,
			maxAmount: 70000,
			description: ["Day Trading Profits", "Crypto Trading Income", "Stock Market Gains"],
		},
	};

	// Variables for freelance/irregular income
	const freelanceData = {
		minAmount: 20000,
		maxAmount: 70000,
		description: [
			"Web Development",
			"Graphic Design",
			"Content Writing",
			"Consulting Work",
			"Programming Project",
			"UI/UX Design",
			"Data Analysis",
			"Video Editing",
			"Translation Work",
		],
		monthlyOccurrences: { min: 1, max: 3 },
	};

	// Other irregular income categories
	const otherIrregular = {
		YouTube: {
			minAmount: 5000,
			maxAmount: 8000,
			description: ["Ad Revenue", "Sponsorship", "Channel Income"],
			probability: 0.4,
		},
		Commission: {
			minAmount: 2000,
			maxAmount: 15000,
			description: ["Sales Commission", "Referral Bonus", "Performance Bonus"],
			probability: 0.3,
		},
		Trading: {
			minAmount: 1000,
			maxAmount: 30000,
			description: ["Stock Trade", "Crypto Sale", "Market Trading"],
			probability: 0.5,
		},
		Gifts: {
			minAmount: 500,
			maxAmount: 5000,
			description: ["Birthday Gift", "Holiday Present", "Cash Gift"],
			probability: 0.2,
		},
		Royalties: {
			minAmount: 2000,
			maxAmount: 70000,
			description: ["Book Royalties", "Music Royalties", "License Income"],
			probability: 0.3,
		},
	};

	const incomePromises = [];
	let incomeCount = 0;

	// Generate monthly recurring incomes (salary, investments, etc.)
	const months = generateMonthsInRange();

	for (const month of months) {
		// For each month, add regular monthly incomes
		for (const category of Object.keys(monthlyRecurring)) {
			// Only include if month is fully within range
			if (month < CONFIG.START_DATE || month > CONFIG.END_DATE) continue;

			const data = monthlyRecurring[category];
			const day = category === "Salary" ? faker.number.int({ min: 1, max: 5 }) : faker.number.int({ min: 1, max: 28 });
			const date = new Date(month.getFullYear(), month.getMonth(), day);

			// Skip if the specific day falls outside our date range
			if (date < CONFIG.START_DATE || date > CONFIG.END_DATE) continue;

			const randomTime = new Date(date);
			randomTime.setHours(faker.number.int({ min: 9, max: 17 }));
			randomTime.setMinutes(faker.number.int({ min: 0, max: 59 }));

			const income = {
				userId: CONFIG.USER_ID,
				category: category,
				amount: getRandomAmount(data.minAmount, data.maxAmount),
				description: faker.helpers.arrayElement(data.description),
				date: formatDate(date),
				time: formatTime(randomTime),
				id: uuidv4(),
			};

			const promise = new Promise((resolve) => {
				setTimeout(() => {
					api.post("/api/incomes", income)
						.then((response) => {
							incomeCount++;
							console.log(`✅ Created income: ${category} - $${income.amount.toFixed(2)}`);
							resolve(response.data);
						})
						.catch((error) => {
							console.error(`Error creating income:`, error.message);
							if (error.response) {
								console.error(error.response.data);
							}
							resolve(null);
						});
				}, incomeCount * 100); // 100ms delay between income records
			});

			incomePromises.push(promise);
		}

		// Freelance entries (1-3 per month)
		const freelanceEntries = faker.number.int(freelanceData.monthlyOccurrences);
		for (let i = 0; i < freelanceEntries; i++) {
			const day = faker.number.int({ min: 1, max: 28 });
			const date = new Date(month.getFullYear(), month.getMonth(), day);

			// Skip if the specific day falls outside our date range
			if (date < CONFIG.START_DATE || date > CONFIG.END_DATE) continue;

			const randomTime = new Date(date);
			randomTime.setHours(faker.number.int({ min: 9, max: 21 }));
			randomTime.setMinutes(faker.number.int({ min: 0, max: 59 }));

			const income = {
				userId: CONFIG.USER_ID,
				category: "Freelance",
				amount: getRandomAmount(freelanceData.minAmount, freelanceData.maxAmount),
				description: faker.helpers.arrayElement(freelanceData.description),
				date: formatDate(date),
				time: formatTime(randomTime),
				id: uuidv4(),
			};

			const promise = new Promise((resolve) => {
				setTimeout(() => {
					api.post("/api/incomes", income)
						.then((response) => {
							incomeCount++;
							console.log(`✅ Created income: Freelance - $${income.amount.toFixed(2)}`);
							resolve(response.data);
						})
						.catch((error) => {
							console.error(`Error creating income:`, error.message);
							if (error.response) {
								console.error(error.response.data);
							}
							resolve(null);
						});
				}, incomeCount * 100); // 100ms delay
			});

			incomePromises.push(promise);
		}

		// Other irregular incomes
		for (const category of Object.keys(otherIrregular)) {
			const data = otherIrregular[category];

			// Use probability to determine if this income happens this month
			if (Math.random() <= data.probability) {
				const day = faker.number.int({ min: 1, max: 28 });
				const date = new Date(month.getFullYear(), month.getMonth(), day);

				// Skip if the specific day falls outside our date range
				if (date < CONFIG.START_DATE || date > CONFIG.END_DATE) continue;

				const randomTime = new Date(date);
				randomTime.setHours(faker.number.int({ min: 9, max: 21 }));
				randomTime.setMinutes(faker.number.int({ min: 0, max: 59 }));

				const income = {
					userId: CONFIG.USER_ID,
					category: category,
					amount: getRandomAmount(data.minAmount, data.maxAmount),
					description: faker.helpers.arrayElement(data.description),
					date: formatDate(date),
					time: formatTime(randomTime),
					id: uuidv4(),
				};

				const promise = new Promise((resolve) => {
					setTimeout(() => {
						api.post("/api/incomes", income)
							.then((response) => {
								incomeCount++;
								console.log(`✅ Created income: ${category} - $${income.amount.toFixed(2)}`);
								resolve(response.data);
							})
							.catch((error) => {
								console.error(`Error creating income:`, error.message);
								if (error.response) {
									console.error(error.response.data);
								}
								resolve(null);
							});
					}, incomeCount * 100); // 100ms delay
				});

				incomePromises.push(promise);
			}
		}
	}

	await Promise.all(incomePromises);
	console.log(`✅ Successfully generated ${incomeCount} income records`);
};

// Main function to orchestrate data generation
const seedData = async () => {
	console.log("🚀 Starting data seeding process...");
	console.log(`📅 Date Range: ${CONFIG.START_DATE.toDateString()} to ${CONFIG.END_DATE.toDateString()}`);
	console.log(`👤 User ID: ${CONFIG.USER_ID}`);

	try {
		// Generate data in sequence to avoid overwhelming the API
		await generateExpenses();
		await generateTransactions();
		await generateIncomes();

		console.log("\n✨ Data seeding complete!");
		console.log("Summary:");
		console.log(`- ${CONFIG.EXPENSE_COUNT} expense records`);
		console.log(`- ${CONFIG.TRANSACTION_COUNT} transaction records`);
		console.log(`- Between ${CONFIG.INCOME_COUNT.MIN}-${CONFIG.INCOME_COUNT.MAX} income records`);
	} catch (error) {
		console.error("❌ Error during data seeding:", error.message);
		if (error.response) {
			console.error("API response error:", error.response.data);
		}
	}
};

// Run the seeding process
seedData();
