// src/components/ThemeToggle.js
import { React, useContext } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { ThemeContext } from './ThemeContext';

function ThemeToggle({ setISTheme }) {
   const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

   const toggleTheme = () => {
      setIsDarkMode(!isDarkMode);
      setISTheme(!isDarkMode);
   };

   return (
      <div className="flex items-center space-x-2 sm:space-x-4 -mt-2 mr-2">
         <FaSun className={`text-sm sm:text-lg transition-all ${isDarkMode ? 'text-gray-400' : 'text-yellow-500'}`} />
         <label className="relative inline-block w-10 h-5 sm:w-12 sm:h-6 cursor-pointer">
            <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} className="opacity-0 w-0 h-0" />
            <span className="slider absolute w-full h-full bg-gray-500 rounded-full transition-all"></span>
            <span
               className={`dot absolute top-1 left-1 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full transition-transform transform ${
                  isDarkMode ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
               }`}
            ></span>
         </label>
         <FaMoon className={`text-sm sm:text-lg transition-all ${isDarkMode ? 'text-yellow-400' : 'text-gray-400'}`} />
      </div>
   );
}

export default ThemeToggle;
