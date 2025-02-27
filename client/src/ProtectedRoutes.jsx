import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AuthContext from './app/context/AuthContext';

const ProtectedRoutes = () => {
   const { isAuthenticated } = useContext(AuthContext);
   return isAuthenticated ? <Outlet /> : <Navigate to="/Login" replace />;
};

export default ProtectedRoutes;
