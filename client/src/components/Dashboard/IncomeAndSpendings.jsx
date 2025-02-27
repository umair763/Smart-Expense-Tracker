import React from 'react';

function IncomeAndSpendings() {
   return (
      <div className="flex flex-row items-stretch w-full gap-5 lg:mt-5">
         {/* Income Card */}
         <div className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg border border-gray-200 w-full lg:h-4/5 md:w-1/2">
            <div className="flex items-center mb-2">
               {/* Wavy Line for Income */}
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="green"
                  className="w-5 h-5"
               >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c1.5-4 4.5-4 6 0s4.5 4 6 0 4.5-4 6-0" />
               </svg>
               <span className="ml-1 text-sm md:text-base font-medium text-gray-500">Income</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-gray-800 break-words text-center overflow-hidden text-ellipsis">
               $5,700
            </div>
         </div>

         {/* Spending Card */}
         <div className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg border border-gray-200 w-full  lg:h-4/5 md:w-1/2">
            <div className="flex items-center mb-2">
               {/* Wavy Line for Spending */}
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="red"
                  className="w-5 h-5"
               >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c1.5-4 4.5-4 6 0s4.5-4 6 0 4.5-4 6-0" />
               </svg>
               <span className="ml-1 text-sm md:text-base font-medium text-gray-500">Spendings</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-gray-800 break-words text-center overflow-hidden text-ellipsis">
               $2,254
            </div>
         </div>
      </div>
   );
}

export default IncomeAndSpendings;
