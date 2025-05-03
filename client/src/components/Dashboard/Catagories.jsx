import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import axios from 'axios';

function Categories() {
   const [categoryData, setCategoryData] = useState([]);
   const [transactionData, setTransactionData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // Define colors for categories
   const COLORS = ['#ff6b6b', '#845ec2', '#ff9612', '#00c9a7', '#4d8af0', '#f9cb40', '#e84a5f', '#2a9d8f'];

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            console.log('Fetching expense data for categories chart...');

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
            console.log('Expense response for categories:', response.data);

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
               console.log('No expenses found, using sample data for categories');
               // Use sample data
               const samplePieData = [
                  { name: 'Personal', value: 26, color: '#ff6b6b' },
                  { name: 'Shopping', value: 30, color: '#845ec2' },
                  { name: 'Eating Out', value: 35, color: '#ff9612' },
                  { name: 'Holidays', value: 10, color: '#00c9a7' },
               ];

               const sampleTransactions = [
                  { label: 'Personal', value: '-500 $', count: '14 transactions', color: '#ff6b6b' },
                  { label: 'Shopping', value: '-410 $', count: '10 transactions', color: '#845ec2' },
                  { label: 'Eating Out', value: '-325 $', count: '7 transactions', color: '#ff9612' },
                  { label: 'Holidays', value: '-100 $', count: '2 transactions', color: '#00c9a7' },
               ];

               setCategoryData(samplePieData);
               setTransactionData(sampleTransactions);
               setLoading(false);
               return;
            }

            // Group expenses by category
            const categoryTotals = {};
            const categoryTransactions = {};

            expenses.forEach((expense) => {
               if (!categoryTotals[expense.category]) {
                  categoryTotals[expense.category] = 0;
                  categoryTransactions[expense.category] = 0;
               }
               categoryTotals[expense.category] += expense.amount || 0;
               categoryTransactions[expense.category] += 1;
            });

            console.log('Category totals for pie chart:', categoryTotals);

            // Calculate total sum to determine percentages
            const totalExpenses = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

            // Convert to array for the pie chart
            const chartData = Object.keys(categoryTotals).map((category, index) => ({
               name: category,
               value: Math.round((categoryTotals[category] / totalExpenses) * 100), // % value for pie chart
               color: COLORS[index % COLORS.length], // Cycle through colors
            }));

            // Sort by value (highest first)
            chartData.sort((a, b) => b.value - a.value);

            // Create transaction list data
            const transactions = Object.keys(categoryTotals).map((category, index) => ({
               label: category,
               value: `-${categoryTotals[category].toLocaleString()} $`,
               count: `${categoryTransactions[category]} transaction${categoryTransactions[category] !== 1 ? 's' : ''}`,
               color: COLORS[index % COLORS.length],
            }));

            // Take top categories
            const topCategories = chartData.slice(0, 4);
            const topTransactions = transactions.slice(0, 4);

            console.log('Pie chart data:', topCategories);
            console.log('Transaction list data:', topTransactions);

            setCategoryData(topCategories);
            setTransactionData(topTransactions);
            setLoading(false);
         } catch (err) {
            console.error('Error fetching expense data for categories:', err);
            let errorMessage = 'Failed to load category data';

            if (err.response) {
               console.error('Response data:', err.response.data);
               console.error('Response status:', err.response.status);
            }

            // Use sample data if error occurs
            console.log('Error occurred, using sample data for categories');
            const samplePieData = [
               { name: 'Personal', value: 26, color: '#ff6b6b' },
               { name: 'Shopping', value: 30, color: '#845ec2' },
               { name: 'Eating Out', value: 35, color: '#ff9612' },
               { name: 'Holidays', value: 10, color: '#00c9a7' },
            ];

            const sampleTransactions = [
               { label: 'Personal', value: '-500 $', count: '14 transactions', color: '#ff6b6b' },
               { label: 'Shopping', value: '-410 $', count: '10 transactions', color: '#845ec2' },
               { label: 'Eating Out', value: '-325 $', count: '7 transactions', color: '#ff9612' },
               { label: 'Holidays', value: '-100 $', count: '2 transactions', color: '#00c9a7' },
            ];

            setCategoryData(samplePieData);
            setTransactionData(sampleTransactions);
            setLoading(false);
         }
      };

      fetchData();
   }, []);

   // If loading, show loading state
   if (loading) {
      return (
         <div className="bg-slate-200 dark:bg-[#00203FFF] dark:text-white text-black p-3 sm:p-4 rounded-lg shadow-md w-full sm:w-full md:w-full flex items-center justify-center h-96">
            <p>Loading categories data...</p>
         </div>
      );
   }

   return (
      <div className="bg-slate-200 dark:bg-[#00203FFF] dark:text-white text-black p-3 sm:p-4 rounded-lg shadow-md w-full sm:w-full md:w-full ">
         <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Categories</h2>

         {/* Donut Chart */}
         <div className="flex justify-center mb-6">
            <PieChart width={170} height={170} className="sm:w-[200px] sm:h-[200px] w-full h-full">
               <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
               >
                  {categoryData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
               </Pie>
            </PieChart>
         </div>

         {/* Transaction List */}
         <div className="space-y-3 sm:space-y-4 ">
            {transactionData.map((transaction, index) => (
               <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                     <div
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2 sm:mr-3 "
                        style={{ backgroundColor: transaction.color }}
                     ></div>
                     <div>
                        <p className="text-xs sm:text-sm md:text-md sm:p-0">{transaction.label}</p>
                        <p className="text-xs sm:text-sm md:text-md text-gray-400 ">{transaction.count}</p>
                     </div>
                  </div>
                  <p className="text-red-500 text-xs sm:text-sm font-bold">{transaction.value}</p>
               </div>
            ))}
         </div>
      </div>
   );
}

export default Categories;
