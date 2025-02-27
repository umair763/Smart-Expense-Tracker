import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function TransactionGraph({isTheme}) {
   // Sample Transaction Data
   const transactions = [
      {
         transactionId: 'T001',
         date: '2024-11-28',
         time: '12:00',
         transactionType: 'Purchase',
         amount: 100,
         status: 'Completed',
         discount: 10,
         fee: 5,
         depository: 'Bank A',
         description: 'Item purchase',
      },
      {
         transactionId: 'T002',
         date: '2024-11-29',
         time: '14:30',
         transactionType: 'sale',
         amount: 50,
         status: 'Completed',
         discount: 5,
         fee: 2,
         depository: 'Bank B',
         description: 'Item sale',
      },
      {
         transactionId: 'T003',
         date: '2024-11-29',
         time: '16:00',
         transactionType: 'Purchase',
         amount: 200,
         status: 'Completed',
         discount: 20,
         fee: 10,
         depository: 'Bank C',
         description: 'Item purchase',
      },
      {
         transactionId: 'T004',
         date: '2024-11-28',
         time: '10:00',
         transactionType: 'Transfer',
         amount: 300,
         status: 'Completed',
         discount: 30,
         fee: 15,
         depository: 'Bank A',
         description: 'Transfer fee',
      },
      // Add more transactions as needed
   ];

   // Aggregate transaction data by type (sum the amounts by type)
   const aggregatedData = transactions.reduce((acc, transaction) => {
      const { transactionType, amount } = transaction;
      if (acc[transactionType]) {
         acc[transactionType] += amount;
      } else {
         acc[transactionType] = amount;
      }
      return acc;
   }, {});

   // Prepare data for the chart
   const data = Object.keys(aggregatedData).map((type) => ({
      name: type,
      value: aggregatedData[type],
   }));

   return (
      <div className="bg-slate-200 dark:bg-slate-500 dark:text-white text-black p-6 rounded-lg shadow-md w-full">
         {/* Title */}
         <h2 className="text-lg font-semibold mb-4">Transaction Amount by Type</h2>

         {/* Bar Chart */}
         <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 5, bottom: 10, left: 0 }}>
               <XAxis dataKey="name" tick={{ fill: 'black', fontSize: 12 }} />
               <YAxis tick={{ fill: 'black', fontSize: 12 }} />
               <Tooltip
                  contentStyle={{
                     backgroundColor: '#1a1a2e',
                     border: 'none',
                     borderRadius: '8px',
                     color: 'white',
                  }}
               />
               <Bar dataKey="value" fill="#a78bfa" barSize={30} radius={[4, 4, 0, 0]} />
            </BarChart>
         </ResponsiveContainer>
      </div>
   );
}

export default TransactionGraph;
