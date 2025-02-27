import React from 'react';
import SideBar from './Sidebar';

function Layout({ children }) {
   return (
      <div className="flex flex-col min-h-screen bg-gray-50">
         {/* Added some basic styling */}
         <div className="flex-grow flex">
            {/* Added Flex for Sidebar and Main content */}
            <SideBar />
            <main className="p-6 bg-gray-50 w-full">
               {/* Added some basic styling */}
               <div className="max-w-7xl mx-auto">{children}</div>
            </main>
         </div>
      </div>
   );
}

export default Layout;
