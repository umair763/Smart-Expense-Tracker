import {React, useState} from 'react';
import { FaFileInvoiceDollar, FaChartPie } from 'react-icons/fa';
import AddExpenseForm from './AddExpenseForm';

const AddExpenseAndReport = () => {
   const [isAddFormVisible, setIsAddFormVisible] = useState(false);

   const handleToggleAddExpenseForm = (prev) => {
      setIsAddFormVisible(!prev);
      console.log(prev);
   };

   return (
      <>
         <div className="p-6 bg-slate-200 dark:bg-[#00203FFF] dark:text-white text-black rounded-md w-full">
            <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
            <div className="flex justify-center w-full">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                  {/* New Expense Button */}
                  <button
                     className="flex items-center p-4 bg-teal-300 dark:bg-teal-500 dark:hover:bg-teal-400 rounded-lg shadow-md hover:bg-teal-400 transition"
                     onClick={() => handleToggleAddExpenseForm(isAddFormVisible)}
                  >
                     <div className="w-10 h-10 flex items-center justify-center text-white rounded-full bg-pink-600 mr-4">
                        <FaFileInvoiceDollar />
                     </div>
                     <span className="text-sm font-medium">+ New expense</span>
                  </button>

                  {/* Create Report Button */}
                  <button className="flex items-center p-4 bg-teal-300 dark:bg-teal-500 dark:hover:bg-teal-400 rounded-lg shadow-md hover:bg-teal-400 transition">
                     <div className="w-10 h-10 flex items-center justify-center text-white rounded-full bg-teal-600 mr-4">
                        <FaChartPie />
                     </div>
                     <span className="text-sm font-medium">+ Create report</span>
                  </button>
               </div>
            </div>
            {/* Add Expense Form */}
            {isAddFormVisible && <AddExpenseForm onClose={handleToggleAddExpenseForm} />}
         </div>
      </>
   );
};

export default AddExpenseAndReport;
