import React, { createContext } from 'react';

const AuthContext = createContext({
   isAuthenticated: false,
   setIsAuthenticated: () => {},
   user: null,
   setUser: () => {},
});

export default AuthContext;
