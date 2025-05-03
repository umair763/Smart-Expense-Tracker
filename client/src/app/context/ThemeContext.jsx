// src/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';

// Create the ThemeContext
export const ThemeContext = createContext();

// The ThemeProvider component that will hold the dark mode state
export const ThemeProvider = ({ children }) => {
   const [isDarkMode, setIsDarkMode] = useState(false);

   useEffect(() => {
      // Get saved theme from localStorage or default to light
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
         setIsDarkMode(savedTheme === 'dark');
      } else {
         setIsDarkMode(false); // default to light mode
      }
   }, []);

   // Apply the theme to the body tag
   useEffect(() => {
      if (isDarkMode) {
         document.body.classList.add('dark');
         localStorage.setItem('theme', 'dark');
      } else {
         document.body.classList.remove('dark');
         localStorage.setItem('theme', 'light');
      }
   }, [isDarkMode]);

   return <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>{children}</ThemeContext.Provider>;
};
