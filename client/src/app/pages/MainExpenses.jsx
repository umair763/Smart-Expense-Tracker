import React from 'react';
import ExpensesRecord from './../../components/Expenses/ExpensesRecord';
import TrackFinance from './../../components/Dashboard/TrackFinance';
import AddExpenseAndReport from './../../components/Expenses/AddExpenseAndReport';
import Categories from './../../components/Dashboard/Catagories';

function MainExpenses() {
   return (
      <div className="flex flex-col md:flex-row gap-6 p-1 mt-8">
         {/* Left Column */}
         <div className="flex-grow md:w-2/4 lg:w-2/4">
            <ExpensesRecord />
            <AddExpenseAndReport />
         </div>

         {/* Right Column */}
         <div className="flex-1 space-y-6 overflow-hidden mr-4 md:w-2/4 lg:w-2/4">
            <div>
               <TrackFinance />
            </div>
            <div>
               {/* <MonthlyReportBarGraph /> */}
               <Categories />
            </div>
         </div>
      </div>
   );
}

export default MainExpenses;
