import { React, useState } from 'react';

const TransactionForm = ({ onClose, onSubmit }) => {
   const [formData, setFormData] = useState({
      id: '',
      date: '',
      time: '',
      type: '',
      amount: '',
      status: '',
      discount: '',
      fee_charge: '',
      depository_institution: '',
      description: '',
   });

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
      onClose(); // Close the modal after submitting
   };

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         {/* Modal Container */}
         <div className="bg-white  dark:bg-slate-800 dark:text-white rounded-lg shadow-lg p-6 w-11/12 sm:w-3/4 lg:w-1/2 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-semibold">Add Transaction</h2>
               <button onClick={onClose} className=" hover:text-gray-800 focus:outline-none">
                  ✖
               </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
               <form onSubmit={handleSubmit} className="space-y-4 mb-4">
                  <div>
                     <label htmlFor="id" className="block text-sm font-medium  mb-1">
                        Transaction ID
                     </label>
                     <input
                        type="text"
                        name="id"
                        id="id"
                        value={formData.id}
                        onChange={handleChange}
                        placeholder="Enter transaction ID"
                        className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2  focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                     />
                  </div>
                  <div className="flex gap-4">
                     <div className="flex-1">
                        <label htmlFor="date" className="block text-sm font-medium  mb-1">
                           Date
                        </label>
                        <input
                           type="date"
                           name="date"
                           id="date"
                           value={formData.date}
                           onChange={handleChange}
                           className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2  focus:ring-2 focus:ring-blue-500 focus:outline-none"
                           required
                        />
                     </div>
                     <div className="flex-1">
                        <label htmlFor="time" className="block text-sm font-medium  mb-1">
                           Time
                        </label>
                        <input
                           type="time"
                           name="time"
                           id="time"
                           value={formData.time}
                           onChange={handleChange}
                           className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2  focus:ring-2 focus:ring-blue-500 focus:outline-none"
                           required
                        />
                     </div>
                  </div>
                  <div>
                     <label htmlFor="type" className="block text-sm font-medium  mb-1">
                        Transaction Type
                     </label>
                     <select
                        name="type"
                        id="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2  focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                     >
                        <option value="" disabled>
                           Select Type
                        </option>
                        <option value="Transfer">Transfer</option>
                        <option value="Sale">Sale</option>
                        <option value="Purchase">Purchase</option>
                     </select>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex-1 ">
                        <label htmlFor="amount" className="block  text-sm font-medium  mb-1">
                           Amount
                        </label>
                        <input
                           type="number"
                           name="amount"
                           id="amount"
                           value={formData.amount}
                           onChange={handleChange}
                           placeholder="Enter amount"
                           className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2  focus:ring-2 focus:ring-blue-500 focus:outline-none"
                           required
                        />
                     </div>
                     <div className="flex-1">
                        <label htmlFor="status" className="block text-sm font-medium  mb-1">
                           Status
                        </label>
                        <select
                           name="status"
                           id="status"
                           value={formData.status}
                           onChange={handleChange}
                           className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2  focus:ring-2 focus:ring-blue-500 focus:outline-none"
                           required
                        >
                           <option value="" disabled>
                              Select Status
                           </option>
                           <option value="Successful">Successful</option>
                           <option value="Failed">Failed</option>
                        </select>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex-1">
                        <label htmlFor="discount" className="block text-sm font-medium  mb-1">
                           Discount (%)
                        </label>
                        <input
                           type="number"
                           name="discount"
                           id="discount"
                           value={formData.discount}
                           onChange={handleChange}
                           placeholder="Enter discount"
                           className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2  focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                     </div>
                     <div className="flex-1">
                        <label htmlFor="fee_charge" className="block text-sm font-medium  mb-1">
                           Fee/Charge
                        </label>
                        <input
                           type="number"
                           name="fee_charge"
                           id="fee_charge"
                           value={formData.fee_charge}
                           onChange={handleChange}
                           placeholder="Enter fee/charge"
                           className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2  focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                     </div>
                  </div>
                  <div>
                     <label htmlFor="depository_institution" className="block text-sm font-medium  mb-1">
                        Depository Institution
                     </label>
                     <select
                        name="depository_institution"
                        id="depository_institution"
                        value={formData.depository_institution}
                        onChange={handleChange}
                        className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2  focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                     >
                        <option value="" disabled>
                           Select Institution
                        </option>
                        <option value="Interbanking">Interbanking</option>
                        <option value="EasyPaisa">EasyPaisa</option>
                        <option value="HBL">HBL</option>
                     </select>
                  </div>
                  <div>
                     <label htmlFor="description" className="block text-sm font-medium  mb-1">
                        Description
                     </label>
                     <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter description"
                        className="w-full dark:bg-slate-700 dark:border-slate-700 border rounded-lg p-2  focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        rows="4"
                     />
                  </div>
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 mt-4 ">
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
      </div>
   );
};

export default TransactionForm;
