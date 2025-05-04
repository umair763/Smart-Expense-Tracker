import { useState } from 'react';
import { FiFilter } from 'react-icons/fi';

function FinanceSummaryRecord({ timeFilter, summaryData }) {
   const [filterCategory, setFilterCategory] = useState('all');

   if (!summaryData) {
      return <p className="p-4 text-center">No data available</p>;
   }

   const { expenses = [], income = [], transactions = [] } = summaryData;

   // Filter data by category if needed
   const filteredExpenses = filterCategory === 'all' ? expenses : expenses.filter((e) => e.category === filterCategory);

   const filteredIncome = filterCategory === 'all' ? income : income.filter((i) => i.category === filterCategory);

   const filteredTransactions = filterCategory === 'all' ? transactions : [];

   // Get all unique categories
   const allCategories = [...new Set([...expenses.map((e) => e.category), ...income.map((i) => i.category)])]
      .filter(Boolean)
      .sort();

   // Format date based on time filter
   const formatDate = (dateString) => {
      if (!dateString) return '—';

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';

      try {
         if (timeFilter === 'week') {
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
         } else if (timeFilter === 'month') {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
         } else {
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
         }
      } catch (error) {
         console.error('Date formatting error:', error);
         return dateString.split('T')[0]; // Fallback to ISO format
      }
   };

   return (
      <div className="p-4">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Financial Summary Record</h2>
            <div className="flex items-center space-x-2">
               <div className="relative">
                  <select
                     className="py-2 pl-3 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     value={filterCategory}
                     onChange={(e) => setFilterCategory(e.target.value)}
                  >
                     <option value="all">All Categories</option>
                     {allCategories.map((category) => (
                        <option key={category} value={category}>
                           {category}
                        </option>
                     ))}
                  </select>
                  <FiFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
               <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Income Category
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Income Amount
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Income Date
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Expense Category
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Expense Amount
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Expense Date
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Transaction Amount
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Transaction Status
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Transaction Date
                     </th>
                  </tr>
               </thead>
               <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Expenses */}
                  {filteredExpenses.map((expense, index) => (
                     <tr key={`expense-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           {summaryData.name || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           {expense.category || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500">
                           -${expense.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           {formatDate(expense.recordedDate || expense.date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                     </tr>
                  ))}

                  {/* Income */}
                  {filteredIncome.map((inc, index) => (
                     <tr key={`income-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           {summaryData.name || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           {inc.category || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500">
                           +${inc.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           {formatDate(inc.date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                     </tr>
                  ))}

                  {/* Transactions */}
                  {filteredTransactions.map((transaction, index) => (
                     <tr key={`transaction-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           {summaryData.name || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">—</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-500">
                           ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           {transaction.status || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           {formatDate(transaction.date)}
                        </td>
                     </tr>
                  ))}

                  {/* Show message if no data */}
                  {filteredExpenses.length === 0 &&
                     filteredIncome.length === 0 &&
                     filteredTransactions.length === 0 && (
                        <tr>
                           <td colSpan="10" className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                              No records found for the selected filter
                           </td>
                        </tr>
                     )}
               </tbody>
            </table>
         </div>
      </div>
   );
}

export default FinanceSummaryRecord;
