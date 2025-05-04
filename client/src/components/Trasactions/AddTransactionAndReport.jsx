import { React, useState, useContext } from 'react';
import { FaExchangeAlt, FaChartBar, FaPlus } from 'react-icons/fa';
import { ThemeContext } from '../../app/context/ThemeContext';
import AddTransactionForm from './AddTransactionForm';

const AddTransactionAndReport = () => {
   const [isAddTransactionVisible, setIsAddTransactionVisible] = useState(false);
   const { isDarkMode } = useContext(ThemeContext);

   // Toggle the visibility of the AddTransactionForm
   const HandleToggleAddTransaction = () => {
      setIsAddTransactionVisible((prev) => !prev); // Automatically toggles the previous state
   };

   return (
      <div className="p-6 bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white rounded-md w-full">
         <h2 className="text-xl font-semibold mb-6">Quick Access</h2>
         <div className="flex justify-center w-full">
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 w-full">
               {/* Add Transaction Button */}
               <button
                  className={`group flex items-center p-5 rounded-xl shadow-lg transition-all duration-300 ${
                     isDarkMode
                        ? 'bg-gradient-to-r from-cyan-900 to-blue-900 hover:from-cyan-800 hover:to-blue-800'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                  } transform hover:-translate-y-1`}
                  onClick={HandleToggleAddTransaction}
               >
                  <div
                     className={`w-12 h-12 flex items-center justify-center text-white rounded-full 
                     ${isDarkMode ? 'bg-blue-700 group-hover:bg-blue-600' : 'bg-cyan-700 group-hover:bg-cyan-600'}
                     mr-4 transition-all duration-300 shadow-md`}
                  >
                     <FaExchangeAlt size={18} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-white font-medium">Add Transaction</span>
                     <span className="text-xs text-blue-100 opacity-80">Record new transaction</span>
                  </div>
                  <FaPlus className="ml-auto text-white opacity-70" />
               </button>

               {/* View Reports Button */}
               <button
                  className={`group flex items-center p-5 rounded-xl shadow-lg transition-all duration-300 ${
                     isDarkMode
                        ? 'bg-gradient-to-r from-violet-900 to-purple-900 hover:from-violet-800 hover:to-purple-800'
                        : 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600'
                  } transform hover:-translate-y-1`}
               >
                  <div
                     className={`w-12 h-12 flex items-center justify-center text-white rounded-full 
                     ${
                        isDarkMode
                           ? 'bg-purple-700 group-hover:bg-purple-600'
                           : 'bg-violet-700 group-hover:bg-violet-600'
                     }
                     mr-4 transition-all duration-300 shadow-md`}
                  >
                     <FaChartBar size={18} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-white font-medium">View Reports</span>
                     <span className="text-xs text-purple-100 opacity-80">Generate transaction reports</span>
                  </div>
                  <FaPlus className="ml-auto text-white opacity-70" />
               </button>
            </div>
         </div>

         {/* Add Transaction Form Modal */}
         {isAddTransactionVisible && <AddTransactionForm onClose={HandleToggleAddTransaction} />}
      </div>
   );
};

export default AddTransactionAndReport;
