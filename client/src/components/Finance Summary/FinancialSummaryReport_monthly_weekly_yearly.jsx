import { useState, useEffect } from 'react';

function FinancialSummaryReport_monthly_weekly_yearly({ timeFilter, summaryData }) {
   const [summaryStats, setSummaryStats] = useState({
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      topExpenseCategories: [],
      topIncomeCategories: [],
      transactionsByStatus: {},
   });

   useEffect(() => {
      if (!summaryData) return;

      const { expenses = [], income = [], transactions = [] } = summaryData;

      // Calculate totals
      const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
      const netBalance = totalIncome - totalExpenses;

      // Group expenses by category
      const expensesByCategory = expenses.reduce((acc, expense) => {
         if (!acc[expense.category]) {
            acc[expense.category] = 0;
         }
         acc[expense.category] += expense.amount;
         return acc;
      }, {});

      // Group income by category
      const incomeByCategory = income.reduce((acc, inc) => {
         if (!acc[inc.category]) {
            acc[inc.category] = 0;
         }
         acc[inc.category] += inc.amount;
         return acc;
      }, {});

      // Group transactions by status
      const transactionsByStatus = transactions.reduce((acc, transaction) => {
         if (!acc[transaction.status]) {
            acc[transaction.status] = 0;
         }
         acc[transaction.status] += transaction.amount;
         return acc;
      }, {});

      // Sort categories by amount and get top 3
      const topExpenseCategories = Object.entries(expensesByCategory)
         .sort((a, b) => b[1] - a[1])
         .slice(0, 3)
         .map(([category, amount]) => ({ category, amount }));

      const topIncomeCategories = Object.entries(incomeByCategory)
         .sort((a, b) => b[1] - a[1])
         .slice(0, 3)
         .map(([category, amount]) => ({ category, amount }));

      // Update state
      setSummaryStats({
         totalIncome,
         totalExpenses,
         netBalance,
         topExpenseCategories,
         topIncomeCategories,
         transactionsByStatus,
      });
   }, [summaryData]);

   if (!summaryData) {
      return (
         <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-4">Financial Summary Report</h2>
            <p>No data available</p>
         </div>
      );
   }

   return (
      <div className="p-4">
         <h2 className="text-xl font-semibold mb-4">Financial Summary Report</h2>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
               <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Income</h3>
               <p className="text-2xl font-bold text-green-500">${summaryStats.totalIncome.toFixed(2)}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
               <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Expenses</h3>
               <p className="text-2xl font-bold text-red-500">${summaryStats.totalExpenses.toFixed(2)}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
               <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Net Balance</h3>
               <p className={`text-2xl font-bold ${summaryStats.netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${Math.abs(summaryStats.netBalance).toFixed(2)}
                  {summaryStats.netBalance >= 0 ? ' Saved' : ' Overspent'}
               </p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Expense Categories */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
               <h3 className="text-md font-medium mb-3">Top Expense Categories</h3>
               {summaryStats.topExpenseCategories.length > 0 ? (
                  <ul className="space-y-3">
                     {summaryStats.topExpenseCategories.map((item, index) => (
                        <li key={index} className="flex justify-between items-center">
                           <span className="text-gray-600 dark:text-gray-300">{item.category}</span>
                           <span className="font-medium text-red-500">${item.amount.toFixed(2)}</span>
                        </li>
                     ))}
                  </ul>
               ) : (
                  <p className="text-gray-500 dark:text-gray-400">No expense data available</p>
               )}
            </div>

            {/* Top Income Categories */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
               <h3 className="text-md font-medium mb-3">Top Income Categories</h3>
               {summaryStats.topIncomeCategories.length > 0 ? (
                  <ul className="space-y-3">
                     {summaryStats.topIncomeCategories.map((item, index) => (
                        <li key={index} className="flex justify-between items-center">
                           <span className="text-gray-600 dark:text-gray-300">{item.category}</span>
                           <span className="font-medium text-green-500">${item.amount.toFixed(2)}</span>
                        </li>
                     ))}
                  </ul>
               ) : (
                  <p className="text-gray-500 dark:text-gray-400">No income data available</p>
               )}
            </div>
         </div>

         {/* Transaction Status Summary */}
         {Object.keys(summaryStats.transactionsByStatus).length > 0 && (
            <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
               <h3 className="text-md font-medium mb-3">Transactions by Status</h3>
               <ul className="space-y-3">
                  {Object.entries(summaryStats.transactionsByStatus).map(([status, amount], index) => (
                     <li key={index} className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">{status}</span>
                        <span className="font-medium text-blue-500">${amount.toFixed(2)}</span>
                     </li>
                  ))}
               </ul>
            </div>
         )}
      </div>
   );
}

export default FinancialSummaryReport_monthly_weekly_yearly;
