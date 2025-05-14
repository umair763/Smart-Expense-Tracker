import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { FiRefreshCw } from 'react-icons/fi';

function TransactionGraph({ isTheme }) {
   const [chartData, setChartData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [refreshing, setRefreshing] = useState(false);

   const fetchData = async () => {
      try {
         setLoading(true);
         console.log('Fetching transaction data for graph...');

         // Get token from localStorage
         const token = localStorage.getItem('token');
         if (!token) {
            console.error('No authentication token found');
            setError('Authentication required. Please log in.');
            setLoading(false);
            return;
         }

         // Get all transactions
         const response = await axios.get('http://localhost:5000/api/transactions', {
            headers: { Authorization: `Bearer ${token}` },
         });
         console.log('Transaction response:', response.data);

         // Process the data to group by depository institution
         let transactions = [];
         if (response.data && Array.isArray(response.data.transactions)) {
            transactions = response.data.transactions;
         } else if (response.data && Array.isArray(response.data)) {
            transactions = response.data;
         } else {
            // If no data or unexpected format, use empty array
            console.log('No transaction data or unexpected format:', response.data);
         }

         // If no transactions, use sample data for development
         if (transactions.length === 0) {
            console.log('No transactions found, using sample data');
            // Use sample data
            const sampleData = [
               { name: 'Bank-Alfalah', value: 300 },
               { name: 'Habib-Bank', value: 50 },
               { name: 'MCB-Bank', value: 300 },
            ];
            setChartData(sampleData);
            setLoading(false);
            return;
         }

         // Log transactions to debug the fields
         console.log('First transaction details:', transactions[0]);

         // Aggregate transaction data by depository_institution (sum the amounts)
         const aggregatedData = transactions.reduce((acc, transaction) => {
            // Use depository_institution field instead of type
            const institution = transaction.depository_institution;
            const amount = transaction.amount || 0;

            if (!institution) return acc;

            // Make institution name more readable for display
            const displayName = institution.replace(/-/g, ' ');

            if (acc[displayName]) {
               acc[displayName] += amount;
            } else {
               acc[displayName] = amount;
            }
            return acc;
         }, {});

         console.log('Aggregated transaction data by institution:', aggregatedData);

         // Prepare data for the chart
         const data = Object.keys(aggregatedData).map((institution) => ({
            name: institution,
            value: aggregatedData[institution],
         }));

         // Sort by value (highest first)
         data.sort((a, b) => b.value - a.value);

         console.log('Chart data:', data);
         setChartData(data);
         setLoading(false);
      } catch (err) {
         console.error('Error fetching transaction data for chart:', err);
         let errorMessage = 'Failed to load transaction data';

         if (err.response) {
            console.error('Response data:', err.response.data);
            console.error('Response status:', err.response.status);

            if (err.response.status === 401 || err.response.status === 403) {
               errorMessage = 'Authentication error. Please log in again.';
            } else {
               errorMessage = `Server error: ${err.response.data.message || 'Unknown error'}`;
            }
         } else if (err.request) {
            errorMessage = 'No response from server. Please check your connection.';
         } else {
            errorMessage = 'Error: ' + err.message;
         }

         // Use sample data if error occurs
         console.log('Error occurred, using sample data for transaction graph');
         const sampleData = [
            { name: 'Bank Alfalah', value: 300 },
            { name: 'Habib Bank', value: 50 },
            { name: 'MCB Bank', value: 300 },
         ];
         setChartData(sampleData);

         console.error(errorMessage);
         setLoading(false);
      } finally {
         setRefreshing(false);
      }
   };

   // Handle refresh
   const handleRefresh = () => {
      setRefreshing(true);
      fetchData();
   };

   useEffect(() => {
      fetchData();
   }, []);

   return (
      <div className="bg-slate-200 dark:bg-slate-500 dark:text-white text-black p-6 rounded-lg shadow-md w-full">
         {/* Title and Refresh Button */}
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Transaction Amount by Institution</h2>
            <button
               onClick={handleRefresh}
               className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
               title="Refresh Data"
               disabled={refreshing || loading}
            >
               <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
         </div>

         {/* Bar Chart */}
         {loading ? (
            <div className="h-[300px] flex items-center justify-center">
               <p>Loading transaction data...</p>
            </div>
         ) : (
            <ResponsiveContainer width="100%" height={300}>
               <BarChart data={chartData} margin={{ top: 10, right: 5, bottom: 20, left: 0 }}>
                  <XAxis
                     dataKey="name"
                     tick={{ fill: isTheme ? 'white' : 'black', fontSize: 12 }}
                     angle={-25}
                     textAnchor="end"
                     height={60}
                  />
                  <YAxis tick={{ fill: isTheme ? 'white' : 'black', fontSize: 12 }} />
                  <Tooltip
                     contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                     }}
                     formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                  />
                  <Bar dataKey="value" fill="#a78bfa" barSize={30} radius={[4, 4, 0, 0]} />
               </BarChart>
            </ResponsiveContainer>
         )}
      </div>
   );
}

export default TransactionGraph;
