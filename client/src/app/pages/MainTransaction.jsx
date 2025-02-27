import { useState } from 'react';
import TransactionsRecord from './../../components/Trasactions/TransactionsRecord';
import AddTransactionAndReport from './../../components/Trasactions/AddTransactionAndReport';
import TransactionGraph from './../../components/Trasactions/TransactionGraph';

const MainTransaction = (isTheme) => {
   return (
      <div className="sm:p-3 lg:p-4 w-full p-1 mt-5">
         {/* Top Section */}
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
            {/* <WeeklyReportBarGraph /> */}
            <TransactionGraph isTheme={isTheme} />

            {/* Add Transaction and Report */}
            <div className="">
               <AddTransactionAndReport />
            </div>
         </div>

         {/* Transactions Record */}
         <div className="mt-3 ">
            <TransactionsRecord />
         </div>
      </div>
   );
};

export default MainTransaction;
