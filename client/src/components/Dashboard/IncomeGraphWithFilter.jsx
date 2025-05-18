import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
   Chart as ChartJS,
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   Title,
   Tooltip,
   Legend,
} from 'chart.js';
import { FiRefreshCw } from 'react-icons/fi';
import { RiArrowDownSLine } from 'react-icons/ri';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const IncomeGraphWithFilter = ({ isTheme }) => {
   const [incomeData, setIncomeData] = useState([]);
   const [filteredData, setFilteredData] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const [refreshTrigger, setRefreshTrigger] = useState(0);
   const [refreshing, setRefreshing] = useState(false);
   const [filterPeriod, setFilterPeriod] = useState('week');
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

   // Filter data based on selected period
   useEffect(() => {
      if (incomeData.length === 0) return;

      const now = new Date();
      let filteredIncomes = [];

      if (filterPeriod === 'week') {
         // Get current week data (last 7 days)
         const oneWeekAgo = new Date(now);
         oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

         filteredIncomes = incomeData.filter((income) => {
            const incomeDate = new Date(income.date);
            return incomeDate >= oneWeekAgo && incomeDate <= now;
         });
      } else if (filterPeriod === 'month') {
         // Get current month data
         const oneMonthAgo = new Date(now);
         oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

         filteredIncomes = incomeData.filter((income) => {
            const incomeDate = new Date(income.date);
            return incomeDate >= oneMonthAgo && incomeDate <= now;
         });
      }

      setFilteredData(filteredIncomes);
   }, [incomeData, filterPeriod]);

   // Process data for the chart
   const processChartData = () => {
      // If no filtered data, return empty chart data
      if (filteredData.length === 0) {
         return {
            labels: [],
            datasets: [
               {
                  label: 'Income',
                  data: [],
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  borderColor: 'rgb(16, 185, 129)',
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: 'rgb(16, 185, 129)',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 1,
                  pointRadius: 4,
               },
            ],
         };
      }

      // Group incomes by date
      const groupedByDate = filteredData.reduce((acc, income) => {
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

      // Extract the dates to keep the chart readable
      const recentDates = filterPeriod === 'week' ? sortedDates.slice(-7) : sortedDates.slice(-30);

      // Format dates for display
      const formattedDates = recentDates.map((date) => {
         const d = new Date(date);
         return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      // Prepare chart data
      const labels = formattedDates;
      const amounts = recentDates.map((date) => groupedByDate[date]);

      return {
         labels,
         datasets: [
            {
               label: 'Income',
               data: amounts,
               backgroundColor: 'rgba(16, 185, 129, 0.2)',
               borderColor: 'rgb(16, 185, 129)',
               borderWidth: 2,
               tension: 0.4,
               fill: true,
               pointBackgroundColor: 'rgb(16, 185, 129)',
               pointBorderColor: '#fff',
               pointBorderWidth: 1,
               pointRadius: 4,
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
            text: `Income for ${filterPeriod === 'week' ? 'Past Week' : 'Past Month'}`,
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

   // Toggle dropdown
   const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
   };

   // Change filter period
   const changeFilterPeriod = (period) => {
      setFilterPeriod(period);
      setIsDropdownOpen(false);
   };

   if (isLoading) {
      return (
         <div className="bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Income Graph</h2>
               <div className="flex items-center">
                  <div className="relative mr-2">
                     <button
                        className="flex items-center justify-between bg-slate-300 dark:bg-slate-700 px-3 py-1 rounded-md"
                        onClick={toggleDropdown}
                     >
                        <span className="mr-1 capitalize">{filterPeriod}</span>
                        <RiArrowDownSLine className="h-5 w-5" />
                     </button>
                  </div>
                  <button
                     onClick={refreshData}
                     className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                     title="Refresh Data"
                     disabled={refreshing || isLoading}
                  >
                     <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
               </div>
            </div>
            <p>Loading income data...</p>
         </div>
      );
   }

   if (error) {
      return (
         <div className="bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Income Graph</h2>
               <div className="flex items-center">
                  <div className="relative mr-2">
                     <button
                        className="flex items-center justify-between bg-slate-300 dark:bg-slate-700 px-3 py-1 rounded-md"
                        onClick={toggleDropdown}
                     >
                        <span className="mr-1 capitalize">{filterPeriod}</span>
                        <RiArrowDownSLine className="h-5 w-5" />
                     </button>
                  </div>
                  <button
                     onClick={refreshData}
                     className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                     title="Refresh Data"
                     disabled={refreshing || isLoading}
                  >
                     <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
               </div>
            </div>
            <p className="text-red-500">{error}</p>
         </div>
      );
   }

   return (
      <div className="bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white p-4 rounded-md">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Income Graph</h2>
            <div className="flex items-center">
               <div className="relative mr-2">
                  <button
                     className="flex items-center justify-between bg-slate-300 dark:bg-slate-700 px-3 py-1 rounded-md"
                     onClick={toggleDropdown}
                  >
                     <span className="mr-1 capitalize">{filterPeriod}</span>
                     <RiArrowDownSLine className="h-5 w-5" />
                  </button>

                  {isDropdownOpen && (
                     <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-md shadow-lg z-10 border dark:border-slate-700">
                        <ul>
                           <li
                              className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                              onClick={() => changeFilterPeriod('week')}
                           >
                              Week
                           </li>
                           <li
                              className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                              onClick={() => changeFilterPeriod('month')}
                           >
                              Month
                           </li>
                        </ul>
                     </div>
                  )}
               </div>

               <button
                  onClick={refreshData}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                  title="Refresh Data"
                  disabled={refreshing || isLoading}
               >
                  <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
               </button>
            </div>
         </div>

         {incomeData.length === 0 ? (
            <>
               <p className="text-center py-6">No income data available yet</p>
               <p className="text-sm text-center mb-4">Add income records to see your income trends visualized here</p>
            </>
         ) : (
            <div className="h-64">
               <Line data={processChartData()} options={options} />
            </div>
         )}
      </div>
   );
};

export default IncomeGraphWithFilter;
