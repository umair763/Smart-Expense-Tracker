import React from 'react';

function ConsolidatedFinancialTable({ summaryData }) {
   if (!summaryData) {
      return <p className="p-4 text-center">No data available</p>;
   }

   const { expenses = [], income = [], transactions = [] } = summaryData;

   // Format date to DD-MMM-YY
   const formatDate = (dateString) => {
      if (!dateString) return '';

      try {
         const date = new Date(dateString);
         if (isNaN(date.getTime())) return '';

         // Format as DD-MMM-YY
         const day = date.getDate().toString().padStart(2, '0');
         const month = date.toLocaleString('en-US', { month: 'short' });
         const year = date.getFullYear().toString().slice(2);

         return `${day}-${month}-${year}`;
      } catch (error) {
         console.error('Date formatting error:', error);
         return '';
      }
   };

   // Get the maximum length among the three arrays for left outer join
   const maxLength = Math.max(income.length, expenses.length, transactions.length);

   // Create the consolidated rows using left outer join approach
   const consolidatedRows = Array.from({ length: maxLength }, (_, index) => {
      // For income, we always take the item at current index if available
      const incomeItem = index < income.length ? income[index] : null;

      // For expense and transaction, repeat if needed to match the income length
      const expenseItem = expenses.length > 0 ? expenses[index % expenses.length] : null;
      const transactionItem = transactions.length > 0 ? transactions[index % transactions.length] : null;

      return {
         incomeCategory: incomeItem?.category || '',
         incomeAmount: incomeItem?.amount || '',
         incomeDate: formatDate(incomeItem?.date),
         expenseCategory: expenseItem?.category || '',
         expenseAmount: expenseItem?.amount || '',
         expenseDate: formatDate(expenseItem?.recordedDate || expenseItem?.date),
         transactionAmount: transactionItem?.amount || '',
         transactionStatus: transactionItem?.status || '',
         transactionDate: formatDate(transactionItem?.date),
      };
   });

   return (
      <div className="p-4">
         <h2 className="text-xl font-semibold mb-4">Consolidated Financial Summary</h2>

         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
               <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
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
                  {consolidatedRows.map((row, index) => (
                     <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                           {row.incomeCategory}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                           {row.incomeAmount !== '' ? row.incomeAmount.toLocaleString() : ''}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                           {row.incomeDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                           {row.expenseCategory}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                           {row.expenseAmount !== '' ? `-${row.expenseAmount.toLocaleString()}` : ''}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                           {row.expenseDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                           {row.transactionAmount !== '' ? row.transactionAmount.toLocaleString() : ''}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                           {row.transactionStatus}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                           {row.transactionDate}
                        </td>
                     </tr>
                  ))}

                  {consolidatedRows.length === 0 && (
                     <tr>
                        <td colSpan="9" className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                           No records found
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
   );
}

export default ConsolidatedFinancialTable;
