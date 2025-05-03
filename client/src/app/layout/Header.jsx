import React, { useState, useEffect } from 'react';
import ThemeToggle from '../context/ThemeToggle';
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

const Header = ({ toggleSidebar, isSmallScreen, isSidebarVisible, sidebarWidth }) => {
   // Get current time to display appropriate greeting
   const [greeting, setGreeting] = useState('');
   const [userName, setUserName] = useState('');

   useEffect(() => {
      // Set greeting based on time of day
      const hours = new Date().getHours();
      if (hours < 12) {
         setGreeting('Good Morning');
      } else if (hours < 17) {
         setGreeting('Good Afternoon');
      } else {
         setGreeting('Good Evening');
      }

      // Get user info from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
         const user = JSON.parse(userData);
         setUserName(user.name || 'User');
      }
   }, []);

   return (
      <header
         className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-slate-800 shadow-md transition-all duration-300 ease-in-out"
         style={{
            marginLeft: isSidebarVisible && !isSmallScreen ? sidebarWidth : '0',
            width: isSidebarVisible && !isSmallScreen ? `calc(100% - ${sidebarWidth})` : '100%',
         }}
      >
         <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center">
               <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none transition-colors duration-200 border border-gray-200 dark:border-slate-600"
                  aria-label="Toggle Sidebar"
               >
                  {isSidebarVisible ? (
                     <RiMenuFoldLine className="h-5 w-5 text-[#4682B4] dark:text-blue-400" />
                  ) : (
                     <RiMenuUnfoldLine className="h-5 w-5 text-[#4682B4] dark:text-blue-400" />
                  )}
               </button>

               <h1 className="ml-4 font-semibold text-[#4682B4] dark:text-blue-400 hidden sm:block text-lg">
                  Expense Tracker
               </h1>
            </div>

            <div className="flex items-center space-x-6">
               <div className="hidden md:block">
                  <div className="text-gray-600 dark:text-gray-300">
                     <span className="font-medium">{greeting}, </span>
                     <span className="font-bold text-[#4682B4] dark:text-blue-400">{userName}</span>
                  </div>
               </div>

               <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

               <ThemeToggle />
            </div>
         </div>
      </header>
   );
};

export default Header;
