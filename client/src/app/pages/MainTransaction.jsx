import { useState } from 'react';
import TransactionsRecord from '../../components/Trasactions/TransactionsRecord';
import AddTransactionAndReport from '../../components/Trasactions/AddTransactionAndReport';
import TransactionGraph from '../../components/Trasactions/TransactionGraph';

const MainTransaction = ({ isTheme }) => {
   return (
      <div className="w-full">
         {/* Top Section */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Transaction Graph (2/3 width) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
               <TransactionGraph isTheme={isTheme} />
            </div>

            {/* Add Transaction Form (1/3 width) */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
               <AddTransactionAndReport />
            </div>
         </div>

         {/* Transactions Record - Full Width */}
         <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <TransactionsRecord />
         </div>
      </div>
   );
};

export default MainTransaction;
