import React from 'react';
import IncomeRecord from '../../components/income/IncomeRecord';
import IncomeGraph from '../../components/income/IncomeGraph';
import IncomeCategories from '../../components/income/IncomeCategories';
import AddIncomeAndReport from '../../components/income/AddIncomeAndReport';

function MainIncome() {
   return (
      <div className="w-full">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Column - Tables and Forms (2/3 width on large screens) */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                  <AddIncomeAndReport />
               </div>
               <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                  <IncomeRecord />
               </div>
            </div>

            {/* Right Column - Graphs and Categories (1/3 width on large screens) */}
            <div className="space-y-6">
               <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                  <IncomeGraph />
               </div>
               <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                  <IncomeCategories />
               </div>
            </div>
         </div>
      </div>
   );
}

export default MainIncome;
