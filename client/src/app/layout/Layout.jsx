import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import NotificationSystem from '../../components/Notification/NotificationSystem';

const Layout = () => {
   const [isSidebarVisible, setIsSidebarVisible] = useState(true);
   const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);
   const [screenWidth, setScreenWidth] = useState(window.innerWidth);
   const { isDarkMode } = useContext(ThemeContext);

   useEffect(() => {
      const handleResize = () => {
         const width = window.innerWidth;
         setScreenWidth(width);
         setIsSmallScreen(width <= 768);

         // Auto-hide sidebar on small screens, auto-show on larger screens
         if (width > 768) {
            setIsSidebarVisible(true);
         } else {
            setIsSidebarVisible(false);
         }
      };

      // Set initial state
      handleResize();

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   const toggleSidebar = () => {
      setIsSidebarVisible(!isSidebarVisible);
   };

   // Calculate sidebar width based on screen size
   const sidebarWidth = screenWidth <= 640 ? '80px' : screenWidth <= 1024 ? '200px' : '260px';
   const collapsedSidebarWidth = '80px';

   return (
      <div
         className={`flex flex-col min-h-screen relative ${
            isDarkMode
               ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-slate-800'
               : 'bg-gradient-to-br from-blue-50 via-white to-gray-50'
         }`}
      >
         <Header
            toggleSidebar={toggleSidebar}
            isSmallScreen={isSmallScreen}
            isSidebarVisible={isSidebarVisible}
            sidebarWidth={isSmallScreen || !isSidebarVisible ? collapsedSidebarWidth : sidebarWidth}
         />

         {/* Notification System */}
         <NotificationSystem />

         <div className="flex flex-1 mt-16 relative">
            {/* Sidebar container with responsive width and position */}
            <div
               className={`fixed top-16 left-0 bottom-0 z-40 transition-all duration-300 ease-in-out overflow-y-auto ${
                  isSmallScreen && !isSidebarVisible ? '-translate-x-full' : 'translate-x-0'
               }`}
               style={{
                  width: isSmallScreen || !isSidebarVisible ? collapsedSidebarWidth : sidebarWidth,
               }}
            >
               <Sidebar isCollapsed={isSmallScreen || !isSidebarVisible} />
            </div>

            {/* Main content area with responsive margin */}
            <div
               className={`flex-1 transition-all duration-300 ease-in-out w-full overflow-y-auto scrollable-content ${
                  isDarkMode ? 'bg-opacity-40' : 'bg-opacity-70'
               }`}
               style={{
                  marginLeft:
                     isSmallScreen && !isSidebarVisible
                        ? '0'
                        : isSmallScreen || !isSidebarVisible
                        ? collapsedSidebarWidth
                        : sidebarWidth,
                  paddingBottom: '50px', // Increased bottom padding
                  height: 'calc(100vh - 64px)', // Subtract header height
               }}
            >
               <main className="w-full px-4 py-6 content-area">
                  <Outlet />
               </main>
               <Footer />
            </div>
         </div>
      </div>
   );
};

export default Layout;
