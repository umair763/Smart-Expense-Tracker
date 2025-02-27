import React from 'react';

function TrackFinance() {
   const data = [
      { label: 'Food and grocery', value: 872400, maxValue: 1500000 },
      { label: 'Shopping', value: 1378200, maxValue: 1500000 },
      { label: 'House Rent', value: 928500, maxValue: 1500000 },
      { label: 'Commute', value: 420700, maxValue: 1500000 },
   ];
// bg-[#00203FFF] Approved color for background of the graphs
   return (
      <div className="bg-slate-200 dark:bg-[#00203FFF] dark:text-white text-black p-4 sm:p-6 rounded-lg shadow-md w-full sm:w-full md:w-full ">
         <h2 className="text-lg sm:text-xl font-semibold mb-4 ">Track your Finance</h2>
         <div className="space-y-4">
            {data.map((item, index) => (
               <div key={index}>
                  <div className="flex justify-between mb-2 text-xs sm:text-sm md:text-md ">
                     <span>{item.label}</span>
                     <span>{item.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-500 rounded-full h-1 sm:h-2">
                     <div
                        className="bg-green-300 h-full rounded-full text-xs sm:text-sm md:text-md lg:text-lg "
                        style={{
                           width: `${(item.value / item.maxValue) * 100}%`,
                        }}
                     ></div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

export default TrackFinance;
