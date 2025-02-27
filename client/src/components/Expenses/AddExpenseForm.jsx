import React, { useState } from 'react';

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
   PersonaCare: ['Haircuts and Styling', 'Personal Care Products', 'Clothing and Footwear'],
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
      date: '',
      recordedDate: '',
   });

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
   };

   return (
      <div className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white  dark:bg-slate-800 dark:text-white rounded-lg shadow-lg p-6 w-11/12 sm:w-3/4 lg:w-1/2">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-semibold">Add Expense</h2>
               <button onClick={onClose} className="text-gray-500 hover:text-gray-800 focus:outline-none">
                  ✖
               </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">
                     Category
                  </label>
                  <select
                     name="category"
                     id="category"
                     value={formData.category}
                     onChange={handleChange}
                     className="w-full border dark:bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                  <div>
                     <label htmlFor="item" className="block text-sm font-medium mb-1 dark:bg-slate-700">
                        Item
                     </label>
                     <select
                        name="item"
                        id="item"
                        value={formData.item}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2 focus:ring-2 dark:bg-slate-700 focus:ring-blue-500 focus:outline-none"
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
               <div>
                  <label htmlFor="amount" className="block text-sm font-medium mb-1">
                     Amount
                  </label>
                  <input
                     type="number"
                     name="amount"
                     id="amount"
                     value={formData.amount}
                     onChange={handleChange}
                     placeholder="Enter amount"
                     className="w-full dark:bg-slate-700 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                     required
                  />
               </div>

               <div>
                  <label htmlFor="recordedDate" className="block text-sm font-medium mb-1">
                     Recorded Date
                  </label>
                  <input
                     type="date"
                     name="recordedDate"
                     id="recordedDate"
                     value={formData.recordedDate}
                     onChange={handleChange}
                     className="w-full dark:bg-slate-700 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                     required
                  />
               </div>
               <div className="flex justify-end gap-4">
                  <button
                     type="button"
                     onClick={onClose}
                     className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400"
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
                  >
                     Submit
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default AddExpenseForm;
