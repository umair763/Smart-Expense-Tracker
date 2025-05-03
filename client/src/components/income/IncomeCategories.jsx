import React, { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

const IncomeCategories = () => {
   const [categories, setCategories] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const [refreshTrigger, setRefreshTrigger] = useState(0);
   const [refreshing, setRefreshing] = useState(false);

   // Function to refresh the data
   const refreshData = () => {
      setIsLoading(true);
      setRefreshing(true);
      setRefreshTrigger((prev) => prev + 1);
   };

   useEffect(() => {
      const fetchIncomeCategories = async () => {
         try {
            const token = localStorage.getItem('token');
            if (!token) {
               setError('Authentication required');
               setIsLoading(false);
               return;
            }

            const response = await fetch('http://localhost:5000/api/incomes/stats', {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            if (!response.ok) {
               throw new Error('Failed to fetch income statistics');
            }

            const data = await response.json();
            console.log('Fetched income category data:', data);

            if (data.incomeByCategory && data.incomeByCategory.length > 0) {
               // Sort categories by total amount in descending order
               const sortedCategories = [...data.incomeByCategory].sort((a, b) => b.total - a.total);
               setCategories(sortedCategories);
            } else {
               // No sample data, just set to empty array
               setCategories([]);
            }

            setIsLoading(false);
         } catch (err) {
            console.error('Error fetching income categories:', err);
            setError(err.message);
            setIsLoading(false);
         }
      };

      fetchIncomeCategories();
   }, [refreshTrigger]);

   // Function to calculate percentage of total
   const calculatePercentage = (categoryTotal) => {
      const total = categories.reduce((sum, cat) => sum + cat.total, 0);
      return total > 0 ? (categoryTotal / total) * 100 : 0;
   };

   // Function to get color based on category name
   const getCategoryColor = (category) => {
      const colorMap = {
         Salary: '#4F46E5', // Indigo
         Freelance: '#10B981', // Emerald
         Business: '#F59E0B', // Amber
         Investments: '#6366F1', // Purple
         Dividends: '#8B5CF6', // Violet
         Rental: '#EC4899', // Pink
         YouTube: '#EF4444', // Red
         Trading: '#F97316', // Orange
         Interest: '#14B8A6', // Teal
         Royalties: '#3B82F6', // Blue
         Commission: '#D946EF', // Fuchsia
         Consulting: '#0EA5E9', // Sky
         Gifts: '#A3E635', // Lime
         Others: '#94A3B8', // Slate
      };

      return colorMap[category] || '#94A3B8'; // Default to slate if category not found
   };

   // Format currency
   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
         maximumFractionDigits: 0,
      }).format(amount);
   };

   if (isLoading) {
      return (
         <div className="bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white p-4 rounded-md">
            <h2 className="text-xl font-bold mb-4">Income Categories</h2>
            <p>Loading categories...</p>
         </div>
      );
   }

   if (error) {
      return (
         <div className="bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Income Categories</h2>
               <button
                  onClick={refreshData}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                  title="Refresh Data"
                  disabled={refreshing || isLoading}
               >
                  <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
               </button>
            </div>
            <p className="text-red-500">{error}</p>
         </div>
      );
   }

   return (
      <div className="bg-slate-200 text-black dark:bg-[#00203FFF] dark:text-white p-4 rounded-md">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Income Categories</h2>
            <button
               onClick={refreshData}
               className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
               title="Refresh Data"
               disabled={refreshing || isLoading}
            >
               <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
         </div>

         {categories.length === 0 ? (
            <div>
               <p className="text-center py-6">No income categories available yet</p>
               <p className="text-sm text-center mb-4">Add income records to see your spending breakdown by category</p>
            </div>
         ) : (
            <div className="space-y-4">
               {categories.map((category) => (
                  <div key={category._id} className="space-y-1">
                     <div className="flex justify-between text-sm">
                        <span>{category._id}</span>
                        <span>{formatCurrency(category.total)}</span>
                     </div>
                     <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                           className="h-2.5 rounded-full"
                           style={{
                              width: `${calculatePercentage(category.total)}%`,
                              backgroundColor: getCategoryColor(category._id),
                           }}
                        ></div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default IncomeCategories;
