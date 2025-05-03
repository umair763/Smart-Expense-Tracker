import React, { useState, useEffect } from 'react';
import AddIncomeForm from './AddIncomeForm';

function AddIncomeAndReport() {
   const [showModal, setShowModal] = useState(false);
   const [incomeStats, setIncomeStats] = useState({
      totalIncome: 0,
      recentIncome: [],
   });
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);

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
      <div className="mt-8 p-6 bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white rounded-lg shadow-md">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Income Overview</h2>
            <button
               onClick={openModal}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
               Add New Income
            </button>
         </div>

         {isLoading ? (
            <p>Loading income statistics...</p>
         ) : error ? (
            <p className="text-red-500">{error}</p>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
