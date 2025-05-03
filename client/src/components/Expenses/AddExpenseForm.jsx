import React, { useState, useEffect, useContext } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ThemeContext } from '../../app/context/ThemeContext';

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
   PersonalCare: ['Haircuts and Styling', 'Personal Care Products', 'Clothing and Footwear'], // Fixed typo from "PersonaCare" to "PersonalCare"
   Entertainment: ['Streaming Services', 'Cable or Satellite TV', 'Hobbies and Interests', 'Movies and Theater'],
   Education: ['Tuition Fees', 'Books and Supplies', 'Student Loans'],
   FinancialObligations: ['Credit Card Payments', 'Loans', 'Savings', 'Retirement Savings'],
   Taxes: ['Income Taxes', 'Property Taxes', 'Sales Tax'],
};

const AddExpenseForm = ({ onClose, onSubmit }) => {
   const [formData, setFormData] = useState({
      category: '',
      item: '',
      amount: '',
      recordedDate: '',
   });
   const [isVisible, setIsVisible] = useState(false);
   const { isDarkMode } = useContext(ThemeContext);

   useEffect(() => {
      // Animation effect when component mounts
      setIsVisible(true);

      // Add event listener to handle ESC key
      const handleEscKey = (e) => {
         if (e.key === 'Escape') {
            handleClose();
         }
      };

      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
   }, []);

   const handleClose = () => {
      setIsVisible(false);
      // Delay the actual closing to allow for exit animation
      setTimeout(() => onClose(), 300);
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      const token = localStorage.getItem('token');
      if (!token) {
         console.error('No token found in localStorage.');
         alert('You need to be logged in to add an expense.');
         return;
      }

      console.log('Token being sent from frontend:', token); // Debugging log

      const expenseData = {
         category: formData.category,
         item: formData.item,
         amount: formData.amount,
         recordedDate: formData.recordedDate,
      };

      try {
         const response = await fetch('http://localhost:5000/api/expenses', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`, // Send token with the 'Authorization' header
            },
            body: JSON.stringify(expenseData),
         });

         const data = await response.json();

         if (response.ok) {
            console.log('Expense added successfully', data);
            alert('Expense added successfully');

            handleClose(); // Use handleClose instead of onClose directly
         } else {
            console.error('Error response from server:', data);
            alert(data.message || 'Failed to add expense');
         }
      } catch (error) {
         console.error('Error during fetch:', error);
         alert('An error occurred while submitting the form.');
      }
   };

   return (
      <div
         className={`fixed inset-0 flex items-center justify-center z-[9999] transition-all duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
         }`}
         onClick={handleClose}
      >
         {/* Backdrop with blur */}
         <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

         {/* Modal content */}
         <div
            className={`relative w-11/12 max-w-md p-8 rounded-2xl shadow-2xl transform transition-all duration-300 ${
               isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
            } ${
               isDarkMode
                  ? 'bg-slate-800/80 border border-slate-700/50 text-white'
                  : 'bg-white/90 border border-white/20 text-gray-800'
            } backdrop-blur-md`}
            onClick={(e) => e.stopPropagation()}
         >
            {/* Decorative elements for glass effect */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full filter blur-3xl"></div>

            <div className="relative">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                     Add Expense
                  </h2>
                  <button
                     onClick={handleClose}
                     className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                     <FaTimes />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                     <label htmlFor="category" className="block text-sm font-medium">
                        Category
                     </label>
                     <select
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full border dark:border-slate-600 dark:bg-slate-700/70 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
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

                  {formData.category && (
                     <div className="space-y-1">
                        <label htmlFor="item" className="block text-sm font-medium">
                           Item
                        </label>
                        <select
                           name="item"
                           id="item"
                           value={formData.item}
                           onChange={handleChange}
                           className="w-full border dark:border-slate-600 dark:bg-slate-700/70 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                           required
                        >
                           <option value="" disabled>
                              Select Item
                           </option>
                           {categories[formData.category].map((item) => (
                              <option key={item} value={item}>
                                 {item}
                              </option>
                           ))}
                        </select>
                     </div>
                  )}

                  <div className="space-y-1">
                     <label htmlFor="amount" className="block text-sm font-medium">
                        Amount
                     </label>
                     <input
                        type="number"
                        name="amount"
                        id="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        className="w-full dark:border-slate-600 dark:bg-slate-700/70 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                        required
                     />
                  </div>

                  <div className="space-y-1">
                     <label htmlFor="recordedDate" className="block text-sm font-medium">
                        Recorded Date
                     </label>
                     <input
                        type="date"
                        name="recordedDate"
                        id="recordedDate"
                        value={formData.recordedDate}
                        onChange={handleChange}
                        className="w-full dark:border-slate-600 dark:bg-slate-700/70 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                        required
                     />
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                     <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                     >
                        Cancel
                     </button>
                     <button
                        type="submit"
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                     >
                        Submit
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

export default AddExpenseForm;
