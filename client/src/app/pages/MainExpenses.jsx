import React from 'react';
import ExpensesRecord from '../../components/Expenses/ExpensesRecord';
import TrackFinance from '../../components/Dashboard/TrackFinance';
import AddExpenseAndReport from '../../components/Expenses/AddExpenseAndReport';
import Categories from '../../components/Dashboard/Catagories';

function MainExpenses() {
   return (
      <div className="w-full max-w-8xl mx-auto">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Tables and Forms (2/3 width on large screens) */}
            <div className="lg:col-span-2 space-y-6">
               <div className="card backdrop-blur-md">
                  <AddExpenseAndReport />
               </div>
               <div className="card backdrop-blur-md overflow-hidden">
                  <ExpensesRecord />
               </div>
            </div>

            {/* Right Column - Graphs and Categories (1/3 width on large screens) */}
            <div className="space-y-6">
               <div className="card backdrop-blur-md">
                  <TrackFinance />
               </div>
               <div className="card backdrop-blur-md">
                  <Categories />
               </div>
            </div>
         </div>
      </div>
   );
}

export default MainExpenses;
