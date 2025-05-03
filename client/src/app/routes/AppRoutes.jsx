import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../auth/Login';
import Registration from '../auth/Registration';
import MainDashboard from '../pages/MainDashboard';
import MainExpenses from '../pages/MainExpenses';
import MainIncome from '../pages/MainIncome';
import MainTransaction from '../pages/MainTransaction';
import Layout from '../layout/Layout';

const AppRoutes = () => {
   const [isLoggedIn, setIsLoggedIn] = useState(false);

   useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
         setIsLoggedIn(true);
      } else {
         setIsLoggedIn(false);
      }
   }, []);

   const handleLogin = (status) => {
      setIsLoggedIn(status);
   };

   return (
      <Routes>
         {!isLoggedIn ? (
            <>
               <Route path="/" element={<Login setLogin={handleLogin} />} />
               <Route path="/register" element={<Registration setLogin={handleLogin} />} />
               <Route path="*" element={<Navigate to="/" />} />
            </>
         ) : (
            <>
               <Route element={<Layout />}>
                  <Route path="/dashboard" element={<MainDashboard />} />
                  <Route path="/income" element={<MainIncome />} />
                  <Route path="/expenses" element={<MainExpenses />} />
                  <Route path="/transactions" element={<MainTransaction />} />
               </Route>
               <Route path="/" element={<Navigate to="/dashboard" />} />
               <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
         )}
      </Routes>
   );
};

export default AppRoutes;
