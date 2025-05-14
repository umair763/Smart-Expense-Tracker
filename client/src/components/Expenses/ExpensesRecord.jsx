import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri';
import { IoFilterOutline } from 'react-icons/io5';
import { ThemeContext } from '../../app/context/ThemeContext';
import { useContext } from 'react';

// Import categories from the expense form
const categories = {
   Housing: [
      'Rent or Mortgage',
      'Property Taxes',
      'Homeowners Insurance',
      'Renters Insurance',
      'Utilities',
      'Home Maintenance and Repairs',
   ],
   Transportation: [
      'Vehicle Payments',
      'Fuel',
      'Vehicle Insurance',
      'Public Transportation',
      'Vehicle Maintenance and Repairs',
      'Parking Fees',
   ],
   Food: ['Groceries', 'Dining Out'],
   Healthcare: [
      'Health Insurance Premiums',
      'Doctor Visits and Medical Tests',
      'Prescription Medications',
      'Dental Care',
      'Vision Care',
   ],
   PersonalCare: ['Haircuts and Styling', 'Personal Care Products', 'Clothing and Footwear'],
   Entertainment: ['Streaming Services', 'Cable or Satellite TV', 'Hobbies and Interests', 'Movies and Theater'],
   Education: ['Tuition Fees', 'Books and Supplies', 'Student Loans'],
   FinancialObligations: ['Credit Card Payments', 'Loans', 'Savings', 'Retirement Savings'],
   Taxes: ['Income Taxes', 'Property Taxes', 'Sales Tax'],
};

function ExpensesRecord() {
   const [expenses, setExpenses] = useState([]);
   const [currentPage, setCurrentPage] = useState(1);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const [isEditing, setIsEditing] = useState(false);
   const [editingExpense, setEditingExpense] = useState(null);
   const [refreshing, setRefreshing] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const { isDarkMode } = useContext(ThemeContext);

   const [formData, setFormData] = useState({
      item: '',
      category: '',
      amount: '',
      recordedDate: '',
      _id: '',
   });

   const recordsPerPage = 10;

   // Fetch the user's expenses from the server
   const fetchExpenses = async () => {
      try {
         setIsLoading(true);
         const token = localStorage.getItem('token');

         if (!token) {
            console.error('No token found in localStorage.');
            setError('You need to be logged in.');
            setIsLoading(false);
            return;
         }

         const response = await axios.get('http://localhost:5000/api/expenses', {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         console.log('Fetched expenses data:', response.data); // Log the fetched data

         // Extract expenses array from the response
         // The server is returning { expenses: [...], isolationLevel: "..." }
         const expensesData = response.data.expenses || response.data;
         setExpenses(expensesData); // Update state with fetched expenses
         setError(null);
      } catch (err) {
         console.error('Error fetching expenses:', err);
         setError(err.response?.data?.message || err.message || 'Failed to fetch expenses');
      } finally {
         setIsLoading(false);
         setRefreshing(false);
      }
   };

   // Handle refresh
   const handleRefresh = () => {
      setRefreshing(true);
      fetchExpenses();
   };

   // Handle delete expense
   const handleDeleteExpense = async (expenseId) => {
      if (!window.confirm('Are you sure you want to delete this expense?')) {
         return;
      }

      try {
         const token = localStorage.getItem('token');

         if (!token) {
            setError('You need to be logged in to delete expenses.');
            return;
         }

         console.log('Deleting expense with ID:', expenseId);
         const url = `http://localhost:5000/api/expenses/${expenseId}`;
         console.log('DELETE request URL:', url);

         await axios.delete(url, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         // Refresh the expenses list after deletion
         fetchExpenses();
      } catch (error) {
         console.error('Error deleting expense:', error);
         console.error('Error details:', error.response ? error.response.data : 'No response data');
         alert('Failed to delete expense. Please try again.');
      }
   };

   // Handle edit expense
   const handleEditClick = (expense) => {
      console.log('Expense being edited:', expense);
      console.log('MongoDB _id:', expense._id);

      setIsEditing(true);
      setEditingExpense(expense);
      setFormData({
         item: expense.item,
         category: expense.category,
         amount: expense.amount,
         recordedDate: expense.recordedDate,
         _id: expense._id,
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
            setError('You need to be logged in to update expenses.');
            return;
         }

         // Validate the form data
         if (!formData.category || !formData.item || !formData.amount || !formData.recordedDate) {
            alert('All fields are required.');
            return;
         }

         console.log('Updating expense with ID:', formData._id);
         console.log('Form data being sent:', formData);
         const url = `http://localhost:5000/api/expenses/${formData._id}`;
         console.log('PUT request URL:', url);

         const response = await axios.put(url, formData, {
            headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
         });

         console.log('Update response:', response.data);

         // Close the edit form and refresh expenses
         setIsEditing(false);
         setEditingExpense(null);
         fetchExpenses();
      } catch (error) {
         console.error('Error updating expense:', error);

         let errorMessage = 'Failed to update expense. Please try again.';

         if (error.response) {
            console.error('Error details:', error.response.data);

            // Handle specific validation errors
            if (error.response.data.errors) {
               const errorDetails = Object.entries(error.response.data.errors)
                  .map(([field, message]) => `${field}: ${message}`)
                  .join('\n');

               errorMessage = `Validation errors:\n${errorDetails}`;
            } else if (error.response.data.message) {
               errorMessage = error.response.data.message;
            }
         }

         alert(errorMessage);
      }
   };

   // Cancel editing
   const handleCancelEdit = () => {
      setIsEditing(false);
      setEditingExpense(null);
   };

   useEffect(() => {
      fetchExpenses();
   }, []);

   // Handle page change
   const handlePageChange = (page) => {
      setCurrentPage(page);
   };

   // Handle search
   const handleSearch = (e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
   };

   // Filter expenses based on search term
   const filteredExpenses = Array.isArray(expenses)
      ? expenses.filter((expense) => {
           if (!searchTerm) return true;

           const term = searchTerm.toLowerCase();
           return (
              expense.item.toLowerCase().includes(term) ||
              expense.category.toLowerCase().includes(term) ||
              expense.amount.toString().includes(term) ||
              new Date(expense.recordedDate).toLocaleDateString().includes(term)
           );
        })
      : [];

   // Calculate the pagination
   const totalPages = Math.ceil(filteredExpenses.length / recordsPerPage);
   const currentRecords = filteredExpenses.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

   if (isLoading) {
      return (
         <div className="min-h-[300px] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
               <div className="rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 h-12 w-12 mb-3 flex items-center justify-center">
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
               <p className="text-gray-500 dark:text-gray-300">Loading expenses...</p>
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
      <div className="p-6 bg-transparent text-black dark:text-white">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
                  Expense Records
               </h1>
               <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {filteredExpenses.length} {filteredExpenses.length === 1 ? 'record' : 'records'} found
               </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
               <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                  <input
                     type="text"
                     placeholder="Search expenses..."
                     value={searchTerm}
                     onChange={handleSearch}
                     className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-slate-600 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                  />
                  <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
               </div>

               <button
                  onClick={handleRefresh}
                  className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                  title="Refresh Data"
                  disabled={refreshing || isLoading}
               >
                  <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
               </button>
            </div>
         </div>

         {/* Edit Expense Form Modal */}
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
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full filter blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full filter blur-3xl"></div>

                  <div className="relative">
                     <div className="flex justify-between items-center mb-5">
                        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                           Edit Expense
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
                              <label className="block text-sm font-medium">Category</label>
                              <select
                                 name="category"
                                 value={formData.category}
                                 onChange={handleChange}
                                 className="w-full dark:bg-slate-700/70 dark:border-slate-600 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                                 required
                              >
                                 <option value="" disabled>
                                    Select Category
                                 </option>
                                 {Object.keys(categories).map((cat) => (
                                    <option key={cat} value={cat}>
                                       {cat}
                                    </option>
                                 ))}
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="block text-sm font-medium">Item</label>
                              <select
                                 name="item"
                                 value={formData.item}
                                 onChange={handleChange}
                                 className="w-full dark:bg-slate-700/70 dark:border-slate-600 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                                 required
                              >
                                 <option value="" disabled>
                                    Select Item
                                 </option>
                                 {formData.category && categories[formData.category]
                                    ? categories[formData.category].map((item) => (
                                         <option key={item} value={item}>
                                            {item}
                                         </option>
                                      ))
                                    : null}
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="block text-sm font-medium">Amount</label>
                              <input
                                 type="number"
                                 name="amount"
                                 value={formData.amount}
                                 onChange={handleChange}
                                 className="w-full dark:bg-slate-700/70 dark:border-slate-600 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                                 required
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="block text-sm font-medium">Date</label>
                              <input
                                 type="date"
                                 name="recordedDate"
                                 value={formData.recordedDate}
                                 onChange={handleChange}
                                 className="w-full dark:bg-slate-700/70 dark:border-slate-600 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
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
                              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                           >
                              Update Expense
                           </button>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
         )}

         {/* Expenses Table */}
         <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50/80 dark:bg-slate-800/80">
                     <tr>
                        <th
                           scope="col"
                           className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                           Item
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
                                 <p className="text-gray-500 dark:text-gray-400 font-medium">No expenses found</p>
                                 <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                    {searchTerm
                                       ? 'Try a different search term'
                                       : 'Add your first expense to get started'}
                                 </p>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        currentRecords.map((expense, index) => (
                           <tr
                              key={expense._id}
                              className={`${
                                 index % 2 === 0
                                    ? 'bg-white/30 dark:bg-slate-800/30'
                                    : 'bg-slate-50/30 dark:bg-slate-700/20'
                              } 
                                 hover:bg-blue-50/50 dark:hover:bg-blue-800/20 transition-colors duration-150`}
                           >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                                 {expense.item}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                 <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                    {expense.category}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    ${parseFloat(expense.amount).toFixed(2)}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                 {new Date(expense.recordedDate).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                 })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                 <div className="flex justify-end space-x-2">
                                    <button
                                       onClick={() => handleEditClick(expense)}
                                       className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors"
                                       title="Edit expense"
                                    >
                                       <RiEditLine size={18} />
                                    </button>
                                    <button
                                       onClick={() => handleDeleteExpense(expense._id)}
                                       className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/40 transition-colors"
                                       title="Delete expense"
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
               Showing {filteredExpenses.length > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0} to{' '}
               {Math.min(currentPage * recordsPerPage, filteredExpenses.length)} of {filteredExpenses.length} entries
            </div>

            {totalPages > 1 && (
               <div className="flex space-x-1">
                  <button
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className={`relative inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentPage === 1
                           ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                           : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                              ? 'z-10 bg-blue-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                           : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
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

export default ExpensesRecord;
