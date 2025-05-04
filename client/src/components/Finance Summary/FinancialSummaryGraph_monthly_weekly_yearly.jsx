import { useState, useEffect } from 'react';
import {
   Chart as ChartJS,
   CategoryScale,
   LinearScale,
   BarElement,
   Title,
   Tooltip,
   Legend,
   PointElement,
   LineElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

function FinancialSummaryGraph_monthly_weekly_yearly({ timeFilter, summaryData }) {
   const [chartData, setChartData] = useState({
      labels: [],
      datasets: [],
   });

   useEffect(() => {
      if (!summaryData) return;

      const { expenses = [], income = [] } = summaryData;

      // Group data by date for the charts
      const groupedData = groupDataByDate(expenses, income, timeFilter);

      // Prepare chart data
      setChartData({
         labels: Object.keys(groupedData),
         datasets: [
            {
               label: 'Expenses',
               data: Object.values(groupedData).map((item) => item.expenses),
               backgroundColor: 'rgba(255, 99, 132, 0.5)',
               borderColor: 'rgb(255, 99, 132)',
               borderWidth: 1,
               stack: 'Stack 0',
            },
            {
               label: 'Income',
               data: Object.values(groupedData).map((item) => item.income),
               backgroundColor: 'rgba(75, 192, 192, 0.5)',
               borderColor: 'rgb(75, 192, 192)',
               borderWidth: 1,
               stack: 'Stack 1',
            },
            {
               label: 'Net',
               data: Object.values(groupedData).map((item) => item.income - item.expenses),
               type: 'line',
               borderColor: 'rgb(54, 162, 235)',
               backgroundColor: 'rgba(54, 162, 235, 0.5)',
               borderWidth: 2,
               tension: 0.1,
            },
         ],
      });
   }, [summaryData, timeFilter]);

   // Group data by date for chart - simplified approach that avoids the toLocaleDateString error
   const groupDataByDate = (expenses, income, timeFilter) => {
      const grouped = {};

      // Helper function to get date key based on time filter
      const getDateKey = (dateStr) => {
         try {
            if (!dateStr) return null;

            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;

            switch (timeFilter) {
               case 'week':
                  // Format as day name (Mon, Tue, etc.)
                  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
               case 'month':
                  // Format as day of month (1, 2, ..., 31)
                  return date.getDate().toString();
               case 'year':
                  // Format as month name (Jan, Feb, etc.)
                  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
                     date.getMonth()
                  ];
               default:
                  return date.toISOString().split('T')[0];
            }
         } catch (error) {
            console.error('Error formatting date:', error, dateStr);
            return null;
         }
      };

      // Process expenses
      expenses.forEach((expense) => {
         if (!expense.date) return;

         const dateKey = getDateKey(expense.date);
         if (!dateKey) return;

         if (!grouped[dateKey]) {
            grouped[dateKey] = { expenses: 0, income: 0 };
         }

         grouped[dateKey].expenses += expense.amount || 0;
      });

      // Process income
      income.forEach((inc) => {
         if (!inc.date) return;

         const dateKey = getDateKey(inc.date);
         if (!dateKey) return;

         if (!grouped[dateKey]) {
            grouped[dateKey] = { expenses: 0, income: 0 };
         }

         grouped[dateKey].income += inc.amount || 0;
      });

      // Sort keys based on time filter
      const sortedData = {};

      if (timeFilter === 'week') {
         // Sort by day of week (Sun, Mon, Tue, ...)
         const dayOrder = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
         Object.keys(grouped)
            .sort((a, b) => dayOrder[a] - dayOrder[b])
            .forEach((key) => {
               sortedData[key] = grouped[key];
            });
      } else if (timeFilter === 'month') {
         // Sort by day number
         Object.keys(grouped)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach((key) => {
               sortedData[key] = grouped[key];
            });
      } else if (timeFilter === 'year') {
         // Sort by month
         const monthOrder = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
         };
         Object.keys(grouped)
            .sort((a, b) => monthOrder[a] - monthOrder[b])
            .forEach((key) => {
               sortedData[key] = grouped[key];
            });
      } else {
         // Default sort (by date)
         Object.keys(grouped)
            .sort()
            .forEach((key) => {
               sortedData[key] = grouped[key];
            });
      }

      return sortedData;
   };

   // Chart options
   const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
         legend: {
            position: 'top',
         },
         title: {
            display: true,
            text: `Financial Summary - ${timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}ly View`,
         },
         tooltip: {
            callbacks: {
               label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                     label += ': ';
                  }
                  if (context.parsed.y !== null) {
                     label += new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                     }).format(context.parsed.y);
                  }
                  return label;
               },
            },
         },
      },
      scales: {
         x: {
            stacked: false,
         },
         y: {
            stacked: false,
            beginAtZero: true,
            ticks: {
               callback: function (value) {
                  return '$' + value;
               },
            },
         },
      },
   };

   if (!summaryData) {
      return (
         <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-4">Financial Summary Graph</h2>
            <p>No data available</p>
         </div>
      );
   }

  return (
      <div className="p-4">
         <h2 className="text-xl font-semibold mb-4">Financial Summary Graph</h2>
         <div className="h-80">
            <Bar data={chartData} options={options} />
         </div>
      </div>
  );
}

export default FinancialSummaryGraph_monthly_weekly_yearly;
