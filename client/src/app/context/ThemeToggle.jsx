// src/components/ThemeToggle.js
import { React, useContext } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { ThemeContext } from './ThemeContext';

function ThemeToggle({ setISTheme }) {
   const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

   const toggleTheme = () => {
      setIsDarkMode(!isDarkMode);
      if (setISTheme) {
         setISTheme(!isDarkMode);
      }
   };

   return (
      <div className="flex items-center space-x-2 sm:space-x-3">
         <FaSun className={`text-lg transition-all ${isDarkMode ? 'text-gray-400' : 'text-yellow-500'}`} />
         <label className="relative inline-block w-12 h-6 cursor-pointer">
            <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} className="opacity-0 w-0 h-0" />
            <span
               className={`slider absolute w-full h-full rounded-full transition-all duration-300 
               ${isDarkMode ? 'bg-slate-700' : 'bg-[#4682B4]'}`}
            ></span>
            <span
               className={`dot absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform transform duration-300 shadow-md 
                  ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}
            ></span>
         </label>
         <FaMoon className={`text-lg transition-all ${isDarkMode ? 'text-blue-400' : 'text-gray-400'}`} />
      </div>
   );
}

export default ThemeToggle;
