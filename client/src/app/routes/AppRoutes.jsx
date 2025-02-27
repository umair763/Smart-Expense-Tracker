import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Registration from '../pages/Auth/Registration';
import Login from '../pages/Auth/Login.jsx';
import MainDashBoard from '../pages/MainDashBoard.jsx';
import MainExpenses from '../pages/MainExpenses.jsx';
import MainTransaction from '../pages/MainTransaction.jsx';
import AuthContext from '../context/AuthContext.jsx';
import ProtectedRoutes from '../../ProtectedRoutes.jsx';
import Layout from '../layout/Layout.jsx';



function AppRoutes() {
   const { isAuthenticated } = useContext(AuthContext);

   return (
      <Routes>
         <Route path="/Registration" element={<Registration />} />
         <Route path="/Login" element={<Login />} />

         <Route element={<ProtectedRoutes />}>
            {/* Protected Routes */}
            <Route
               path="/"
               element={
                  isAuthenticated ? (
                     <Layout>
                        <MainDashBoard />
                     </Layout>
                  ) : (
                     <Navigate to="/Login" replace />
                  )
               }
            />

            <Route
               path="/MainExpenses"
               element={
                  <Layout>
                     <MainExpenses />
                  </Layout>
               }
            />
            <Route
               path="/MainTransaction"
               element={
                  <Layout>
                     <MainTransaction />
                  </Layout>
               }
            />
         </Route>

         {/* Public Routes (outside ProtectedRoutes) */}
         <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/signin'} replace />} />
      </Routes>
   );
}

export default AppRoutes;
