import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

function WeeklyReportBarGraph() {
   // Sample Data
   const data = [
      { date: 'May 12', income: 20000, spendings: 30000 },
      { date: 'May 13', income: 60000, spendings: 23040 },
      { date: 'May 14', income: 40000, spendings: 50000 },
      { date: 'May 15', income: 30000, spendings: 60000 },
      { date: 'May 16', income: 70000, spendings: 90000 },
      { date: 'May 17', income: 50000, spendings: 80000 },
   ];

   return (
      <div className="bg-slate-200 dark:bg-gray-500 dark:text-white text-black rounded-lg shadow-md p-6 w-full">
         {/* Title and Filter */}
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Expenses statistics</h2>
            <button className="text-gray-500 dark:text-white text-sm font-medium">Week ▼</button>
         </div>

         {/* Chart */}
         <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
               <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
               <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'black' }} axisLine={false} tickLine={false} />
               <YAxis
                  tick={{ fontSize: 12, fill: 'black' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
               />
               <Tooltip
                  contentStyle={{
                     backgroundColor: '#6b7280',
                     borderRadius: '8px',
                     color: '#fff',
                     border: 'none',
                  }}
                  formatter={(value) => `$${value}`}
               />
               <Line type="monotone" dataKey="income" stroke="#000000" strokeWidth={2} dot={false} />
               <Line type="monotone" dataKey="spendings" stroke="#fb7185" strokeWidth={2} dot={false} />
            </LineChart>
         </ResponsiveContainer>
      </div>
   );
}

export default WeeklyReportBarGraph;
