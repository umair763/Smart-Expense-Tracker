import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import { RiEditLine, RiDeleteBinLine, RiFilterLine, RiCloseLine } from 'react-icons/ri';
import { ThemeContext } from '../../app/context/ThemeContext';
import { io } from 'socket.io-client';

const TransactionRecord = () => {
   const [transactions, setTransactions] = useState([]);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [isEditing, setIsEditing] = useState(false);
   const [editingTransaction, setEditingTransaction] = useState(null);
   const [isFiltered, setIsFiltered] = useState(false);
   const [refreshing, setRefreshing] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const { isDarkMode } = useContext(ThemeContext);
   const [activeFilters, setActiveFilters] = useState({ status: false, id: false, date: false });
   const [filters, setFilters] = useState({
      status: '',
      transactionId: '',
      date: '',
   });
   const [formData, setFormData] = useState({
      id: '',
      date: '',
      time: '',
      amount: '',
      status: '',
      discount: '',
      fee_charge: '',
      depository_institution: '',
      description: '',
      _id: '',
   });
   const [notification, setNotification] = useState(null);
   const [socket, setSocket] = useState(null);

   // Connect to Socket.IO server for MongoDB notifications
   useEffect(() => {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      // Socket connection events
      newSocket.on('connect', () => {
         console.log('Connected to notification server');
      });

      newSocket.on('disconnect', () => {
         console.log('Disconnected from notification server');
      });

      return () => {
         newSocket.disconnect();
      };
   }, []);

   // Listen for notifications related to transactions
   useEffect(() => {
      if (!socket) return;

      socket.on('notification', (data) => {
         // Only show notifications related to transactions
         if (data.collection === 'transactions') {
            setNotification(data);

            // Auto-dismiss notification after 5 seconds (increased from 4)
            setTimeout(() => {
               setNotification(null);
            }, 5000);

            // Refresh transactions list if this was a transaction operation
            if (['insert', 'update', 'delete'].includes(data.type)) {
               refreshTransactions();
            }
         }
      });

      return () => {
         socket.off('notification');
      };
   }, [socket]);

   // Memoize fetchTransactions to prevent unnecessary re-renders
   const fetchTransactions = useCallback(
      async (page, forceReset = false) => {
         setLoading(true);
         setError(null);
         try {
            // Get the authentication token
            const token = localStorage.getItem('token');

            if (!token) {
               setError('You need to be logged in to view transactions.');
               setLoading(false);
               return;
            }

            console.log('Fetching transactions with token:', token);
            console.log('Using filters:', filters);
            console.log('Is filtered:', isFiltered);
            console.log('Active filters:', activeFilters);

            // Build query parameters including filters
            let url = `http://localhost:5000/api/transactions?page=${page}&limit=10`;

            // Add individual filters to URL only if they exist and filtering is active
            if (isFiltered && !forceReset) {
               // Add only the filters that have values
               if (filters.status && filters.status.trim() !== '') {
                  url += `&status=${encodeURIComponent(filters.status.trim())}`;
               }

               if (filters.transactionId && filters.transactionId.trim() !== '') {
                  url += `&id=${encodeURIComponent(filters.transactionId.trim())}`;
               }

               if (filters.date && filters.date.trim() !== '') {
                  url += `&date=${encodeURIComponent(filters.date.trim())}`;
               }
            }

            console.log('Request URL:', url);

            // Include the token in the request headers
            const response = await axios.get(url, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            const data = response.data;
            console.log('Fetched transactions data:', data);

            setTransactions(data.transactions);
            setTotalPages(data.totalPages);
         } catch (error) {
            console.error('Error fetching transactions:', error);
            setError('Failed to load transactions. Please try again.');
         } finally {
            setLoading(false);
            setRefreshing(false);
         }
      },
      [filters, isFiltered, activeFilters]
   );

   // Handle page change - preserve filters when changing pages
   const handlePageChange = (page) => {
      setCurrentPage(page);
      fetchTransactions(page);
   };

   // Refresh transactions after adding a new one - preserve filters
   const refreshTransactions = () => {
      fetchTransactions(currentPage);
   };

   // Handle manual refresh with animation
   const handleRefresh = () => {
      setRefreshing(true);
      // Completely reset filters if they're active
      if (isFiltered) {
         // Reset the filter fields but keep them in the UI
         setFilters({
            status: '',
            transactionId: '',
            date: '',
         });
         setIsFiltered(false);
         setActiveFilters({ status: false, id: false, date: false });
      }
      // Force a refresh without filters
      fetchTransactions(1, true);
      setCurrentPage(1);
   };

   // Handle filter changes
   const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilters((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   // Apply filters
   const applyFilters = () => {
      // Check if any filter has a value
      const hasStatusFilter = filters.status && filters.status.trim() !== '';
      const hasIdFilter = filters.transactionId && filters.transactionId.trim() !== '';
      const hasDateFilter = filters.date && filters.date.trim() !== '';

      const hasAnyFilter = hasStatusFilter || hasIdFilter || hasDateFilter;

      // Update active filters state
      setActiveFilters({
         status: hasStatusFilter,
         id: hasIdFilter,
         date: hasDateFilter,
      });

      console.log('Applying filters:', {
         status: hasStatusFilter ? filters.status : 'not set',
         id: hasIdFilter ? filters.transactionId : 'not set',
         date: hasDateFilter ? filters.date : 'not set',
      });

      // Set filtered state and load data in one step
      if (hasAnyFilter) {
         setIsFiltered(true);
         setCurrentPage(1);
         // Immediate fetch after state update
         setTimeout(() => {
            fetchTransactions(1, false);
         }, 0);
      } else {
         // If no filters, reset immediately
         resetFilters();
      }
   };

   // Reset filters
   const resetFilters = () => {
      setFilters({
         status: '',
         transactionId: '',
         date: '',
      });
      setActiveFilters({ status: false, id: false, date: false });
      setIsFiltered(false);
      setCurrentPage(1);
      // Immediate fetch after state update
      setTimeout(() => {
         fetchTransactions(1, true);
      }, 0);
   };

   // Handle form input changes
   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
   };

   // Handle form submit for update
   const handleUpdateSubmit = async (e) => {
      e.preventDefault();

      try {
         const token = localStorage.getItem('token');

         if (!token) {
            setError('You need to be logged in to update transactions.');
            return;
         }

         console.log('Updating transaction with ID:', formData._id);
         console.log('Form data being sent:', formData);

         await axios.put(`http://localhost:5000/api/transactions/${formData._id}`, formData, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         // Close the edit form and refresh transactions
         setIsEditing(false);
         setEditingTransaction(null);
         refreshTransactions();
      } catch (error) {
         console.error('Error updating transaction:', error);
         console.error('Error details:', error.response ? error.response.data : 'No response data');
         // Remove alert - replaced by notification system
         setError('Failed to update transaction. Please try again.');
      }
   };

   // Handle delete transaction
   const handleDeleteTransaction = async (transactionId) => {
      if (!window.confirm('Are you sure you want to delete this transaction?')) {
         return;
      }

      try {
         const token = localStorage.getItem('token');

         if (!token) {
            setError('You need to be logged in to delete transactions.');
            return;
         }

         console.log('Deleting transaction with ID:', transactionId);

         await axios.delete(`http://localhost:5000/api/transactions/${transactionId}`, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         // Refresh the transactions list after deletion
         refreshTransactions();
      } catch (error) {
         console.error('Error deleting transaction:', error);
         console.error('Error details:', error.response ? error.response.data : 'No response data');
         // Remove alert - replaced by notification system
         setError('Failed to delete transaction. Please try again.');
      }
   };

   // Handle edit transaction
   const handleEditClick = (transaction) => {
      console.log('Transaction being edited:', transaction);
      console.log('MongoDB _id:', transaction._id);

      setIsEditing(true);
      setEditingTransaction(transaction);
      setFormData({
         id: transaction.id,
         date: transaction.date,
         time: transaction.time,
         amount: transaction.amount,
         status: transaction.status,
         discount: transaction.discount || 0,
         fee_charge: transaction.fee_charge || 0,
         depository_institution: transaction.depository_institution,
         description: transaction.description,
         _id: transaction._id,
      });
   };

   // Cancel editing
   const handleCancelEdit = () => {
      setIsEditing(false);
      setEditingTransaction(null);
   };

   // Load transactions on initial render
   useEffect(() => {
      fetchTransactions(1, false);
   }, []);

   // Ensure filters are cleared if the component unmounts
   useEffect(() => {
      return () => {
         setIsFiltered(false);
         setActiveFilters({ status: false, id: false, date: false });
      };
   }, []);

   // Local search filtering
   const handleSearch = (e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
   };

   // Filter transactions based on client-side search term
   const filteredTransactions = transactions.filter((transaction) => {
      if (!searchTerm) return true;

      const term = searchTerm.toLowerCase();
      return (
         transaction.id.toLowerCase().includes(term) ||
         transaction.depository_institution.toLowerCase().includes(term) ||
         transaction.status.toLowerCase().includes(term) ||
         transaction.description.toLowerCase().includes(term) ||
         transaction.amount.toString().includes(term) ||
         transaction.date.includes(term)
      );
   });

   // Modern loading state
   const LoadingState = () => (
      <div className="min-h-[300px] flex items-center justify-center">
         <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 h-12 w-12 mb-3 flex items-center justify-center">
               <svg
                  className="animate-spin h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
               >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                     className="opacity-75"
                     fill="currentColor"
                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
               </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-300">Loading transactions...</p>
         </div>
      </div>
   );

   // Modern error state
   const ErrorState = () => (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg p-4 flex items-center">
         <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
               fillRule="evenodd"
               d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
               clipRule="evenodd"
            ></path>
         </svg>
         {error}
      </div>
   );

   return (
      <div className={`w-full p-5 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
         {/* Notification Banner */}
         {notification && (
            <div
               className={`mb-4 p-3 rounded-lg shadow-md transition-all duration-300 animate-fade-in
               ${
                  notification.type === 'insert'
                     ? 'bg-green-100 border-green-500 text-green-900'
                     : notification.type === 'update'
                     ? 'bg-blue-100 border-blue-500 text-blue-900'
                     : notification.type === 'delete'
                     ? 'bg-red-100 border-red-500 text-red-900'
                     : 'bg-yellow-100 border-yellow-500 text-yellow-900'
               }`}
            >
               <div className="flex justify-between items-center">
                  <div>
                     <div className="font-bold">
                        Database Operation{' '}
                        {notification.transactionState
                           ? `| Transaction ${notification.transactionState}`
                           : `| REPEATABLE READ`}
                     </div>
                     {notification.executionTime && (
                        <div className="text-sm">MongoDB executed in {notification.executionTime}ms</div>
                     )}
                  </div>
                  <button
                     onClick={() => setNotification(null)}
                     className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                     <RiCloseLine size={20} />
                  </button>
               </div>
            </div>
         )}

         {/* Page Title and Filters */}
         <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
               <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Transaction Records
               </h2>
               <button
                  onClick={handleRefresh}
                  className={`ml-4 p-2 rounded-full ${
                     isDarkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-white text-gray-700 hover:bg-gray-200'
                  } 
                    ${refreshing ? 'animate-spin' : ''}`}
               >
                  <FiRefreshCw className="h-5 w-5" />
               </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
               <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                  <input
                     type="text"
                     placeholder="Search transactions..."
                     value={searchTerm}
                     onChange={handleSearch}
                     className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-slate-600 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all"
                  />
                  <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
               </div>
            </div>
         </div>

         {/* Edit Transaction Form Modal */}
         {isEditing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white dark:bg-slate-800 dark:text-white rounded-lg shadow-lg p-6 w-11/12 sm:w-3/4 lg:w-1/2 max-h-[90vh] overflow-auto">
                  <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-semibold">Edit Transaction</h2>
                     <button onClick={handleCancelEdit} className="hover:text-gray-700 focus:outline-none">
                        ✖
                     </button>
                  </div>
                  <form onSubmit={handleUpdateSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium mb-1">Transaction ID</label>
                           <input
                              type="text"
                              name="id"
                              value={formData.id}
                              onChange={handleChange}
                              className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2 focus:outline-none"
                              required
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1">Date</label>
                           <input
                              type="date"
                              name="date"
                              value={formData.date}
                              onChange={handleChange}
                              className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2 focus:outline-none"
                              required
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1">Time</label>
                           <input
                              type="time"
                              name="time"
                              value={formData.time}
                              onChange={handleChange}
                              className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2 focus:outline-none"
                              required
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1">Amount</label>
                           <input
                              type="number"
                              name="amount"
                              value={formData.amount}
                              onChange={handleChange}
                              className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2 focus:outline-none"
                              required
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1">Status</label>
                           <select
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2 focus:outline-none"
                              required
                           >
                              <option value="" disabled>
                                 Select Status
                              </option>
                              <option value="Successful">Successful</option>
                              <option value="Failed">Failed</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1">Discount (%)</label>
                           <input
                              type="number"
                              name="discount"
                              value={formData.discount}
                              onChange={handleChange}
                              className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2 focus:outline-none"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1">Fee/Charge</label>
                           <input
                              type="number"
                              name="fee_charge"
                              value={formData.fee_charge}
                              onChange={handleChange}
                              className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2 focus:outline-none"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1">Depository Institution</label>
                           <select
                              name="depository_institution"
                              value={formData.depository_institution}
                              onChange={handleChange}
                              className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2 focus:outline-none"
                              required
                           >
                              <option value="" disabled>
                                 Select Institution
                              </option>
                              <option value="Interbanking">Interbanking</option>
                              <option value="Habib-Bank">Habib Bank</option>
                              <option value="United-Bank">United Bank</option>
                              <option value="MCB-Bank">MCB Bank</option>
                              <option value="Allied-Bank">Allied Bank</option>
                              <option value="Askari-Bank">Askari Bank</option>
                              <option value="Meezan-Bank">Meezan Bank</option>
                              <option value="Bank-Alfalah">Bank Alfalah</option>
                              <option value="Faysal-Bank">Faysal Bank</option>
                              <option value="Cash-Transaction">Cash Transaction</option>
                              <option value="Credit-Card">Credit Card</option>
                              <option value="Digital-Wallet">Digital Wallet</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1">Description</label>
                           <input
                              type="text"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2 focus:outline-none"
                              required
                           />
                        </div>
                     </div>
                     <div className="flex justify-end gap-3 mt-4">
                        <button
                           type="button"
                           onClick={handleCancelEdit}
                           className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                           Update Transaction
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Filters Section */}
         <div className="mb-6 rounded-xl border border-gray-200 dark:border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <div className="p-6 bg-white/70 dark:bg-slate-800/70">
               <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <RiFilterLine className="mr-2" /> Advanced Filters
               </h3>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Transaction ID
                     </label>
                     <input
                        type="text"
                        name="transactionId"
                        value={filters.transactionId}
                        onChange={handleFilterChange}
                        className="w-full p-3 border dark:border-slate-600 dark:bg-slate-700/70 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all"
                        placeholder="Filter by ID"
                     />
                  </div>

                  <div className="space-y-1">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                     <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full p-3 border dark:border-slate-600 dark:bg-slate-700/70 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all"
                     >
                        <option value="">All Statuses</option>
                        <option value="Successful">Successful</option>
                        <option value="Failed">Failed</option>
                     </select>
                  </div>

                  <div className="space-y-1">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                     <input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className="w-full p-3 border dark:border-slate-600 dark:bg-slate-700/70 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all"
                     />
                  </div>
               </div>

               <div className="flex justify-end mt-4 space-x-3">
                  <button
                     onClick={resetFilters}
                     className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  >
                     Reset
                  </button>
                  <button
                     onClick={applyFilters}
                     className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                     Apply Filters
                  </button>
               </div>

               {isFiltered && (
                  <div className="mt-3 flex flex-wrap gap-2">
                     {activeFilters.id && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium flex items-center">
                           ID: {filters.transactionId}
                        </span>
                     )}
                     {activeFilters.status && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium flex items-center">
                           Status: {filters.status}
                        </span>
                     )}
                     {activeFilters.date && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium flex items-center">
                           Date: {filters.date}
                        </span>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* Transactions Table */}
         <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
               {loading ? (
                  <LoadingState />
               ) : error ? (
                  <ErrorState />
               ) : filteredTransactions.length === 0 ? (
                  <div className="p-8 text-center">
                     <div className="flex flex-col items-center">
                        <svg
                           className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z"
                           />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                           {isFiltered || searchTerm
                              ? 'Try changing your filters or search term'
                              : 'Add your first transaction to get started'}
                        </p>
                     </div>
                  </div>
               ) : (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                     <thead className="bg-gray-50/80 dark:bg-slate-800/80">
                        <tr>
                           <th
                              scope="col"
                              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                           >
                              ID
                           </th>
                           <th
                              scope="col"
                              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                           >
                              Amount
                           </th>
                           <th
                              scope="col"
                              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                           >
                              Status
                           </th>
                           <th
                              scope="col"
                              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                           >
                              Date
                           </th>
                           <th
                              scope="col"
                              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                           >
                              Time
                           </th>
                           <th
                              scope="col"
                              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                           >
                              Depository Institution
                           </th>
                           <th
                              scope="col"
                              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                           >
                              Description
                           </th>
                           <th
                              scope="col"
                              className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                           >
                              Actions
                           </th>
                        </tr>
                     </thead>
                     <tbody className="bg-white/50 dark:bg-slate-800/50 divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredTransactions.map((transaction, index) => (
                           <tr
                              key={transaction._id}
                              className={`${
                                 index % 2 === 0
                                    ? 'bg-white/30 dark:bg-slate-800/30'
                                    : 'bg-slate-50/30 dark:bg-slate-700/20'
                              } 
                                 hover:bg-indigo-50/50 dark:hover:bg-indigo-800/20 transition-colors duration-150`}
                           >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                                 {transaction.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    ${parseFloat(transaction.amount).toFixed(2)}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                       transaction.status === 'Successful' || transaction.status === 'completed'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                          : transaction.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                                          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                    }`}
                                 >
                                    {transaction.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                 {transaction.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                 {transaction.time}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                 <span
                                    className="px-2.5 py-1 rounded-full text-xs font-medium 
                                    bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300"
                                 >
                                    {transaction.depository_institution}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                 {transaction.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                 <div className="flex justify-end space-x-2">
                                    <button
                                       onClick={() => handleEditClick(transaction)}
                                       className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors"
                                       title="Edit transaction"
                                    >
                                       <RiEditLine size={18} />
                                    </button>
                                    <button
                                       onClick={() => handleDeleteTransaction(transaction._id)}
                                       className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/40 transition-colors"
                                       title="Delete transaction"
                                    >
                                       <RiDeleteBinLine size={18} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </div>

         {/* Pagination - make sure it's always visible */}
         <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
               Showing {filteredTransactions.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to{' '}
               {Math.min(currentPage * 10, filteredTransactions.length)} of {filteredTransactions.length} entries
            </div>

            {!loading && !error && totalPages > 1 && (
               <div className="flex space-x-1">
                  <button
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className={`relative inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentPage === 1
                           ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                           : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                     }`}
                  >
                     <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                     >
                        <path
                           fillRule="evenodd"
                           d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                           clipRule="evenodd"
                        />
                     </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                     <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                           currentPage === page
                              ? 'z-10 bg-indigo-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        }`}
                     >
                        {page}
                     </button>
                  ))}

                  <button
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className={`relative inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentPage === totalPages
                           ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                           : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                     }`}
                  >
                     <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                     >
                        <path
                           fillRule="evenodd"
                           d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                           clipRule="evenodd"
                        />
                     </svg>
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};

export default TransactionRecord;
