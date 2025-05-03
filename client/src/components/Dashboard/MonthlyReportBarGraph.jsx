import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { FiRefreshCw } from 'react-icons/fi';

function MonthlyReportBarGraph({ isTheme }) {
   const [expenseData, setExpenseData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [refreshing, setRefreshing] = useState(false);

   const fetchData = async () => {
      try {
         setLoading(true);
         console.log('Fetching expense data for chart...');

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
         console.log('Expense response:', response.data);

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

         // If no expenses, set sample data for development
         if (expenses.length === 0) {
            console.log('No expenses found, using sample data');
            // Use sample data if no real data available (for development only)
            setExpenseData([
               { name: 'Housing', value: 1200 },
               { name: 'Food', value: 800 },
               { name: 'Transportation', value: 500 },
               { name: 'Entertainment', value: 300 },
               { name: 'Healthcare', value: 400 },
            ]);
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

         console.log('Category totals:', categoryTotals);

         // Convert to array for the chart
         const chartData = Object.keys(categoryTotals).map((category) => ({
            name: category,
            value: categoryTotals[category],
         }));

         // Sort by value (highest first)
         chartData.sort((a, b) => b.value - a.value);

         // Take top 5 categories
         const topCategories = chartData.slice(0, 5);
         console.log('Top categories for chart:', topCategories);

         setExpenseData(topCategories);
         setLoading(false);
      } catch (err) {
         console.error('Error fetching expense data for chart:', err);
         let errorMessage = 'Failed to load expense data';

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
         console.log('Error occurred, using sample data');
         setExpenseData([
            { name: 'Housing', value: 1200 },
            { name: 'Food', value: 800 },
            { name: 'Transportation', value: 500 },
            { name: 'Entertainment', value: 300 },
            { name: 'Healthcare', value: 400 },
         ]);

         console.error(errorMessage);
         setLoading(false);
      } finally {
         setRefreshing(false);
      }
   };

   // Handle refresh button click
   const handleRefresh = () => {
      setRefreshing(true);
      fetchData();
   };

   useEffect(() => {
      fetchData();
   }, []);

   // If no data is available, show a message
   if (!loading && (error || expenseData.length === 0)) {
      return (
         <div className="bg-slate-200 dark:bg-[#00203FFF] dark:text-white text-black p-6 rounded-lg shadow-md w-full flex items-center justify-center">
            <p>{error || 'No expense data available'}</p>
         </div>
      );
   }

   return (
      <div className="bg-slate-200 dark:bg-[#00203FFF] dark:text-white text-black p-6 rounded-lg shadow-md w-full">
         {/* Title and Refresh Button */}
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Day-to-Day Expenses</h2>
            <button
               onClick={handleRefresh}
               className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
               title="Refresh Data"
               disabled={refreshing || loading}
            >
               <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
         </div>

         {/* Bar Chart */}
         {loading ? (
            <div className="h-[200px] flex items-center justify-center">
               <p>Loading expense data...</p>
            </div>
         ) : (
            <ResponsiveContainer width="100%" height={200}>
               <BarChart data={expenseData} margin={{ top: 10, right: 5, bottom: 20, left: 0 }}>
                  <XAxis
                     dataKey="name"
                     tick={{ fill: isTheme ? 'white' : 'black', fontSize: 10 }}
                     angle={-45}
                     textAnchor="end"
                     height={60}
                  />
                  <YAxis tick={{ fill: isTheme ? 'white' : 'black', fontSize: 12 }} />
                  <Tooltip
                     contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                     }}
                     formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                  />
                  <Bar dataKey="value" fill="#a78bfa" barSize={30} radius={[4, 4, 0, 0]} />
               </BarChart>
            </ResponsiveContainer>
         )}
      </div>
   );
}

export default MonthlyReportBarGraph;
// className = 'text-black dark:text-white';
