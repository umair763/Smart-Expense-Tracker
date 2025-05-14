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

function FinancialSummaryGraph_monthly_weekly_yearly({ summaryData }) {
   const [chartData, setChartData] = useState({
      labels: [],
      datasets: [],
   });

   useEffect(() => {
      if (!summaryData) return;

      const { expenses = [], income = [] } = summaryData;

      // Group data by date for the charts
      const groupedData = groupDataByDate(expenses, income);

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
   }, [summaryData]);

   // Group data by date for chart - simplified approach that avoids the toLocaleDateString error
   const groupDataByDate = (expenses, income) => {
      // Use month grouping for better visualization of all-time data
      const grouped = {};

      // Helper function to get date key (group by month)
      const getDateKey = (dateStr) => {
         try {
            if (!dateStr) return null;

            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;

            // Format as Month Year (e.g., "Jan 2023")
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
         } catch (error) {
            console.error('Error formatting date:', error, dateStr);
            return null;
         }
      };

      // Process expenses
      expenses.forEach((expense) => {
         const dateKey = getDateKey(expense.recordedDate || expense.date);
         if (!dateKey) return;

         if (!grouped[dateKey]) {
            grouped[dateKey] = { expenses: 0, income: 0 };
         }

         grouped[dateKey].expenses += expense.amount || 0;
      });

      // Process income
      income.forEach((inc) => {
         const dateKey = getDateKey(inc.date);
         if (!dateKey) return;

         if (!grouped[dateKey]) {
            grouped[dateKey] = { expenses: 0, income: 0 };
         }

         grouped[dateKey].income += inc.amount || 0;
      });

      // Sort chronologically by date
      const sortedData = {};
      Object.keys(grouped)
         .sort((a, b) => {
            // Convert "Jan 2023" format to Date objects for comparison
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateA - dateB;
         })
         .forEach((key) => {
            sortedData[key] = grouped[key];
         });

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
            text: 'Financial Summary - Monthly View',
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
