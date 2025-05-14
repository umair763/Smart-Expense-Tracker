import { useState, useEffect } from 'react';
import axios from 'axios';
import ConsolidatedFinancialTable from '../../components/Finance Summary/ConsolidatedFinancialTable';
import FinancialSummaryReport_monthly_weekly_yearly from '../../components/Finance Summary/FinancialSummaryReport_monthly_weekly_yearly';
import FinancialSummaryGraph_monthly_weekly_yearly from '../../components/Finance Summary/FinancialSummaryGraph_monthly_weekly_yearly';

function MainFinanceSummary() {
   const [summaryData, setSummaryData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      fetchSummaryData();
   }, []);

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

         console.log('Fetching all financial summary data');

         try {
            // Fetch expenses, incomes, and transactions separately to ensure complete data
            const expenseResponse = await axios.get('http://localhost:5000/api/expenses', {
               headers: { Authorization: `Bearer ${token}` },
            });

            const incomeResponse = await axios.get('http://localhost:5000/api/incomes', {
               headers: { Authorization: `Bearer ${token}` },
            });

            const transactionResponse = await axios.get('http://localhost:5000/api/transactions', {
               headers: { Authorization: `Bearer ${token}` },
            });

            // Extract data from responses, handling both array and object formats
            const expenses = expenseResponse.data.expenses || expenseResponse.data || [];
            const income = incomeResponse.data.incomes || incomeResponse.data || [];
            const transactions = transactionResponse.data.transactions || transactionResponse.data || [];

            // Create combined data object
            const combinedData = {
               success: true,
               name: 'User',
               expenses,
               income,
               transactions,
            };

            console.log('Combined financial data:', combinedData);
            setSummaryData(combinedData);
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
      console.log('Generating dummy data for all time view');
      const dummyExpenses = [];
      const dummyIncome = [];
      const dummyTransactions = [];

      const currentDate = new Date();
      // Set start date to 1 year ago for all data
      const startDate = new Date(currentDate);
      startDate.setFullYear(currentDate.getFullYear() - 1);

      // Generate dates between startDate and currentDate
      const datesBetween = [];
      const tempDate = new Date(startDate);
      while (tempDate <= currentDate) {
         datesBetween.push(new Date(tempDate));
         tempDate.setDate(tempDate.getDate() + 7); // Jump by weeks to reduce data size
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
            </div>
         </div>

         {loading ? (
            <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Consolidated Financial Table - Takes 2 columns */}
               <div className="lg:col-span-2 space-y-6">
                  <div className="card backdrop-blur-md">
                     <ConsolidatedFinancialTable summaryData={summaryData} />
                  </div>
               </div>

               {/* Right Column - Takes 1 column */}
               <div className="space-y-6">

                  {/* Financial Summary Graph */}
                  <div className="card backdrop-blur-md">
                     <FinancialSummaryGraph_monthly_weekly_yearly summaryData={summaryData} />
                  </div>
               </div>
            </div>
         )}
                  {/* Financial Summary Report */}
                  <div className="card backdrop-blur-md">
                     <FinancialSummaryReport_monthly_weekly_yearly summaryData={summaryData} />
                  </div>
      </div>
   );
}

export default MainFinanceSummary;
