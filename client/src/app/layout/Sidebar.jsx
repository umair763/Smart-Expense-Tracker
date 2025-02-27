import React, { useState } from 'react';
import { FaTachometerAlt, FaWallet, FaExchangeAlt, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function SideBar({ setLogin }) {
   const [activeTab, setActiveTab] = useState('dashboard');
   const navigate = useNavigate();

   const handleTabClick = (tab, path) => {
      setActiveTab(tab);
      navigate(path);
   };

   const handleLogout = () => {
      // Remove the stored user data from localStorage
      localStorage.removeItem('user'); // Clear the stored user data

      // Redirect to login page after logout
      navigate('/Login');
   };

   return (
      <div className="h-full flex flex-col justify-between bg-[#5586a5] text-slate-950 dark:text-white dark:bg-slate-800">
         <div className="flex flex-col items-center mt-8">
            <img
               src="./src/images/peakpx.jpg"
               alt="Profile"
               className="w-24 h-24 rounded-full border-4 border-yellow-400 hidden sm:block"
            />
            <h2 className="mt-4 text-lg font-semibold hidden sm:block">Muhammad Umair</h2>
         </div>

         <div className="flex flex-col items-start mt-8 space-y-4 px-2 bg-[#417696] dark:bg-slate-700 p-2 m-3 h-1/2 rounded-lg">
            <button
               className={`w-full flex items-center py-2 px-2 rounded justify-start text-left ${
                  activeTab === 'dashboard'
                     ? 'bg-[#4783a8] dark:bg-slate-600'
                     : 'hover:bg-[#4783a8] dark:hover:bg-slate-600'
               }`}
               onClick={() => handleTabClick('dashboard', '/')}
            >
               <FaTachometerAlt className="mr-4" size={16} />
               <span className="flex-grow">Dashboard</span>
            </button>
            <button
               className={`w-full flex items-center py-2 px-2 rounded justify-start text-left ${
                  activeTab === 'expenses'
                     ? 'bg-[#4783a8] dark:bg-slate-600'
                     : 'hover:bg-[#4783a8] dark:hover:bg-slate-600'
               }`}
               onClick={() => handleTabClick('expenses', '/MainExpenses')}
            >
               <FaWallet className="mr-4" size={16} />
               <span className="flex-grow">Expenses</span>
            </button>
            <button
               className={`w-full flex items-center py-2 px-2 rounded justify-start text-left ${
                  activeTab === 'transactions'
                     ? 'bg-[#4783a8] dark:bg-slate-600'
                     : 'hover:bg-[#4783a8] dark:hover:bg-slate-600'
               }`}
               onClick={() => handleTabClick('transactions', '/MainTransaction')}
            >
               <FaExchangeAlt className="mr-4" size={16} />
               <span className="flex-grow">Transactions</span>
            </button>
         </div>

         <div className="flex flex-col items-start p-4">
            <button
               className="w-full flex items-center py-2 px-2 hover:bg-red-400 bg-red-300 text-red-700 rounded justify-start text-left"
               onClick={handleLogout}
            >
               <FaSignOutAlt className="mr-4" size={20} />
               <span className="flex-grow">Sign Out</span>
            </button>
         </div>
      </div>
   );
}

export default SideBar;
