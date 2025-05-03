import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TrackFinance() {
   const [categoryData, setCategoryData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // Define default budget limits for each category
   const budgetLimits = {
      Housing: 1500000,
      Transportation: 500000,
      Food: 800000,
      Healthcare: 500000,
      PersonalCare: 300000,
      Entertainment: 400000,
      Education: 1000000,
      FinancialObligations: 1200000,
      Taxes: 1500000,
   };

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            console.log('Fetching expense data for tracking...');

            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
               console.error('No authentication token found');
               setError('Authentication required. Please log in.');
               setLoading(false);
               return;
            }

            // Get all expenses
            const response = await axios.get('http://localhost:5000/api/expenses', {
               headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Expense response for tracking:', response.data);

            // Process the data to group by category
            let expenses = [];
            if (response.data && Array.isArray(response.data)) {
               expenses = response.data;
            } else if (response.data && Array.isArray(response.data.expenses)) {
               expenses = response.data.expenses;
            } else {
               // If no data or unexpected format, use empty array
               console.log('No expense data or unexpected format:', response.data);
            }

            // If no expenses, use sample data for development
            if (expenses.length === 0) {
               console.log('No expenses found, using sample data for tracking');
               // Use sample data if no real data available (for development only)
               const sampleData = [
                  { label: 'Food and grocery', value: 872400, maxValue: 1500000 },
                  { label: 'Shopping', value: 1378200, maxValue: 1500000 },
                  { label: 'House Rent', value: 928500, maxValue: 1500000 },
                  { label: 'Commute', value: 420700, maxValue: 1500000 },
               ];
               setCategoryData(sampleData);
               setLoading(false);
               return;
            }

            const categoryTotals = {};

            // Group expenses by category
            expenses.forEach((expense) => {
               if (!categoryTotals[expense.category]) {
                  categoryTotals[expense.category] = 0;
               }
               categoryTotals[expense.category] += expense.amount || 0;
            });

            console.log('Category totals for tracking:', categoryTotals);

            // Convert to array for the progress bars
            const progressData = Object.keys(categoryTotals).map((category) => ({
               label: category,
               value: categoryTotals[category],
               maxValue: budgetLimits[category] || 1000000, // Default limit if not specified
            }));

            // Sort by percentage of budget used (highest first)
            progressData.sort((a, b) => b.value / b.maxValue - a.value / a.maxValue);

            // Take top 4 categories
            const topCategories = progressData.slice(0, 4);
            console.log('Top categories for tracking:', topCategories);

            setCategoryData(topCategories);
            setLoading(false);
         } catch (err) {
            console.error('Error fetching expense data for tracking:', err);
            let errorMessage = 'Failed to load expense tracking data';

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
            } else {
               errorMessage = 'Error: ' + err.message;
            }

            // Use sample data if error occurs
            console.log('Error occurred, using sample data for tracking');
            const sampleData = [
               { label: 'Food and grocery', value: 872400, maxValue: 1500000 },
               { label: 'Shopping', value: 1378200, maxValue: 1500000 },
               { label: 'House Rent', value: 928500, maxValue: 1500000 },
               { label: 'Commute', value: 420700, maxValue: 1500000 },
            ];
            setCategoryData(sampleData);

            console.error(errorMessage);
            setLoading(false);
         }
      };

      fetchData();
   }, []);

   // Format number for display
   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US').format(amount);
   };

   // If no data is available, show a message
   if (!loading && (error || categoryData.length === 0)) {
      return (
         <div className="bg-slate-200 dark:bg-[#00203FFF] dark:text-white text-black p-4 sm:p-6 rounded-lg shadow-md w-full sm:w-full md:w-full flex items-center justify-center">
            <p>{error || 'No expense data available for tracking'}</p>
         </div>
      );
   }

   return (
      <div className="bg-slate-200 dark:bg-[#00203FFF] dark:text-white text-black p-4 sm:p-6 rounded-lg shadow-md w-full sm:w-full md:w-full ">
         <h2 className="text-lg sm:text-xl font-semibold mb-4 ">Track your Finance</h2>

         {loading ? (
            <div className="flex items-center justify-center h-32">
               <p>Loading expense tracking data...</p>
            </div>
         ) : (
            <div className="space-y-4">
               {categoryData.map((item, index) => (
                  <div key={index}>
                     <div className="flex justify-between mb-2 text-xs sm:text-sm md:text-md ">
                        <span>{item.label}</span>
                        <span>{formatCurrency(item.value)}</span>
                     </div>
                     <div className="w-full bg-gray-500 rounded-full h-1 sm:h-2">
                        <div
                           className={`h-full rounded-full text-xs sm:text-sm md:text-md lg:text-lg ${
                              item.value / item.maxValue > 0.8 ? 'bg-red-500' : 'bg-green-300'
                           }`}
                           style={{
                              width: `${Math.min((item.value / item.maxValue) * 100, 100)}%`,
                           }}
                        ></div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}

export default TrackFinance;
