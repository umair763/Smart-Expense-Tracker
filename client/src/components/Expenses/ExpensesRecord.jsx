import React, { useState } from 'react';

const data = [
   { date: '12th Jan 2025', item: 'House Rent', category: 'Rent', amount: '18,000.00', recordedDate: '30th Jan 2025' },
   {
      item: 'Internet',
      category: 'Mobile & Internet',
      amount: '1500.00',
      recordedDate: '30th Jan 2025',
   },
   {
      item: 'Grocery',
      category: 'Food & Grocery',
      amount: '10,000.00',
      recordedDate: '30th Jan 2025',
   },
   {
      item: 'Power',
      category: 'Utility Bills',
      amount: '1500.00',
      recordedDate: '30th Jan 2025',
   },
   { item: 'Gas', category: 'Utility Bills', amount: '400.00', recordedDate: '30th Jan 2025' },
   { item: 'Bike', category: 'EMI', amount: '38,000.00', recordedDate: '30th Jan 2025' },
   { item: 'Personal Loan', category: 'EMI', amount: '6,000.00', recordedDate: '30th Jan 2025' },
   { item: 'Auto', category: 'Commute', amount: '100.00', recordedDate: '30th Jan 2025' },
   {
      item: 'Train Tickets',
      category: 'Commute',
      amount: '500.00',
      recordedDate: '30th Jan 2025',
   },
   { item: 'Clothing', category: 'Clothing', amount: '1240.00', recordedDate: '30th Jan 2025' },
   { item: 'Injury', category: 'Repair', amount: '600.00', recordedDate: '30th Jan 2025' },
   { item: 'Momos', category: 'Snacks', amount: '250.00', recordedDate: '30th Jan 2025' },
   { item: 'David', category: 'Transfers', amount: '2500.00', recordedDate: '30th Jan 2025' },
];

function ExpensesRecord() {
   const [currentPage, setCurrentPage] = useState(1);
   const recordsPerPage = 10;
   const totalPages = Math.ceil(data.length / recordsPerPage);

   const handlePageChange = (page) => {
      setCurrentPage(page);
   };

   const currentRecords = data.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

   return (
      <div className="p-4 bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white">
         <h1 className="text-2xl sm:text-3xl font-bold mb-4">Expenses</h1>
         {/* Responsive Table */}
         <div className="overflow-x-auto ">
            <table className="min-w-full border-collapse table-auto text-sm">
               <thead>
                  <tr className="text-left border-b border-slate-800 text-xs sm:text-sm lg:text-md p-0 m-0">
                     <th className="py-3 px-2 sm:px-4">Item</th>
                     <th className="py-3 px-2 sm:px-4">Category</th>
                     <th className="py-3 px-2 sm:px-4">Amount</th>
                     <th className="py-3 px-2 sm:px-4">Recorded Date</th>
                  </tr>
               </thead>
               <tbody>
                  {currentRecords.map((record, index) => (
                     <tr
                        key={index}
                        className="border-b border-gray-800 hover:bg-gray-300 dark:hover:bg-[#0c2742] text-xs sm:text-sm lg:text-md"
                     >
                        <td className="py-3 px-2 sm:px-4">{record.item}</td>
                        <td className="py-3 px-2 sm:px-4">{record.category}</td>
                        <td className="py-3 px-2 sm:px-4 text-red-500 font-semibold">{record.amount}</td>
                        <td className="py-3 px-2 sm:px-4">{record.recordedDate}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-2 sm:space-y-0">
            <p className="text-gray-400 text-sm">
               {`1-${Math.min(currentPage * recordsPerPage, data.length)} out of ${data.length} total`}
            </p>
            <div className="flex items-center space-x-2">
               {Array.from({ length: totalPages }, (_, i) => (
                  <button
                     key={i}
                     className={`px-3 py-1 text-sm rounded ${
                        currentPage === i + 1 ? 'bg-yellow-500 text-black' : 'bg-gray-400 hover:bg-gray-500'
                     }`}
                     onClick={() => handlePageChange(i + 1)}
                  >
                     {i + 1}
                  </button>
               ))}
            </div>
         </div>
      </div>
   );
}

export default ExpensesRecord;
