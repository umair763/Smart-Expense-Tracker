import { useState, useEffect } from 'react';
import axios from 'axios';
import FinanceSummaryRecord from '../../components/Finance Summary/FinanceSummaryRecord';
import FinancialSummaryGraph_monthly_weekly_yearly from '../../components/Finance Summary/FinancialSummaryGraph_monthly_weekly_yearly';
import FinancialSummaryReport_monthly_weekly_yearly from '../../components/Finance Summary/FinancialSummaryReport_monthly_weekly_yearly';

function MainFinanceSummary() {
   const [timeFilter, setTimeFilter] = useState('week'); // week, month, year
   const [summaryData, setSummaryData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      fetchSummaryData();
   }, [timeFilter]);

   const fetchSummaryData = async () => {
      try {
         setLoading(true);
         setError(null);
         const token = localStorage.getItem('token');

         if (!token) {
            // Fall back to dummy data if no token
            setSummaryData(generateDummyData());
            setLoading(false);
            return;
         }

         console.log(`Fetching financial summary data with filter: ${timeFilter}`);

         try {
            // Use summary endpoint with time filter
            const apiUrl = `http://localhost:5000/api/finance-summary/summary/${timeFilter}`;

            const response = await axios.get(apiUrl, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            console.log('Financial summary data received:', response.data);
            setSummaryData(response.data);
         } catch (apiError) {
            console.error('API error, using dummy data:', apiError);
            // Use dummy data as fallback when API fails
            setSummaryData(generateDummyData());
         }
      } catch (err) {
         console.error('Error in fetchSummaryData:', err);
         // Always use dummy data on error
         setSummaryData(generateDummyData());
      } finally {
         setLoading(false);
      }
   };

   // Generate dummy data for UI testing when API fails
   const generateDummyData = () => {
      console.log(`Generating dummy data for ${timeFilter} view`);
      const dummyExpenses = [];
      const dummyIncome = [];
      const dummyTransactions = [];

      const currentDate = new Date();
      let startDate;

      // Determine date range based on timeFilter
      switch (timeFilter) {
         case 'week':
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - 7);
            break;
         case 'month':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            break;
         case 'year':
            startDate = new Date(currentDate.getFullYear(), 0, 1);
            break;
         default:
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - 7);
      }

      // Generate dates between startDate and currentDate
      const datesBetween = [];
      const tempDate = new Date(startDate);
      while (tempDate <= currentDate) {
         datesBetween.push(new Date(tempDate));
         tempDate.setDate(tempDate.getDate() + 1);
      }

      // Generate dummy expenses
      const expenseCategories = ['Housing', 'Transportation', 'Food', 'Healthcare', 'PersonalCare', 'Entertainment'];
      for (let i = 0; i < 15; i++) {
         const randomDate = datesBetween[Math.floor(Math.random() * datesBetween.length)];
         dummyExpenses.push({
            category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
            amount: Math.floor(Math.random() * 200) + 50,
            date: randomDate.toISOString().split('T')[0],
         });
      }

      // Generate dummy income
      const incomeCategories = ['Salary', 'Freelance', 'Business', 'Investments', 'Dividends'];
      for (let i = 0; i < 8; i++) {
         const randomDate = datesBetween[Math.floor(Math.random() * datesBetween.length)];
         dummyIncome.push({
            category: incomeCategories[Math.floor(Math.random() * incomeCategories.length)],
            amount: Math.floor(Math.random() * 1000) + 500,
            date: randomDate.toISOString().split('T')[0],
         });
      }

      // Generate dummy transactions
      const transactionStatuses = ['Completed', 'Pending', 'Failed', 'Processing'];
      for (let i = 0; i < 10; i++) {
         const randomDate = datesBetween[Math.floor(Math.random() * datesBetween.length)];
         dummyTransactions.push({
            amount: Math.floor(Math.random() * 300) + 100,
            status: transactionStatuses[Math.floor(Math.random() * transactionStatuses.length)],
            date: randomDate.toISOString().split('T')[0],
         });
      }

      // Standard summary view format
      return {
         success: true,
         timeFilter,
         name: 'Test User',
         expenses: dummyExpenses,
         income: dummyIncome,
         transactions: dummyTransactions,
      };
   };

   return (
      <div className="w-full max-w-8xl mx-auto">
         <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
               <h1 className="text-2xl font-bold">Financial Summary</h1>

               {/* Time Filter Buttons */}
               <div className="flex space-x-4">
                  <button
                     onClick={() => setTimeFilter('week')}
                     className={`px-4 py-2 rounded-md ${
                        timeFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                     }`}
                  >
                     Weekly
                  </button>
                  <button
                     onClick={() => setTimeFilter('month')}
                     className={`px-4 py-2 rounded-md ${
                        timeFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                     }`}
                  >
                     Monthly
                  </button>
                  <button
                     onClick={() => setTimeFilter('year')}
                     className={`px-4 py-2 rounded-md ${
                        timeFilter === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                     }`}
                  >
                     Yearly
                  </button>
               </div>
            </div>
         </div>

         {loading ? (
            <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Left Column */}
               <div className="lg:col-span-2 space-y-6">
                  <div className="card backdrop-blur-md">
                     <FinanceSummaryRecord timeFilter={timeFilter} summaryData={summaryData} />
                  </div>
                  <div className="card backdrop-blur-md">
                     <FinancialSummaryReport_monthly_weekly_yearly timeFilter={timeFilter} summaryData={summaryData} />
                  </div>
               </div>

               {/* Right Column */}
               <div className="space-y-6">
                  <div className="card backdrop-blur-md">
                     <FinancialSummaryGraph_monthly_weekly_yearly timeFilter={timeFilter} summaryData={summaryData} />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

export default MainFinanceSummary;
