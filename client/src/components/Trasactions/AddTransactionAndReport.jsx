import React, { useState, useEffect, useContext } from 'react';
import { FaExchangeAlt, FaChartLine, FaPlus, FaSpinner, FaSync } from 'react-icons/fa';
import { ThemeContext } from '../../app/context/ThemeContext';
import AddTransactionForm from './AddTransactionForm';
import { downloadTransactionReport } from '../../services/reportService';
import { toast } from 'react-toastify';
import axios from 'axios';

function AddTransactionAndReport() {
   const [showModal, setShowModal] = useState(false);
   const [isGeneratingReport, setIsGeneratingReport] = useState(false);
   const [transactionStats, setTransactionStats] = useState({
      totalTransactions: 0,
      recentTransactions: [],
   });
   const [isLoading, setIsLoading] = useState(true);
   const [isRefreshing, setIsRefreshing] = useState(false);
   const [error, setError] = useState(null);
   const { isDarkMode } = useContext(ThemeContext);

   useEffect(() => {
      fetchTransactionStats();

      // Set up polling for auto-refresh every 30 seconds
      const interval = setInterval(() => {
         fetchTransactionStats(false); // Silent refresh
      }, 30000);

      // Clean up interval on component unmount
      return () => clearInterval(interval);
   }, []);

   const fetchTransactionStats = async (showLoadingState = true) => {
      try {
         const token = localStorage.getItem('token');
         if (!token) {
            console.error('No token found in localStorage.');
            setError('You need to be logged in.');
            return;
         }

         if (showLoadingState) {
            setIsLoading(true);
         } else {
            setIsRefreshing(true);
         }

         // Use pagination parameters to get most recent transactions first
         const response = await axios.get('http://localhost:5000/api/transactions?page=1&limit=10', {
            headers: {
               Authorization: `Bearer ${token}`,
            },
            params: {
               sort: 'date,-1', // Sort by date descending (newest first)
            },
         });

         if (!response.data) {
            throw new Error('Failed to fetch transaction statistics');
         }

         console.log('Fetched transaction stats:', response.data);

         // Make sure transactions are sorted by most recent first
         const transactions = response.data.transactions || [];

         // Sort transactions by date and time, most recent first
         const sortedTransactions = [...transactions].sort((a, b) => {
            // First compare by date (most recent first)
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            if (dateB - dateA !== 0) return dateB - dateA;

            // If dates are the same, compare by time (most recent first)
            const timeA = a.time || '00:00';
            const timeB = b.time || '00:00';
            return timeB.localeCompare(timeA);
         });

         // Extract data from response
         const data = {
            totalTransactions: response.data.totalTransactions || 0,
            recentTransactions: sortedTransactions,
         };

         setTransactionStats(data);
      } catch (err) {
         console.error('Error fetching transaction stats:', err);
         setError(err.message || 'Failed to fetch transaction statistics');
      } finally {
         setIsLoading(false);
         setIsRefreshing(false);
      }
   };

   const openModal = () => {
      setShowModal(true);
   };

   const closeModal = () => {
      setShowModal(false);
      // Refresh stats after adding new transaction
      fetchTransactionStats();
   };

   const handleFormSubmit = (formData) => {
      console.log('Form submitted with data:', formData);
      closeModal();
   };

   const handleRefresh = () => {
      fetchTransactionStats();
      toast.info('Transaction data refreshed');
   };

   const handleGenerateReport = async () => {
      if (isGeneratingReport) return; // Prevent multiple clicks

      setIsGeneratingReport(true);
      try {
         // Check if token exists
         const token = localStorage.getItem('token');
         if (!token) {
            toast.error('Authentication required. Please log in again.');
            return;
         }

         console.log('Generating transaction report for all time');

         // Download report without any date filters to get all transactions
         await downloadTransactionReport({});
         toast.success('Transaction report downloaded successfully!');
      } catch (error) {
         console.error('Error generating transaction report:', error);

         // Handle specific error cases
         if (error.response) {
            if (error.response.status === 404) {
               toast.warning('No transaction records found.');
            } else if (error.response.status === 401) {
               toast.error('Your session has expired. Please log in again.');
            } else {
               // Try to read error message from response
               let errorMessage = 'Failed to generate report';
               try {
                  // Read error message from Blob if available
                  if (error.response.data instanceof Blob) {
                     const text = await error.response.data.text();
                     const parsed = JSON.parse(text);
                     errorMessage = parsed.message || errorMessage;
                  } else if (error.response.data && error.response.data.message) {
                     errorMessage = error.response.data.message;
                  }
               } catch (e) {
                  console.error('Error parsing error response:', e);
               }
               toast.error(errorMessage);
            }
         } else {
            toast.error(error.message || 'Failed to generate report');
         }
      } finally {
         setIsGeneratingReport(false);
      }
   };

   // Format currency
   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
      }).format(amount);
   };

   // Get the most recent transaction amount
   const getRecentTransactionAmount = () => {
      if (transactionStats.recentTransactions && transactionStats.recentTransactions.length > 0) {
         return formatCurrency(transactionStats.recentTransactions[0].amount);
      }
      return '$0.00';
   };

   // Get most recent transaction date/time for display
   const getRecentTransactionDate = () => {
      if (transactionStats.recentTransactions && transactionStats.recentTransactions.length > 0) {
         const transaction = transactionStats.recentTransactions[0];
         const date = new Date(transaction.date);
         return date.toLocaleDateString() + (transaction.time ? ` ${transaction.time}` : '');
      }
      return 'No transactions';
   };

   return (
      <div className="p-6 bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white rounded-lg shadow-md">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Quick Access</h2>
            <button
               onClick={handleRefresh}
               className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors"
               title="Refresh data"
               disabled={isRefreshing}
            >
               <FaSync className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
         </div>

         <div className="flex justify-center w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
               {/* Add New Transaction Button */}
               <button
                  className={`group flex items-center p-5 rounded-xl shadow-lg transition-all duration-300 ${
                     isDarkMode
                        ? 'bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                  } transform hover:-translate-y-1`}
                  onClick={openModal}
               >
                  <div
                     className={`w-12 h-12 flex items-center justify-center text-white rounded-full 
                     ${isDarkMode ? 'bg-blue-700 group-hover:bg-blue-600' : 'bg-indigo-700 group-hover:bg-indigo-600'}
                     mr-4 transition-all duration-300 shadow-md`}
                  >
                     <FaExchangeAlt size={18} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-white font-medium">New Transaction</span>
                     <span className="text-xs text-blue-100 opacity-80">Add a new transaction record</span>
                  </div>
                  <FaPlus className="ml-auto text-white opacity-70" />
               </button>

               {/* Create Report Button */}
               <button
                  className={`group flex items-center p-5 rounded-xl shadow-lg transition-all duration-300 ${
                     isDarkMode
                        ? 'bg-gradient-to-r from-purple-900 to-pink-900 hover:from-purple-800 hover:to-pink-800'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  } transform hover:-translate-y-1`}
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
               >
                  <div
                     className={`w-12 h-12 flex items-center justify-center text-white rounded-full 
                     ${isDarkMode ? 'bg-purple-700 group-hover:bg-purple-600' : 'bg-pink-700 group-hover:bg-pink-600'}
                     mr-4 transition-all duration-300 shadow-md`}
                  >
                     {isGeneratingReport ? <FaSpinner className="animate-spin" size={18} /> : <FaChartLine size={18} />}
                  </div>
                  <div className="flex flex-col">
                     <span className="text-white font-medium">Create Report</span>
                     <span className="text-xs text-purple-100 opacity-80">Generate transaction CSV</span>
                  </div>
                  {!isGeneratingReport && <FaPlus className="ml-auto text-white opacity-70" />}
               </button>
            </div>
         </div>

         {/* Transaction stats cards */}
         {isLoading ? (
            <p className="mt-6">Loading transaction statistics...</p>
         ) : error ? (
            <p className="mt-6 text-red-500">{error}</p>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
               {/* Total Transactions Card */}
               <div className="bg-slate-100 dark:bg-[#0c2742] p-4 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-2">Total Transactions</h3>
                  <p className="text-3xl font-bold text-indigo-500">{transactionStats.totalTransactions || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">All time</p>
               </div>

               {/* Recent Transaction Card */}
               <div className="bg-slate-100 dark:bg-[#0c2742] p-4 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-2">Recent Transaction</h3>
                  <p className="text-3xl font-bold text-indigo-500">{getRecentTransactionAmount()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{getRecentTransactionDate()}</p>
               </div>
            </div>
         )}

         {/* Render the modal if showModal is true */}
         {showModal && <AddTransactionForm onClose={closeModal} onTransactionAdded={handleFormSubmit} />}
      </div>
   );
}

export default AddTransactionAndReport;
