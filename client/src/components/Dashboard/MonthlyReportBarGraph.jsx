import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function MonthlyReportBarGraph({ isTheme }) {
   // Sample Data for the Graph
   const data = [
      { name: 'Accommodation', value: 40 },
      { name: 'Comms', value: 15 },
      { name: 'Services', value: 100 },
      { name: 'Food', value: 80 },
      { name: 'Fuel', value: 30 },
   ];

   return (
      <div className="bg-slate-200 dark:bg-[#00203FFF] dark:text-white text-black p-6 rounded-lg shadow-md w-full">
         {/* Title */}
         <h2 className="text-lg font-semibold mb-4">Day-to-Day Expenses</h2>

         {/* Bar Chart */}
         <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 10, right: 5, bottom: 10, left: 0 }}>
               <XAxis dataKey="name" tick={{ fill: isTheme ? 'white' : 'black', fontSize: 12 }} />
               <YAxis tick={{ fill: isTheme ? 'white' : 'black', fontSize: 12 }} />
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

export default MonthlyReportBarGraph;
// className = 'text-black dark:text-white';
