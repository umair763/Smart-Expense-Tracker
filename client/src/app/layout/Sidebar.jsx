import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import { RiDashboardLine, RiWallet3Line, RiExchangeFundsLine, RiMoneyDollarCircleLine } from 'react-icons/ri';
import { ThemeContext } from '../context/ThemeContext';

const Sidebar = ({ isCollapsed = false }) => {
   const navigate = useNavigate();
   const location = useLocation();
   const [user, setUser] = useState(null);
   const [activeTab, setActiveTab] = useState('dashboard');
   const { isDarkMode } = useContext(ThemeContext);

   useEffect(() => {
      const userData = localStorage.getItem('user'); // Fetch user data from localStorage
      if (userData) {
         setUser(JSON.parse(userData)); // Set user data including image
      } else {
         fetchUserProfile();
      }

      // Set active tab based on current route
      const path = location.pathname;
      if (path.includes('dashboard')) setActiveTab('dashboard');
      else if (path.includes('income')) setActiveTab('income');
      else if (path.includes('expenses')) setActiveTab('expenses');
      else if (path.includes('transactions')) setActiveTab('transactions');
   }, [location.pathname]);

   const fetchUserProfile = async () => {
      try {
         const token = localStorage.getItem('token');
         if (!token) return;

         const response = await fetch('http://localhost:5000/api/users/profile', {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user)); // Store user data in localStorage
         }
      } catch (error) {
         console.error('Error fetching user profile:', error);
      }
   };

   const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
   };

   const handleTabClick = (tab, path) => {
      setActiveTab(tab);
      navigate(path);
   };

   return (
      <div
         className={`h-full flex flex-col justify-between transition-all duration-300 overflow-hidden ${
            isCollapsed ? 'w-16' : 'w-64'
         } ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-[#4682B4] text-white'}`}
      >
         {/* User Profile Section */}
         <div
            className={`flex ${isCollapsed ? 'justify-center' : 'flex-col items-center'} py-6 ${
               isDarkMode ? 'border-b border-gray-700' : 'border-b border-blue-400'
            }`}
         >
            <div
               className={`relative w-16 h-16 overflow-hidden rounded-full border-2 ${
                  isDarkMode ? 'border-blue-500' : 'border-yellow-400'
               }`}
            >
               {user && user.image ? (
                  <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                  <div
                     className={`w-full h-full flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-900' : 'bg-slate-800'
                     } text-white`}
                  >
                     <FaUser size={28} />
                  </div>
               )}
            </div>

            {!isCollapsed && (
               <>
                  <h2 className="mt-3 text-base font-semibold text-white">{user?.name || 'Muhammad Umair'}</h2>
                  <p
                     className={`mt-1 text-xs text-center px-2 truncate w-full ${
                        isDarkMode ? 'text-gray-400' : 'text-blue-100 opacity-90'
                     }`}
                  >
                     {user?.email || 'umair@example.com'}
                  </p>
               </>
            )}
         </div>

         {/* Navigation Items */}
         <div className={`flex-1 ${isCollapsed ? 'px-1' : 'px-3'} py-4`}>
            <nav className="space-y-3">
               <button
                  className={`w-full flex items-center ${
                     isCollapsed ? 'justify-center' : 'justify-start px-4'
                  } py-3.5 rounded-lg ${
                     activeTab === 'dashboard'
                        ? isDarkMode
                           ? 'bg-gray-700 text-blue-400'
                           : 'bg-slate-700 text-white'
                        : isDarkMode
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-white hover:bg-blue-600'
                  }`}
                  onClick={() => handleTabClick('dashboard', '/dashboard')}
                  title="Dashboard"
               >
                  <RiDashboardLine className={isCollapsed ? '' : 'mr-3'} size={22} />
                  {!isCollapsed && <span className="text-base font-medium">Dashboard</span>}
               </button>

               <button
                  className={`w-full flex items-center ${
                     isCollapsed ? 'justify-center' : 'justify-start px-4'
                  } py-3.5 rounded-lg ${
                     activeTab === 'expenses'
                        ? isDarkMode
                           ? 'bg-gray-700 text-blue-400'
                           : 'bg-slate-700 text-white'
                        : isDarkMode
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-white hover:bg-blue-600'
                  }`}
                  onClick={() => handleTabClick('expenses', '/expenses')}
                  title="Expenses"
               >
                  <RiWallet3Line className={isCollapsed ? '' : 'mr-3'} size={22} />
                  {!isCollapsed && <span className="text-base font-medium">Expenses</span>}
               </button>

               <button
                  className={`w-full flex items-center ${
                     isCollapsed ? 'justify-center' : 'justify-start px-4'
                  } py-3.5 rounded-lg ${
                     activeTab === 'income'
                        ? isDarkMode
                           ? 'bg-gray-700 text-blue-400'
                           : 'bg-slate-700 text-white'
                        : isDarkMode
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-white hover:bg-blue-600'
                  }`}
                  onClick={() => handleTabClick('income', '/income')}
                  title="Income"
               >
                  <RiMoneyDollarCircleLine className={isCollapsed ? '' : 'mr-3'} size={22} />
                  {!isCollapsed && <span className="text-base font-medium">Income</span>}
               </button>

               <button
                  className={`w-full flex items-center ${
                     isCollapsed ? 'justify-center' : 'justify-start px-4'
                  } py-3.5 rounded-lg ${
                     activeTab === 'transactions'
                        ? isDarkMode
                           ? 'bg-gray-700 text-blue-400'
                           : 'bg-slate-700 text-white'
                        : isDarkMode
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-white hover:bg-blue-600'
                  }`}
                  onClick={() => handleTabClick('transactions', '/transactions')}
                  title="Transactions"
               >
                  <RiExchangeFundsLine className={isCollapsed ? '' : 'mr-3'} size={22} />
                  {!isCollapsed && <span className="text-base font-medium">Transactions</span>}
               </button>
            </nav>
         </div>

         {/* Sign Out Section */}
         <div className={`${isCollapsed ? 'px-1 py-4' : 'p-4'}`}>
            <button
               className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center py-3' : 'justify-center px-3 py-3'
               } rounded-lg ${
                  isDarkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-red-400 hover:bg-red-500'
               } text-white transition-colors`}
               onClick={handleLogout}
               title="Sign Out"
            >
               <FaSignOutAlt className={isCollapsed ? '' : 'mr-2'} size={18} />
               {!isCollapsed && <span className="text-base font-medium">Sign Out</span>}
            </button>
         </div>
      </div>
   );
};

export default Sidebar;
