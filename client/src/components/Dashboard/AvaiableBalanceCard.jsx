import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AvaiableBalanceCard() {
   const [balance, setBalance] = useState(0);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            console.log('Fetching balance data...');

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

            // Calculate available balance
            setBalance(totalIncome - totalExpenses);
            setLoading(false);
         } catch (err) {
            console.error('Error fetching balance data:', err);
            let errorMessage = 'Failed to load balance information';

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

   return (
      <div className="bg-sky-200 shadow-lg rounded-xl p-5 flex flex-col w-full h-full">
         <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-medium">Available balance</span>
            <div className="flex items-center">
               <span className="text-gray-600 text-sm mr-2">Active</span>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-500 peer-checked:after:translate-x-4 peer-checked:after:bg-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
               </label>
            </div>
         </div>

         {loading ? (
            <div className="text-2xl font-bold mb-6 sm:text-3xl md:text-4xl">Loading...</div>
         ) : error ? (
            <div className="text-red-500 text-lg mb-6">{error}</div>
         ) : (
            <div className="text-2xl font-bold mb-6 sm:text-3xl md:text-4xl">${balance.toFixed(2)}</div>
         )}

         <div className="flex justify-between items-center mt-auto">
            <span className="text-gray-700 font-medium">Balance</span>
            <img
               src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
               alt="Mastercard Logo"
               className="w-12"
            />
         </div>
      </div>
   );
}

export default AvaiableBalanceCard;
