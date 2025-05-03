import { React, useState, useContext } from 'react';
import { FaFileInvoiceDollar, FaChartPie, FaPlus } from 'react-icons/fa';
import { ThemeContext } from '../../app/context/ThemeContext';
import ExpenseFormModal from './ExpenseFormModal';

const AddExpenseAndReport = () => {
   const [isAddFormVisible, setIsAddFormVisible] = useState(false);
   const { isDarkMode } = useContext(ThemeContext);

   const handleToggleAddExpenseForm = (prev) => {
      setIsAddFormVisible(!prev);
   };

   return (
      <>
         <div className="p-6 rounded-md w-full">
            <h2 className="text-xl font-semibold mb-6">Quick Access</h2>
            <div className="flex justify-center w-full">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {/* New Expense Button */}
                  <button
                     className={`group flex items-center p-5 rounded-xl shadow-lg transition-all duration-300 ${
                        isDarkMode
                           ? 'bg-gradient-to-r from-indigo-900 to-blue-900 hover:from-indigo-800 hover:to-blue-800'
                           : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                     } transform hover:-translate-y-1`}
                     onClick={() => handleToggleAddExpenseForm(isAddFormVisible)}
                  >
                     <div
                        className={`w-12 h-12 flex items-center justify-center text-white rounded-full 
                        ${
                           isDarkMode
                              ? 'bg-blue-700 group-hover:bg-blue-600'
                              : 'bg-indigo-700 group-hover:bg-indigo-600'
                        }
                        mr-4 transition-all duration-300 shadow-md`}
                     >
                        <FaFileInvoiceDollar size={18} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-white font-medium">New Expense</span>
                        <span className="text-xs text-blue-100 opacity-80">Add a new expense record</span>
                     </div>
                     <FaPlus className="ml-auto text-white opacity-70" />
                  </button>

                  {/* Create Report Button */}
                  <button
                     className={`group flex items-center p-5 rounded-xl shadow-lg transition-all duration-300 ${
                        isDarkMode
                           ? 'bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800'
                           : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
                     } transform hover:-translate-y-1`}
                  >
                     <div
                        className={`w-12 h-12 flex items-center justify-center text-white rounded-full 
                        ${
                           isDarkMode
                              ? 'bg-purple-700 group-hover:bg-purple-600'
                              : 'bg-purple-700 group-hover:bg-purple-600'
                        }
                        mr-4 transition-all duration-300 shadow-md`}
                     >
                        <FaChartPie size={18} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-white font-medium">Create Report</span>
                        <span className="text-xs text-blue-100 opacity-80">Generate expense reports</span>
                     </div>
                     <FaPlus className="ml-auto text-white opacity-70" />
                  </button>
               </div>
            </div>
         </div>

         {/* Expense Form Modal */}
         {isAddFormVisible && <ExpenseFormModal onClose={() => handleToggleAddExpenseForm(true)} />}
      </>
   );
};

export default AddExpenseAndReport;
