import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/routes/AppRoutes';
import { ThemeProvider } from './app/context/ThemeContext';
import { AuthProvider } from './app/context/AuthContext';
import './App.css';

function App() {
   return (
      <BrowserRouter>
         <AuthProvider>
            <ThemeProvider>
               <AppRoutes />
            </ThemeProvider>
         </AuthProvider>
      </BrowserRouter>
   );
}

export default App;
