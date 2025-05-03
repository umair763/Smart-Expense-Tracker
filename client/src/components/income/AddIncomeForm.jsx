import React, { useState } from 'react';

const categories = [
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

const AddIncomeForm = ({ onClose, onSubmit }) => {
   const [formData, setFormData] = useState({
      category: '',
      amount: '',
      description: '',
      date: '',
      time: '',
      id: `INC-${Date.now().toString().slice(-6)}`,
   });
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState('');
   const [debugInfo, setDebugInfo] = useState(null);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         setIsSubmitting(true);
         setError('');
         setDebugInfo(null);

         const token = localStorage.getItem('token');
         if (!token) {
            console.error('No token found in localStorage.');
            setError('You need to be logged in to add income.');
            return;
         }

         console.log('Submitting income data:', JSON.stringify(formData));

         // Normalize amount to ensure it's a number
         const formDataToSubmit = {
            ...formData,
            amount: parseFloat(formData.amount),
         };

         // Log full request details for debugging
         console.log('Request URL:', 'http://localhost:5000/api/incomes');
         console.log('Request headers:', {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
         });
         console.log('Request body:', JSON.stringify(formDataToSubmit));

         const response = await fetch('http://localhost:5000/api/incomes', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formDataToSubmit),
         });

         // Log the response for debugging
         console.log('Response status:', response.status);
         console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));

         // First check if the response is valid
         const contentType = response.headers.get('content-type');
         console.log('Content-Type:', contentType);

         // Store debug info
         setDebugInfo({
            status: response.status,
            statusText: response.statusText,
            contentType,
         });

         let data;
         // Handle different response types
         if (contentType && contentType.includes('application/json')) {
            data = await response.json();
         } else {
            // If not JSON, get the text for debugging
            const textResponse = await response.text();
            console.log('Non-JSON response received:', textResponse);
            setDebugInfo((prev) => ({
               ...prev,
               responseText: textResponse.substring(0, 500), // Limit text length
            }));
            throw new Error('Unexpected response format: ' + contentType);
         }

         if (response.ok) {
            console.log('Income added successfully', data);
            onSubmit(formData); // Pass the form data back to the parent component
            onClose(); // Close the modal
         } else {
            console.error('Error response from server:', data);
            setError(data.message || 'Failed to add income');
         }
      } catch (error) {
         console.error('Error during fetch:', error);
         setError('An error occurred while submitting the form: ' + error.message);
      } finally {
         setIsSubmitting(false);
      }
   };

   // Set current date and time as default
   React.useEffect(() => {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const timeString = now.toTimeString().split(' ')[0].slice(0, 5);

      setFormData((prev) => ({
         ...prev,
         date: dateString,
         time: timeString,
      }));
   }, []);

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white dark:bg-slate-800 dark:text-white rounded-lg shadow-lg p-6 w-11/12 sm:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-semibold">Add Income</h2>
               <button onClick={onClose} className="text-gray-500 hover:text-gray-800 focus:outline-none">
                  ✖
               </button>
            </div>

            {error && <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

            {debugInfo && (
               <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-xs overflow-auto max-h-32">
                  <h3 className="font-bold">Debug Info:</h3>
                  <p>
                     Status: {debugInfo.status} {debugInfo.statusText}
                  </p>
                  <p>Content-Type: {debugInfo.contentType || 'none'}</p>
                  {debugInfo.responseText && (
                     <details>
                        <summary>Response Preview</summary>
                        <pre className="whitespace-pre-wrap">{debugInfo.responseText}</pre>
                     </details>
                  )}
               </div>
            )}

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
                     className="w-full border dark:bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                     required
                     disabled={isSubmitting}
                  >
                     <option value="" disabled>
                        Select Category
                     </option>
                     {categories.map((category) => (
                        <option key={category} value={category}>
                           {category}
                        </option>
                     ))}
                  </select>
               </div>

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
                     className="w-full dark:bg-slate-700 border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                     required
                     disabled={isSubmitting}
                     step="0.01"
                     min="0.01"
                  />
               </div>

               <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                     Description
                  </label>
                  <textarea
                     name="description"
                     id="description"
                     value={formData.description}
                     onChange={handleChange}
                     placeholder="Enter description"
                     className="w-full dark:bg-slate-700 border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                     required
                     disabled={isSubmitting}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label htmlFor="date" className="block text-sm font-medium mb-1">
                        Date
                     </label>
                     <input
                        type="date"
                        name="date"
                        id="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full dark:bg-slate-700 border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        required
                        disabled={isSubmitting}
                     />
                  </div>

                  <div>
                     <label htmlFor="time" className="block text-sm font-medium mb-1">
                        Time
                     </label>
                     <input
                        type="time"
                        name="time"
                        id="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full dark:bg-slate-700 border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        required
                        disabled={isSubmitting}
                     />
                  </div>
               </div>

               <div>
                  <label htmlFor="id" className="block text-sm font-medium mb-1">
                     ID
                  </label>
                  <input
                     type="text"
                     name="id"
                     id="id"
                     value={formData.id}
                     readOnly
                     className="w-full border rounded-lg p-2 bg-gray-100 dark:bg-slate-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated ID</p>
               </div>

               <div className="flex justify-end gap-4">
                  <button
                     type="button"
                     onClick={onClose}
                     className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400"
                     disabled={isSubmitting}
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-400"
                     disabled={isSubmitting}
                  >
                     {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default AddIncomeForm;
