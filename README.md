# Smart Expense Tracker

A comprehensive financial management application that helps users track income, expenses, and monitor their financial activities with detailed visualizations and reports.

![Smart Expense Tracker](/Images/banner.png)

## 🚀 Features

-  **Dashboard Overview**: Get a quick snapshot of your financial status with available balance, income, expenses, and trends
-  **Income Management**: Record and categorize all income sources
-  **Expense Tracking**: Easily log expenses with custom categories
-  **Transaction History**: View all financial transactions in a comprehensive list
-  **Visual Reports**: Analyze your financial data through interactive charts and graphs
-  **Responsive Design**: Fully functional across desktop and mobile devices
-  **Secure Authentication**: User accounts with Google sign-in integration
-  **Dark/Light Theme**: Toggle between dark and light modes for comfortable viewing

## 🛠️ Technology Stack

### Frontend

-  **React.js**: UI library for building the user interface
-  **Vite**: Next-generation frontend tooling for faster development
-  **Tailwind CSS**: Utility-first CSS framework for styling
-  **Chart.js/Recharts**: Libraries for data visualization
-  **React Router**: For navigation and routing
-  **React Icons**: For UI icons

### Backend

-  **Node.js**: JavaScript runtime for the server
-  **Express.js**: Web framework for building the API
-  **MongoDB**: NoSQL database for data storage
-  **Mongoose**: MongoDB object modeling for Node.js
-  **JWT**: JSON Web Tokens for authentication
-  **Bcrypt**: For password hashing and security

## 🔧 Installation and Setup

### Prerequisites

-  Node.js (v14+)
-  MongoDB instance
-  Google OAuth credentials (for Google sign-in)

### Setup Instructions

1. **Clone the repository**

   ```
   git clone https://github.com/yourusername/Smart-Expense-Tracker.git
   cd Smart-Expense-Tracker
   ```

2. **Set up the backend**

   ```
   cd server
   npm install
   ```

   Create a `.env` file in the server directory with:

   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

3. **Set up the frontend**

   ```
   cd ../client
   npm install
   ```

   Create a `.env` file in the client directory with:

   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Run the application**

   Start the backend:

   ```
   cd server
   npm run dev
   ```

   Start the frontend:

   ```
   cd client
   npm run dev
   ```

5. **Access the application**

   Open your browser and navigate to: `http://localhost:5173`

## 📊 How It Works

1. **User Authentication**: Create an account or log in with Google
2. **Dashboard**: View your financial overview and summaries
3. **Add Income/Expenses**: Record your financial transactions with categories
4. **View Reports**: Analyze your spending patterns and income sources
5. **Manage Budget**: Set budget goals and track your progress

## 🎯 Target Audience

-  **Individuals** seeking to manage personal finances
-  **Students** tracking their expenses and budget
-  **Freelancers** monitoring income and business expenses
-  **Households** managing family budgets
-  **Small business owners** keeping track of business finances

## 🌟 Problem It Solves

-  **Financial Awareness**: Helps users understand where their money goes
-  **Budget Management**: Enables setting and tracking financial goals
-  **Spending Analysis**: Identifies spending patterns and potential savings
-  **Financial Decision Making**: Provides data-driven insights for better financial decisions
-  **Income Tracking**: Keeps all income sources organized in one place

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<!-- ## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details. -->

## 📞 Contact

If you have any questions or suggestions, please feel free to reach out!

---

<!-- Happy Expense Tracking! 💰📊 -->
