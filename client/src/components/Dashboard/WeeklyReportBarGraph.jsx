import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { FiRefreshCw } from 'react-icons/fi';

function WeeklyReportBarGraph() {
   const [chartData, setChartData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [timeRange, setTimeRange] = useState('week'); // 'week' or 'month'
   const [refreshing, setRefreshing] = useState(false);

   const fetchData = async () => {
      try {
         setLoading(true);
         console.log('Fetching data for chart...');

         // Get token from localStorage
         const token = localStorage.getItem('token');
         if (!token) {
            console.error('No authentication token found');
            setError('Authentication required. Please log in.');
            setLoading(false);
            return;
         }

         // Get income data
         const incomeResponse = await axios.get('http://localhost:5000/api/incomes', {
            headers: { Authorization: `Bearer ${token}` },
         });
         console.log('Income response:', incomeResponse.data);

         // Get expense data
         const expenseResponse = await axios.get('http://localhost:5000/api/expenses', {
            headers: { Authorization: `Bearer ${token}` },
         });
         console.log('Expense response:', expenseResponse.data);

         // Get all incomes and expenses
         // Handle different response structures
         let incomes = [];
         if (incomeResponse.data && incomeResponse.data.incomes) {
            incomes = incomeResponse.data.incomes;
         } else if (Array.isArray(incomeResponse.data)) {
            incomes = incomeResponse.data;
         }

         let expenses = [];
         if (Array.isArray(expenseResponse.data)) {
            expenses = expenseResponse.data;
         }

         console.log(`Processing ${incomes.length} incomes and ${expenses.length} expenses`);

         // Calculate date range (last 7 days by default, or 30 days for month)
         const days = timeRange === 'week' ? 7 : 30;
         const endDate = new Date();
         const startDate = new Date();
         startDate.setDate(endDate.getDate() - days);

         // Convert dates to strings for comparison
         const startDateStr = startDate.toISOString().split('T')[0];
         console.log('Date range:', startDateStr, 'to', endDate.toISOString().split('T')[0]);

         // Process income data - group by date
         const incomeByDate = {};
         incomes.forEach((income) => {
            // Ensure the date is in the range
            if (income.date >= startDateStr) {
               if (!incomeByDate[income.date]) {
                  incomeByDate[income.date] = 0;
               }
               incomeByDate[income.date] += income.amount;
            }
         });

         // Process expense data - group by date
         const expenseByDate = {};
         expenses.forEach((expense) => {
            // Ensure the date is in the range
            if (expense.recordedDate >= startDateStr) {
               if (!expenseByDate[expense.recordedDate]) {
                  expenseByDate[expense.recordedDate] = 0;
               }
               expenseByDate[expense.recordedDate] += expense.amount;
            }
         });

         // Generate all dates in the range
         const allDates = [];
         const currentDate = new Date(startDate);
         while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            allDates.push(dateStr);
            currentDate.setDate(currentDate.getDate() + 1);
         }

         // Create data for chart
         const data = allDates.map((date) => {
            // Format date for display (e.g., "May 15")
            const displayDate = new Date(date).toLocaleDateString('en-US', {
               month: 'short',
               day: 'numeric',
            });

            return {
               date: displayDate,
               income: incomeByDate[date] || 0,
               spendings: expenseByDate[date] || 0,
            };
         });

         console.log('Processed chart data:', data);
         setChartData(data);
         setLoading(false);
      } catch (err) {
         console.error('Error fetching data for weekly chart:', err);
         let errorMessage = 'Failed to load chart data';

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

         setError(errorMessage);
         setLoading(false);
      } finally {
         setRefreshing(false);
      }
   };

   const handleRefresh = () => {
      setRefreshing(true);
      fetchData();
   };

   const handleRangeChange = () => {
      setTimeRange((prev) => (prev === 'week' ? 'month' : 'week'));
   };

   useEffect(() => {
      fetchData();
   }, [timeRange]);

   // If no data is available, show a message
   if (!loading && (error || chartData.length === 0)) {
      return (
         <div className="bg-slate-200 dark:bg-gray-500 dark:text-white text-black rounded-lg shadow-md p-6 w-full flex items-center justify-center">
            <p>{error || 'No data available for the selected time range'}</p>
         </div>
      );
   }

   return (
      <div className="bg-slate-200 dark:bg-gray-500 dark:text-white text-black rounded-lg shadow-md p-6 w-full">
         {/* Title, Filter, and Refresh Button */}
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Expenses statistics</h2>
            <div className="flex items-center gap-3">
               <button className="text-gray-500 dark:text-white text-sm font-medium" onClick={handleRangeChange}>
                  {timeRange === 'week' ? 'Week ▼' : 'Month ▼'}
               </button>
               <button
                  onClick={handleRefresh}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                  title="Refresh Data"
                  disabled={refreshing || loading}
               >
                  <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
               </button>
            </div>
         </div>

         {/* Chart */}
         {loading ? (
            <div className="h-[200px] flex items-center justify-center">
               <p>Loading chart data...</p>
            </div>
         ) : (
            <ResponsiveContainer width="100%" height={200}>
               <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'black' }} axisLine={false} tickLine={false} />
                  <YAxis
                     tick={{ fontSize: 12, fill: 'black' }}
                     axisLine={false}
                     tickLine={false}
                     tickFormatter={(value) => `$${Math.round(value)}`}
                  />
                  <Tooltip
                     contentStyle={{
                        backgroundColor: '#6b7280',
                        borderRadius: '8px',
                        color: '#fff',
                        border: 'none',
                     }}
                     formatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Line type="monotone" dataKey="income" stroke="#000000" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="spendings" stroke="#fb7185" strokeWidth={2} dot={false} />
               </LineChart>
            </ResponsiveContainer>
         )}
      </div>
   );
}

export default WeeklyReportBarGraph;
