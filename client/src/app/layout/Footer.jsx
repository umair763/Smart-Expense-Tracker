import React, { useContext } from 'react';
import { RiHeartFill } from 'react-icons/ri';
import { ThemeContext } from '../context/ThemeContext';

const Footer = () => {
   const { isDarkMode } = useContext(ThemeContext);
   const currentYear = new Date().getFullYear();

   return (
      <footer className={`mt-auto py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
         <div className="w-full px-4 max-w-7xl mx-auto">
            <div className="flex justify-center items-center">
               <div className="flex items-center">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                     <span className="font-medium">Expense Tracker</span> &copy; {currentYear}
                  </p>
                  {/* <span className="mx-2">•</span>
                  <p className={`text-sm flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                     Made with{' '}
                     <RiHeartFill className={`mx-1 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} size={14} /> by
                     <span className={`ml-1 font-medium ${isDarkMode ? 'text-blue-400' : 'text-[#4682B4]'}`}>
                        Muhammad Umair
                     </span>
                  </p> */}
               </div>
            </div>
         </div>
      </footer>
   );
};

export default Footer;
