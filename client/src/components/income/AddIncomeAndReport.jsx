import React, { useState, useEffect, useContext } from 'react';
import { FaMoneyBillWave, FaChartLine, FaPlus } from 'react-icons/fa';
import { ThemeContext } from '../../app/context/ThemeContext';
import AddIncomeForm from './AddIncomeForm';

function AddIncomeAndReport() {
   const [showModal, setShowModal] = useState(false);
   const [incomeStats, setIncomeStats] = useState({
      totalIncome: 0,
      recentIncome: [],
   });
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const { isDarkMode } = useContext(ThemeContext);

   useEffect(() => {
      fetchIncomeStats();
   }, []);

   const fetchIncomeStats = async () => {
      try {
         const token = localStorage.getItem('token');
         if (!token) {
            console.error('No token found in localStorage.');
            setError('You need to be logged in.');
            return;
         }

         setIsLoading(true);
         const response = await fetch('http://localhost:5000/api/incomes/stats', {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         if (!response.ok) {
            throw new Error('Failed to fetch income statistics');
         }

         const data = await response.json();
         console.log('Fetched income stats:', data);
         setIncomeStats(data);
      } catch (err) {
         console.error('Error fetching income stats:', err);
         setError(err.message || 'Failed to fetch income statistics');
      } finally {
         setIsLoading(false);
      }
   };

   const openModal = () => {
      setShowModal(true);
   };

   const closeModal = () => {
      setShowModal(false);
      // Refresh stats after adding new income
      fetchIncomeStats();
   };

   const handleFormSubmit = (formData) => {
      console.log('Form submitted with data:', formData);
      closeModal();
   };

   // Format currency
   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
      }).format(amount);
   };

   // Get the most recent income amount
   const getRecentIncomeAmount = () => {
      if (incomeStats.recentIncome && incomeStats.recentIncome.length > 0) {
         return formatCurrency(incomeStats.recentIncome[0].amount);
      }
      return '$0.00';
   };

   return (
      <div className="p-6 bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white rounded-lg shadow-md">
         <h2 className="text-xl font-semibold mb-6">Quick Access</h2>
         <div className="flex justify-center w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
               {/* Add New Income Button */}
               <button
                  className={`group flex items-center p-5 rounded-xl shadow-lg transition-all duration-300 ${
                     isDarkMode
                        ? 'bg-gradient-to-r from-green-900 to-teal-900 hover:from-green-800 hover:to-teal-800'
                        : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'
                  } transform hover:-translate-y-1`}
                  onClick={openModal}
               >
                  <div
                     className={`w-12 h-12 flex items-center justify-center text-white rounded-full 
                     ${isDarkMode ? 'bg-green-700 group-hover:bg-green-600' : 'bg-teal-700 group-hover:bg-teal-600'}
                     mr-4 transition-all duration-300 shadow-md`}
                  >
                     <FaMoneyBillWave size={18} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-white font-medium">New Income</span>
                     <span className="text-xs text-green-100 opacity-80">Add a new income record</span>
                  </div>
                  <FaPlus className="ml-auto text-white opacity-70" />
               </button>

               {/* Create Report Button */}
               <button
                  className={`group flex items-center p-5 rounded-xl shadow-lg transition-all duration-300 ${
                     isDarkMode
                        ? 'bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                  } transform hover:-translate-y-1`}
               >
                  <div
                     className={`w-12 h-12 flex items-center justify-center text-white rounded-full 
                     ${isDarkMode ? 'bg-blue-700 group-hover:bg-blue-600' : 'bg-indigo-700 group-hover:bg-indigo-600'}
                     mr-4 transition-all duration-300 shadow-md`}
                  >
                     <FaChartLine size={18} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-white font-medium">Create Report</span>
                     <span className="text-xs text-blue-100 opacity-80">Generate income reports</span>
                  </div>
                  <FaPlus className="ml-auto text-white opacity-70" />
               </button>
            </div>
         </div>

         {/* Income stats cards */}
         {isLoading ? (
            <p className="mt-6">Loading income statistics...</p>
         ) : error ? (
            <p className="mt-6 text-red-500">{error}</p>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
               {/* Total Income Card */}
               <div className="bg-slate-100 dark:bg-[#0c2742] p-4 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-2">Total Income</h3>
                  <p className="text-3xl font-bold text-green-500">{formatCurrency(incomeStats.totalIncome || 0)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">All time</p>
               </div>

               {/* Recent Income Card */}
               <div className="bg-slate-100 dark:bg-[#0c2742] p-4 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-2">Recent Income</h3>
                  <p className="text-3xl font-bold text-green-500">{getRecentIncomeAmount()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Last transaction</p>
               </div>
            </div>
         )}

         {/* Render the modal if showModal is true */}
         {showModal && <AddIncomeForm onClose={closeModal} onSubmit={handleFormSubmit} />}
      </div>
   );
}

export default AddIncomeAndReport;
