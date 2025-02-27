import React from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';

function Categories() {
   const data = [
      { name: 'Personal', value: 26, color: '#ff6b6b' },
      { name: 'Shopping', value: 30, color: '#845ec2' },
      { name: 'Eating Out', value: 35, color: '#ff9612' },
      { name: 'Holidays', value: 10, color: '#00c9a7' },
   ];

   const transactions = [
      { label: 'Personal', value: '-500 $', count: '14 transactions', color: '#ff6b6b' },
      { label: 'Shopping', value: '-410 $', count: '10 transactions', color: '#845ec2' },
      { label: 'Eating Out', value: '-325 $', count: '7 transactions', color: '#ff9612' },
      { label: 'Holidays', value: '-100 $', count: '2 transactions', color: '#00c9a7' },
   ];

   return (
      <div className="bg-slate-200 dark:bg-[#00203FFF] dark:text-white text-black p-3 sm:p-4 rounded-lg shadow-md w-full sm:w-full md:w-full ">
         <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Categories</h2>

         {/* Donut Chart */}
         <div className="flex justify-center mb-6">
            <PieChart width={170} height={170} className="sm:w-[200px] sm:h-[200px] w-full h-full">
               <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={5}>
                  {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
               </Pie>
            </PieChart>
         </div>

         {/* Transaction List */}
         <div className="space-y-3 sm:space-y-4 ">
            {transactions.map((transaction, index) => (
               <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                     <div
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2 sm:mr-3 "
                        style={{ backgroundColor: transaction.color }}
                     ></div>
                     <div>
                        <p className="text-xs sm:text-sm md:text-md sm:p-0">{transaction.label}</p>
                        <p className="text-xs sm:text-sm md:text-md text-gray-400 ">{transaction.count}</p>
                     </div>
                  </div>
                  <p className="text-red-500 text-xs sm:text-sm font-bold">{transaction.value}</p>
               </div>
            ))}
         </div>
      </div>
   );
}

export default Categories;
