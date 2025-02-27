import React from 'react';

function AvaiableBalanceCard() {
   return (
      <div className="bg-sky-200 shadow-lg rounded-xl p-3 mt-2 flex flex-col sm:w-full xm:w-11/12">
         <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500  sm:text-sm text-xs">Available balance</span>
            <div className="flex items-center">
               <span className="text-gray-500 text-xs sm:text-sm mr-2">Active</span>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-500 peer-checked:after:translate-x-4 peer-checked:after:bg-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
               </label>
            </div>
         </div>
         <div className="text-2xl font-bold mb-4 sm:text-3xl md:text-4xl">$12,234</div>
         <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs sm:text-lg">**** 4532</span>
            <img
               src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
               alt="Mastercard Logo"
               className="w-12"
            />
         </div>
      </div>
   );
}

export default AvaiableBalanceCard;
