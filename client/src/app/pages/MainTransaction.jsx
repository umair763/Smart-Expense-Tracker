import { useState } from 'react';
import TransactionsRecord from '../../components/Trasactions/TransactionsRecord';
import AddTransactionAndReport from '../../components/Trasactions/AddTransactionAndReport';
import TransactionGraph from '../../components/Trasactions/TransactionGraph';

const MainTransaction = ({ isTheme }) => {
   return (
      <div className="w-full">
         {/* Top Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Transaction Graph (1/2 width) */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
               <TransactionGraph isTheme={isTheme} />
            </div>

            {/* Add Transaction Form (1/2 width) */}
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
