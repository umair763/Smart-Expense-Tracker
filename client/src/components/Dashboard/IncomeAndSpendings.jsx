import React, { useState, useEffect } from 'react';
import axios from 'axios';

function IncomeAndSpendings() {
   const [incomeTotal, setIncomeTotal] = useState(0);
   const [expenseTotal, setExpenseTotal] = useState(0);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            console.log('Fetching income and expense data...');

            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
               console.error('No authentication token found');
               setError('Authentication required. Please log in.');
               setLoading(false);
               return;
            }

            // Get income stats for total income
            const incomeResponse = await axios.get('http://localhost:5000/api/incomes/stats', {
               headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Income stats response:', incomeResponse.data);

            // Get all expenses to calculate total expenses
            const expenseResponse = await axios.get('http://localhost:5000/api/expenses', {
               headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Expense response:', expenseResponse.data);

            // Handle possible different data structures
            let totalIncome = 0;
            if (incomeResponse.data && typeof incomeResponse.data.totalIncome === 'number') {
               totalIncome = incomeResponse.data.totalIncome;
            } else if (incomeResponse.data && incomeResponse.data.incomes) {
               // Sum up incomes if returned as array
               totalIncome = incomeResponse.data.incomes.reduce((sum, income) => sum + income.amount, 0);
            }

            let totalExpenses = 0;
            if (expenseResponse.data && Array.isArray(expenseResponse.data)) {
               totalExpenses = expenseResponse.data.reduce((sum, expense) => sum + expense.amount, 0);
            }

            console.log(`Calculated: Income ${totalIncome}, Expenses ${totalExpenses}`);

            // Set the total income and expenses
            setIncomeTotal(totalIncome);
            setExpenseTotal(totalExpenses);

            setLoading(false);
         } catch (err) {
            console.error('Error fetching income/expense data:', err);
            let errorMessage = 'Failed to load income and expense information';

            if (err.response) {
               // The request was made and the server responded with a status code
               console.error('Response data:', err.response.data);
               console.error('Response status:', err.response.status);

               if (err.response.status === 401 || err.response.status === 403) {
                  errorMessage = 'Authentication error. Please log in again.';
               } else {
                  errorMessage = `Server error: ${err.response.data.message || 'Unknown error'}`;
               }
            } else if (err.request) {
               // The request was made but no response was received
               errorMessage = 'No response from server. Please check your connection.';
            }

            setError(errorMessage);
            setLoading(false);
         }
      };

      fetchData();
   }, []);

   // Format number with commas for thousands
   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
         minimumFractionDigits: 0,
      }).format(amount);
   };

   return (
      <div className="flex flex-row items-stretch w-full gap-5 h-full">
         {/* Income Card */}
         <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700 w-full p-4">
            <div className="flex items-center mb-3">
               {/* Wavy Line for Income */}
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="green"
                  className="w-5 h-5"
               >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c1.5-4 4.5-4 6 0s4.5 4 6 0 4.5-4 6-0" />
               </svg>
               <span className="ml-2 text-base font-medium text-gray-700 dark:text-gray-300">Income</span>
            </div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
               {loading ? 'Loading...' : error ? 'Error' : formatCurrency(incomeTotal)}
            </div>
         </div>

         {/* Spending Card */}
         <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700 w-full p-4">
            <div className="flex items-center mb-3">
               {/* Wavy Line for Spending */}
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="red"
                  className="w-5 h-5"
               >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c1.5-4 4.5-4 6 0s4.5 4 6 0 4.5-4 6-0" />
               </svg>
               <span className="ml-2 text-base font-medium text-gray-700 dark:text-gray-300">Spendings</span>
            </div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
               {loading ? 'Loading...' : error ? 'Error' : formatCurrency(expenseTotal)}
            </div>
         </div>
      </div>
   );
}

export default IncomeAndSpendings;
