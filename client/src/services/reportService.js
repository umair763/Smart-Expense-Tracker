import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';

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
