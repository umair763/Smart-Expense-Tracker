import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import { RiEditLine, RiDeleteBinLine, RiFilterLine, RiCloseLine } from 'react-icons/ri';
import { ThemeContext } from '../../app/context/ThemeContext';
import { io } from 'socket.io-client';

// Define valid income categories
const validCategories = [
   'Salary',
   'Freelance',
   'Business',
   'Investments',
   'Dividends',
   'Rental',
   'YouTube',
   'Trading',
   'Interest',
   'Royalties',
   'Commission',
   'Consulting',
   'Gifts',
   'Others',
];

function IncomeRecord() {
   const [incomes, setIncomes] = useState([]);
   const [currentPage, setCurrentPage] = useState(1);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const [isEditing, setIsEditing] = useState(false);
   const [editingIncome, setEditingIncome] = useState(null);
   const [refreshing, setRefreshing] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const { isDarkMode } = useContext(ThemeContext);
   const [notification, setNotification] = useState(null);
   const [socket, setSocket] = useState(null);

   const [formData, setFormData] = useState({
      id: '',
      category: '',
      amount: '',
      description: '',
      date: '',
      time: '',
      _id: '',
   });

   const recordsPerPage = 10;

   // Fetch the user's incomes from the server
   const fetchIncomes = useCallback(async () => {
      try {
         const token = localStorage.getItem('token');
         if (!token) {
            console.error('No token found in localStorage.');
            setError('You need to be logged in.');
            setIsLoading(false);
            return;
         }

         // Start timing the fetch operation
         const startTime = performance.now();

         setIsLoading(true);
         const response = await axios.get('http://localhost:5000/api/incomes', {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         // Calculate time taken in milliseconds
         const endTime = performance.now();
         const timeTaken = endTime - startTime;

         console.log('Fetched incomes data:', response.data);
         setIncomes(response.data.incomes || []); // Update state with fetched incomes
         setError(null);
         setIsLoading(false);

         // Format time for display (seconds with 2 decimal places if >= 1000ms, otherwise milliseconds)
         let formattedTime;
         if (timeTaken >= 1000) {
            formattedTime = `${(timeTaken / 1000).toFixed(2)} sec`;
         } else {
            formattedTime = `${Math.round(timeTaken)} ms`;
         }

         // Display notification with time taken
         setNotification({
            type: 'fetch',
            message: `Table: All records retrieved in ${formattedTime}`,
            executionTime: Math.round(timeTaken),
            transactionState: 'READ',
         });

         // Auto-dismiss notification after 5 seconds
         setTimeout(() => {
            setNotification(null);
         }, 5000);
      } catch (err) {
         console.error('Error fetching incomes:', err);
         setError(err.response?.data?.message || err.message || 'Failed to fetch incomes');
         setIsLoading(false);
      } finally {
         setRefreshing(false);
      }
   }, []);

   // Handle refresh
   const handleRefresh = () => {
      setRefreshing(true);
      fetchIncomes();
   };

   // Handle delete income
   const handleDeleteIncome = async (incomeId) => {
      if (!window.confirm('Are you sure you want to delete this income record?')) {
         return;
      }

      try {
         const token = localStorage.getItem('token');

         if (!token) {
            setError('You need to be logged in to delete income records.');
            return;
         }

         console.log('Deleting income with ID:', incomeId);
         const url = `http://localhost:5000/api/incomes/${encodeURIComponent(incomeId)}`;
         console.log('DELETE request URL:', url);

         await axios.delete(url, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         // Refresh the incomes list after deletion
         fetchIncomes();
      } catch (error) {
         console.error('Error deleting income:', error);
         console.error('Error details:', error.response ? error.response.data : 'No response data');
         // Remove alert - replaced by notification system
         setError('Failed to delete income record. Please try again.');
      }
   };

   // Handle edit income
   const handleEditClick = (income) => {
      console.log('Income being edited:', income);
      console.log('MongoDB _id:', income._id);

      setIsEditing(true);
      setEditingIncome(income);
      setFormData({
         id: income.id,
         category: income.category,
         amount: income.amount,
         description: income.description,
         date: income.date,
         time: income.time,
         _id: income._id,
      });
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
            setError('You need to be logged in to update income records.');
            return;
         }

         // Validate the form data
         if (
            !formData.id ||
            !formData.category ||
            !formData.amount ||
            !formData.description ||
            !formData.date ||
            !formData.time
         ) {
            setError('All fields are required.');
            return;
         }

         if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            setError('Amount must be a positive number.');
            return;
         }

         console.log('Updating income with ID:', formData._id);
         console.log('Form data being sent:', formData);
         const url = `http://localhost:5000/api/incomes/${formData._id}`;
         console.log('PUT request URL:', url);

         const response = await axios.put(url, formData, {
            headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
         });

         console.log('Update response:', response.data);

         // Close the edit form and refresh incomes
         setIsEditing(false);
         setEditingIncome(null);
         fetchIncomes();
      } catch (error) {
         console.error('Error updating income:', error);
         console.error('Error response status:', error.response?.status);
         console.error('Error response data:', error.response?.data);
         console.error('Request config:', error.config);

         let errorMessage = 'Failed to update income record. Please try again.';

         if (error.response) {
            console.error('Error details:', error.response.data);

            // Handle specific validation errors
            if (error.response.data.errors) {
               const errorDetails = Object.entries(error.response.data.errors)
                  .map(([field, message]) => `${field}: ${message}`)
                  .join(', ');

               errorMessage = `Validation errors: ${errorDetails}`;
            } else if (error.response.data.message) {
               errorMessage = error.response.data.message;
            }
         }

         // Remove alert - replaced by notification system
         setError(errorMessage);
      }
   };

   // Cancel editing
   const handleCancelEdit = () => {
      setIsEditing(false);
      setEditingIncome(null);
   };

   useEffect(() => {
      fetchIncomes();
   }, [fetchIncomes]);

   // Set up a poll to refresh data every 30 seconds
   useEffect(() => {
      const intervalId = setInterval(() => {
         fetchIncomes();
      }, 30000);

      return () => clearInterval(intervalId);
   }, [fetchIncomes]);

   // Handle page change
   const handlePageChange = (page) => {
      setCurrentPage(page);
   };

   // Handle search
   const handleSearch = (e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
   };

   // Filter incomes based on search term
   const filteredIncomes = incomes.filter((income) => {
      if (!searchTerm) return true;

      const term = searchTerm.toLowerCase();
      return (
         income.description.toLowerCase().includes(term) ||
         income.category.toLowerCase().includes(term) ||
         income.amount.toString().includes(term) ||
         income.date.includes(term)
      );
   });

   // Calculate the pagination
   const totalPages = Math.ceil(filteredIncomes.length / recordsPerPage);
   const currentRecords = filteredIncomes.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

   // Format currency
   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
      }).format(amount);
   };

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

   // Listen for notifications related to incomes
   useEffect(() => {
      if (!socket) return;

      socket.on('notification', (data) => {
         // Only show notifications related to incomes
         if (data.collection === 'incomes') {
            setNotification(data);

            // Auto-dismiss notification after 5 seconds (increased from 4)
            setTimeout(() => {
               setNotification(null);
            }, 5000);

            // Refresh incomes list if this was an income operation
            if (['insert', 'update', 'delete'].includes(data.type)) {
               fetchIncomes();
            }
         }
      });

      return () => {
         socket.off('notification');
      };
   }, [socket, fetchIncomes]);

   if (isLoading && incomes.length === 0) {
      return (
         <div className="min-h-[300px] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
               <div className="rounded-full bg-gradient-to-r from-green-400 to-teal-500 h-12 w-12 mb-3 flex items-center justify-center">
                  <svg
                     className="animate-spin h-6 w-6 text-white"
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                  >
                     <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                     ></circle>
                     <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                     ></path>
                  </svg>
               </div>
               <p className="text-gray-500 dark:text-gray-300">Loading income records...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
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
   }

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
                     : notification.type === 'fetch'
                     ? 'bg-indigo-100 border-indigo-500 text-indigo-900'
                     : 'bg-yellow-100 border-yellow-500 text-yellow-900'
               }`}
            >
               <div className="flex justify-between items-center">
                  <div>
                     <div className="font-bold">
                        {notification.type === 'fetch' ? notification.message : 'Database Operation'}{' '}
                        {notification.type !== 'fetch' && notification.transactionState
                           ? `| Transaction ${notification.transactionState}`
                           : notification.type !== 'fetch'
                           ? `| REPEATABLE READ`
                           : ''}
                     </div>
                     {notification.executionTime && notification.type !== 'fetch' && (
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

         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
                  Income Records
               </h1>
               <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {filteredIncomes.length} {filteredIncomes.length === 1 ? 'record' : 'records'} found
               </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
               <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                  <input
                     type="text"
                     placeholder="Search income..."
                     value={searchTerm}
                     onChange={handleSearch}
                     className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-slate-600 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all"
                  />
                  <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
               </div>

               <button
                  onClick={handleRefresh}
                  className="p-2.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                  title="Refresh Data"
                  disabled={refreshing || isLoading}
               >
                  <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
               </button>
            </div>
         </div>

         {/* Edit Income Form Modal */}
         {isEditing && (
            <div className="fixed inset-0 flex items-center justify-center z-[9999]">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCancelEdit}></div>
               <div
                  className={`relative w-11/12 max-w-2xl p-6 rounded-2xl shadow-2xl ${
                     isDarkMode
                        ? 'bg-slate-800/90 border border-slate-700/50 text-white'
                        : 'bg-white/95 border border-white/20 text-gray-800'
                  } backdrop-blur-md transform transition-all duration-300 animate-modalEntry`}
               >
                  {/* Decorative elements for glass effect */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/20 rounded-full filter blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/20 rounded-full filter blur-3xl"></div>

                  <div className="relative">
                     <div className="flex justify-between items-center mb-5">
                        <h2 className="text-2xl font-semibold bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
                           Edit Income Record
                        </h2>
                        <button
                           onClick={handleCancelEdit}
                           className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M6 18L18 6M6 6l12 12"
                              />
                           </svg>
                        </button>
                     </div>

                     <form onSubmit={handleUpdateSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div className="space-y-1">
                              <label className="block text-sm font-medium">ID</label>
                              <input
                                 type="text"
                                 name="id"
                                 value={formData.id}
                                 onChange={handleChange}
                                 className="w-full dark:bg-slate-700/70 dark:border-slate-600 border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all"
                                 required
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="block text-sm font-medium">Category</label>
                              <select
                                 name="category"
                                 value={formData.category}
                                 onChange={handleChange}
                                 className="w-full dark:bg-slate-700/70 dark:border-slate-600 border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all"
                                 required
                              >
                                 <option value="" disabled>
                                    Select Category
                                 </option>
                                 {validCategories.map((category) => (
                                    <option key={category} value={category}>
                                       {category}
                                    </option>
                                 ))}
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="block text-sm font-medium">Amount</label>
                              <input
                                 type="number"
                                 step="0.01"
                                 name="amount"
                                 value={formData.amount}
                                 onChange={handleChange}
                                 className="w-full dark:bg-slate-700/70 dark:border-slate-600 border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all"
                                 required
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="block text-sm font-medium">Description</label>
                              <input
                                 type="text"
                                 name="description"
                                 value={formData.description}
                                 onChange={handleChange}
                                 className="w-full dark:bg-slate-700/70 dark:border-slate-600 border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all"
                                 required
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="block text-sm font-medium">Date</label>
                              <input
                                 type="date"
                                 name="date"
                                 value={formData.date}
                                 onChange={handleChange}
                                 className="w-full dark:bg-slate-700/70 dark:border-slate-600 border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all"
                                 required
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="block text-sm font-medium">Time</label>
                              <input
                                 type="time"
                                 name="time"
                                 value={formData.time}
                                 onChange={handleChange}
                                 className="w-full dark:bg-slate-700/70 dark:border-slate-600 border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all"
                                 required
                              />
                           </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                           <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-5 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                           >
                              Cancel
                           </button>
                           <button
                              type="submit"
                              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                           >
                              Update Income
                           </button>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
         )}

         {/* Income Table */}
         <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50/80 dark:bg-slate-800/80">
                     <tr>
                        <th
                           scope="col"
                           className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                           Description
                        </th>
                        <th
                           scope="col"
                           className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                           Category
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
                           Date
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
                     {currentRecords.length === 0 ? (
                        <tr>
                           <td colSpan="5" className="px-6 py-8 text-center">
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
                                 <p className="text-gray-500 dark:text-gray-400 font-medium">No income records found</p>
                                 <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                    {searchTerm
                                       ? 'Try a different search term'
                                       : 'Add your first income record to get started'}
                                 </p>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        currentRecords.map((income, index) => (
                           <tr
                              key={income._id}
                              className={`${
                                 index % 2 === 0
                                    ? 'bg-white/30 dark:bg-slate-800/30'
                                    : 'bg-slate-50/30 dark:bg-slate-700/20'
                              } 
                                 hover:bg-green-50/50 dark:hover:bg-green-800/20 transition-colors duration-150`}
                           >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                                 {income.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                 <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                                    {income.category}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    {formatCurrency(income.amount)}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                 {income.date} {income.time && `at ${income.time}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                 <div className="flex justify-end space-x-2">
                                    <button
                                       onClick={() => handleEditClick(income)}
                                       className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/40 transition-colors"
                                       title="Edit income"
                                    >
                                       <RiEditLine size={18} />
                                    </button>
                                    <button
                                       onClick={() => handleDeleteIncome(income._id)}
                                       className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/40 transition-colors"
                                       title="Delete income"
                                    >
                                       <RiDeleteBinLine size={18} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Pagination - make sure it's always visible */}
         <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
               Showing {filteredIncomes.length > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0} to{' '}
               {Math.min(currentPage * recordsPerPage, filteredIncomes.length)} of {filteredIncomes.length} entries
            </div>

            {totalPages > 1 && (
               <div className="flex space-x-1">
                  <button
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className={`relative inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentPage === 1
                           ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                           : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500'
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
                              ? 'z-10 bg-green-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500'
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
                           : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500'
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
}

export default IncomeRecord;
