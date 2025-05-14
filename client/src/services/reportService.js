import axios from 'axios';
import API_BASE_URL from './apiConfig';

const API_URL = `${API_BASE_URL}/reports`;

/**
 * Downloads expense data as a CSV file
 * @param {Object} filters Optional filters such as startDate, endDate, category
 * @returns {Promise} Promise that resolves when download is complete
 */
export const downloadExpenseReport = async (filters = {}) => {
   try {
      const token = localStorage.getItem('token');
      if (!token) {
         throw new Error('Authentication required. Please log in.');
      }

      // Prepare query parameters from filters
      const queryParams = new URLSearchParams();

      // Always include this parameter to get all user records
      queryParams.append('includeAllDates', 'true');

      // Still include other filters in case they're needed for future features
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.category) queryParams.append('category', filters.category);

      // Build URL with query parameters
      const url = `${API_URL}/expenses/csv?${queryParams.toString()}`;
      console.log('Requesting expense report from:', url);

      // Use axios to get the file as a blob
      const response = await axios({
         url,
         method: 'GET',
         responseType: 'blob', // Important for file downloads
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });

      console.log('Expense report response received:', response.status, 'Content length:', response.data.size, 'bytes');

      // Try to read the first few bytes of the blob to determine content
      const reader = new FileReader();
      reader.onload = function () {
         const firstBytes = reader.result.slice(0, 100);
         console.log('First bytes of response:', firstBytes);
      };
      reader.readAsText(response.data.slice(0, 100));

      // Check if response is valid and has data
      if (!response.data || response.data.size === 0) {
         throw new Error('Empty response received from server');
      }

      // Create a blob URL for the file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Get current date for filename
      const date = new Date().toISOString().split('T')[0];
      link.download = `expense-report-${date}.csv`;

      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(downloadUrl);

      return true;
   } catch (error) {
      console.error('Error downloading expense report:', error);
      if (error.response) {
         console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
   }
};

/**
 * Downloads income data as a CSV file
 * @param {Object} filters Optional filters such as startDate, endDate, category
 * @returns {Promise} Promise that resolves when download is complete
 */
export const downloadIncomeReport = async (filters = {}) => {
   try {
      const token = localStorage.getItem('token');
      if (!token) {
         throw new Error('Authentication required. Please log in.');
      }

      // Prepare query parameters from filters
      const queryParams = new URLSearchParams();

      // Always include this parameter to get all user records
      queryParams.append('includeAllDates', 'true');

      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.category) queryParams.append('category', filters.category);

      // Build URL with query parameters
      const url = `${API_URL}/incomes/csv?${queryParams.toString()}`;
      console.log('Requesting income report from:', url);

      // Use axios to get the file as a blob
      const response = await axios({
         url,
         method: 'GET',
         responseType: 'blob', // Important for file downloads
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });

      console.log('Income report response received:', response.status);

      // Check if response is valid and has data
      if (!response.data || response.data.size === 0) {
         throw new Error('Empty response received from server');
      }

      // Create a blob URL for the file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Get current date for filename
      const date = new Date().toISOString().split('T')[0];
      link.download = `income-report-${date}.csv`;

      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(downloadUrl);

      return true;
   } catch (error) {
      console.error('Error downloading income report:', error);
      if (error.response) {
         console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
   }
};

/**
 * Downloads transaction data as a CSV file
 * @param {Object} filters Optional filters such as startDate, endDate, status, depositoryInstitute
 * @returns {Promise} Promise that resolves when download is complete
 */
export const downloadTransactionReport = async (filters = {}) => {
   try {
      const token = localStorage.getItem('token');
      if (!token) {
         throw new Error('Authentication required. Please log in.');
      }

      // Prepare query parameters from filters
      const queryParams = new URLSearchParams();

      // Always include this parameter to get all user records
      queryParams.append('includeAllDates', 'true');

      // Only add other filters if they have non-empty values
      if (filters.startDate && filters.startDate.trim() !== '') {
         queryParams.append('startDate', filters.startDate);
      }
      if (filters.endDate && filters.endDate.trim() !== '') {
         queryParams.append('endDate', filters.endDate);
      }
      if (filters.status && filters.status.trim() !== '') {
         queryParams.append('status', filters.status);
      }
      if (filters.depositoryInstitution && filters.depositoryInstitution.trim() !== '') {
         queryParams.append('depositoryInstitution', filters.depositoryInstitution);
      }

      // Make sure we're using the correct API endpoint
      const url = `${API_BASE_URL}/reports/transactions/csv?${queryParams.toString()}`;
      console.log('Requesting transaction report from:', url);

      // Use axios to get the file as a blob
      const response = await axios({
         url,
         method: 'GET',
         responseType: 'blob', // Important for file downloads
         headers: {
            Authorization: `Bearer ${token}`,
         },
         // Add timeout to prevent hanging requests
         timeout: 30000,
      });

      console.log(
         'Transaction report response received:',
         response.status,
         'Content length:',
         response.data.size,
         'bytes'
      );

      // Try to detect if the response is an error JSON rather than a CSV
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
         // This is likely an error response
         const text = await response.data.text();
         const errorData = JSON.parse(text);
         throw new Error(errorData.message || 'Server returned an error response');
      }

      // Check if response is valid and has data
      if (!response.data) {
         throw new Error('Empty response received from server');
      }

      // Check if the file is empty or extremely small
      if (response.data.size < 10) {
         console.log('Warning: Very small file size detected:', response.data.size, 'bytes');
      }

      // Create a blob URL for the file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Get current date for filename
      const date = new Date().toISOString().split('T')[0];
      link.download = `transaction-report-${date}.csv`;

      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(downloadUrl);

      return true;
   } catch (error) {
      console.error('Error downloading transaction report:', error);
      if (error.response) {
         console.error('Server response status:', error.response.status);
         if (error.response.data instanceof Blob) {
            try {
               const text = await error.response.data.text();
               console.error('Server response data:', text);
            } catch (e) {
               console.error('Error reading blob data:', e);
            }
         } else {
            console.error('Server response data:', error.response.data);
         }
      }
      throw error;
   }
};
