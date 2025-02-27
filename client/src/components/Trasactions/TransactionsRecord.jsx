import React, { useState } from 'react';

const TransactionList = () => {
   const transactions = [
      {
         id: '190715000001',
         date: '15/07/2019',
         time: '10:13:06',
         type: 'Transfer',
         amount: 3000,
         status: 'Successful',
         discount: 100,
         fee_charge: 0,
         depository_institution: 'Interbanking',
         description: 'Transfer to John Doe for project investment',
      },
      {
         id: '190715000002',
         date: '15/07/2019',
         time: '01:11:11',
         type: 'Sale',
         amount: 4000,
         status: 'Failed',
         discount: 10,
         fee_charge: 2,
         depository_institution: 'Easy-Paisa',
         description: 'Sold goods to John Doe',
      },
      {
         id: '190715000003',
         date: '15/07/2019',
         time: '06:11:11',
         type: 'Sale',
         amount: 1500,
         status: 'Failed',
         discount: 8,
         fee_charge: 2,
         depository_institution: 'HBL',
         description: 'Sold goods to John Doe',
      },
      {
         id: '190715000004',
         date: '15/07/2019',
         time: '08:11:11',
         type: 'Transfer',
         amount: 30000,
         status: 'Successful',
         discount: 0,
         fee_charge: 0,
         depository_institution: 'Interbanking',
         description: 'Transfer to John Doe for project investment',
      },
      {
         id: '190715000005',
         date: '15/07/2019',
         time: '04:11:11',
         type: 'Purchased',
         amount: 40000,
         status: 'Successful',
         discount: 0,
         fee_charge: 0,
         depository_institution: 'Interbanking',
         description: 'Purchased new mobile phone',
      },
      {
         id: '190715000004',
         date: '15/07/2019',
         time: '08:11:11',
         type: 'Transfer',
         amount: 30000,
         status: 'Successful',
         discount: 0,
         fee_charge: 0,
         depository_institution: 'Interbanking',
         description: 'Transfer to John Doe for project investment',
      },
      {
         id: '190715000005',
         date: '15/07/2019',
         time: '04:11:11',
         type: 'Purchased',
         amount: 40000,
         status: 'Successful',
         discount: 0,
         fee_charge: 0,
         depository_institution: 'Interbanking',
         description: 'Purchased new mobile phone',
      },
      {
         id: '190715000004',
         date: '15/07/2019',
         time: '08:11:11',
         type: 'Transfer',
         amount: 30000,
         status: 'Successful',
         discount: 0,
         fee_charge: 0,
         depository_institution: 'Interbanking',
         description: 'Transfer to John Doe for project investment',
      },
      {
         id: '190715000005',
         date: '15/07/2019',
         time: '04:11:11',
         type: 'Purchased',
         amount: 40000,
         status: 'Successful',
         discount: 0,
         fee_charge: 0,
         depository_institution: 'Interbanking',
         description: 'Purchased new mobile phone',
      },
      {
         id: '190715000004',
         date: '15/07/2019',
         time: '08:11:11',
         type: 'Transfer',
         amount: 30000,
         status: 'failed',
         discount: 0,
         fee_charge: 0,
         depository_institution: 'Interbanking',
         description: 'Transfer to John Doe for project investment',
      },
      {
         id: '190715000005',
         date: '15/07/2019',
         time: '04:11:11',
         type: 'Purchased',
         amount: 40000,
         status: 'Successful',
         discount: 0,
         fee_charge: 0,
         depository_institution: 'Interbanking',
         description: 'Purchased new mobile phone',
      },
   ];

   // Pagination state and configuration
   const [currentPage, setCurrentPage] = useState(1);
   const recordsPerPage = 10;
   const totalPages = Math.ceil(transactions.length / recordsPerPage);

   const handlePageChange = (page) => {
      setCurrentPage(page);
   };

   // Slice the transactions array dynamically to show only the current page's records
   const currentRecords = transactions.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

   return (
      <div className="p-2 -ml-2 bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white min-h-screen">
         {/* Filters Section */}
         <div className="flex flex-wrap items-center gap-4 mb-6">
            <select className="dark:bg-slate-700 focus:outline-none dark:border-slate-700 border border-gray-300 rounded-lg p-2 w-full md:w-1/6">
               <option>Status</option>
               <option>Successful</option>
               <option>Failed</option>
            </select>
            <input
               type="text"
               placeholder="Transaction ID"
               className="dark:bg-slate-700 focus:outline-none dark:border-slate-700 border border-gray-300 rounded-lg p-2 w-full md:w-1/6"
            />
            <input
               type="date"
               className="dark:bg-slate-700 focus:outline-none dark:border-slate-700 border border-gray-300 rounded-lg p-2 w-full md:w-1/6"
            />
            <button className="bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700">Search</button>
         </div>

         {/* Transactions Table */}
         <div className="bg-slate-300 text-black dark:bg-[#123150] dark:text-white rounded-lg shadow-md overflow-x-auto  text-sm">
            <table className="table-auto w-full text-left border-collapse">
               <thead className="bg-gray-400 dark:bg-[#1e4368] text-sm uppercase">
                  <tr>
                     <th className="p-4">Transaction ID</th>
                     <th className="p-4">Date</th>
                     <th className="p-4">Time</th>
                     <th className="p-4">Transaction Type</th>
                     <th className="p-4">Amount</th>
                     <th className="p-4">Status</th>
                     <th className="p-4">Discount</th>
                     <th className="p-4">Fee/Charge</th>
                     <th className="p-4">Depository Institute</th>
                     <th className="p-4">Description</th>
                  </tr>
               </thead>
               <tbody>
                  {currentRecords.map((transaction, index) => (
                     <tr key={index} className="border-b hover:bg-slate-400 dark:hover:bg-[#204972]">
                        <td className="p-4">{transaction.id}</td>
                        <td className="p-4">{transaction.date}</td>
                        <td className="p-4">{transaction.time}</td>
                        <td className="p-4">{transaction.type}</td>
                        <td className="p-4">{transaction.amount}</td>
                        <td className="p-4">
                           <span
                              className={`px-2 py-1 rounded-lg text-white ${
                                 transaction.status === 'Successful' ? 'bg-green-600' : 'bg-red-600'
                              }`}
                           >
                              {transaction.status}
                           </span>
                        </td>
                        <td className="p-4">{transaction.discount} %</td>
                        <td className="p-4">{transaction.fee_charge}</td>
                        <td className="p-4">{transaction.depository_institution}</td>
                        <td className="p-4">{transaction.description}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         <div className="flex justify-between items-center gap-4 mt-4">
            {/* Pagination Info */}
            <p className="text-gray-400 text-sm">
               {`Showing ${(currentPage - 1) * recordsPerPage + 1}-${Math.min(
                  currentPage * recordsPerPage,
                  transactions.length
               )} of ${transactions.length} transactions`}
            </p>
            {/* Pagination Buttons */}
            <div className="flex items-center gap-2 ">
               {Array.from({ length: totalPages }, (_, i) => (
                  <button
                     key={i}
                     className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === i + 1
                           ? 'bg-purple-600 text-white hover:bg-purple-700'
                           : 'bg-purple-300 text-white hover:bg-purple-400'
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
};

export default TransactionList;
