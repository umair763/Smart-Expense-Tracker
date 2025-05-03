import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FiRefreshCw } from 'react-icons/fi';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IncomeGraph = () => {
   const [incomeData, setIncomeData] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const [refreshTrigger, setRefreshTrigger] = useState(0);
   const [refreshing, setRefreshing] = useState(false);

   // Function to refresh data
   const refreshData = () => {
      setIsLoading(true);
      setRefreshing(true);
      setRefreshTrigger((prev) => prev + 1);
   };

   useEffect(() => {
      const fetchIncomeData = async () => {
         try {
            const token = localStorage.getItem('token');
            if (!token) {
               setError('Authentication required');
               setIsLoading(false);
               setRefreshing(false);
               return;
            }

            const response = await fetch('http://localhost:5000/api/incomes', {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            if (!response.ok) {
               throw new Error('Failed to fetch income data');
            }

            const data = await response.json();
            console.log('Fetched income data for graph:', data);

            // Only use real data from database
            setIncomeData(data.incomes || []);
            setIsLoading(false);
            setRefreshing(false);
         } catch (err) {
            console.error('Error fetching income data for graph:', err);
            setError(err.message);
            setIsLoading(false);
            setRefreshing(false);
         }
      };

      fetchIncomeData();
   }, [refreshTrigger]);

   // Process data for the chart
   const processChartData = () => {
      // Group incomes by date
      const groupedByDate = incomeData.reduce((acc, income) => {
         // Use date as the key
         const date = income.date;
         if (!acc[date]) {
            acc[date] = 0;
         }
         acc[date] += income.amount;
         return acc;
      }, {});

      // Sort dates
      const sortedDates = Object.keys(groupedByDate).sort();

      // Extract the last 7 dates to keep the chart readable
      const recentDates = sortedDates.slice(-7);

      // Prepare chart data
      const labels = recentDates;
      const amounts = recentDates.map((date) => groupedByDate[date]);

      return {
         labels,
         datasets: [
            {
               label: 'Income',
               data: amounts,
               backgroundColor: 'rgba(16, 185, 129, 0.7)', // Emerald green
               borderColor: 'rgb(16, 185, 129)',
               borderWidth: 1,
            },
         ],
      };
   };

   // Chart options
   const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
         legend: {
            position: 'top',
            labels: {
               color: document.documentElement.classList.contains('dark') ? '#fff' : '#333',
            },
         },
         title: {
            display: true,
            text: 'Income Trends',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#333',
         },
         tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleColor: '#fff',
            bodyColor: '#fff',
            bodyFont: {
               size: 14,
            },
            padding: 10,
            caretSize: 8,
            cornerRadius: 4,
            displayColors: true,
         },
      },
      scales: {
         y: {
            beginAtZero: true,
            grid: {
               color: document.documentElement.classList.contains('dark')
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
               color: document.documentElement.classList.contains('dark') ? '#fff' : '#333',
               callback: function (value) {
                  return '$' + value;
               },
               font: {
                  size: 12,
               },
            },
         },
         x: {
            grid: {
               color: document.documentElement.classList.contains('dark')
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
               color: document.documentElement.classList.contains('dark') ? '#fff' : '#333',
               font: {
                  size: 12,
               },
            },
         },
      },
   };

   if (isLoading) {
      return (
         <div className="bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Income Trends</h2>
               <button
                  onClick={refreshData}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                  title="Refresh Data"
                  disabled={refreshing || isLoading}
               >
                  <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
               </button>
            </div>
            <p>Loading income data...</p>
         </div>
      );
   }

   if (error) {
      return (
         <div className="bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Income Trends</h2>
               <button
                  onClick={refreshData}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                  title="Refresh Data"
                  disabled={refreshing || isLoading}
               >
                  <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
               </button>
            </div>
            <p className="text-red-500">{error}</p>
         </div>
      );
   }

   // If no data available
   if (incomeData.length === 0) {
      return (
         <div className="bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Income Trends</h2>
               <button
                  onClick={refreshData}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                  title="Refresh Data"
                  disabled={refreshing || isLoading}
               >
                  <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
               </button>
            </div>
            <p className="text-center py-6">No income data available yet</p>
            <p className="text-sm text-center mb-4">Add income records to see your income trends visualized here</p>
         </div>
      );
   }

   return (
      <div className="bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white p-4 rounded-md">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Income Trends</h2>
            <button
               onClick={refreshData}
               className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
               title="Refresh Data"
               disabled={refreshing || isLoading}
            >
               <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
         </div>
         <div className="h-64">
            <Bar data={processChartData()} options={options} />
         </div>
      </div>
   );
};

export default IncomeGraph;
