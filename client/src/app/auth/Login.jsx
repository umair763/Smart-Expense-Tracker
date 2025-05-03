import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleSignIn from './GoogleSignIn';

function Login({ setLogin }) {
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const navigate = useNavigate();

   // Remove token when the page is closed
   useEffect(() => {
      const handleUnload = () => {
         localStorage.removeItem('token');
      };

      window.addEventListener('beforeunload', handleUnload);

      return () => {
         window.removeEventListener('beforeunload', handleUnload);
      };
   }, []);

   // Check for token in local storage on component mount and validate it
   useEffect(() => {
      const checkToken = async () => {
         const token = localStorage.getItem('token');
         if (token) {
            try {
               const response = await fetch('http://localhost:5000/api/users/login', {
                  method: 'GET',
                  headers: {
                     'Content-Type': 'application/json',
                     Authorization: `Bearer ${token}`,
                  },
               });

               if (response.ok) {
                  setLogin(true); // Token is valid, log the user in
               } else {
                  localStorage.removeItem('token'); // Token is invalid, remove it
                  setLogin(false);
               }
            } catch (err) {
               setError('Error validating token. Please log in again.');
            }
         } else {
            setLogin(false); // No token found, user must log in
         }
      };

      checkToken();
   }, [setLogin]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
         });

         const data = await response.json();

         if (response.ok) {
            localStorage.setItem('token', data.token); // Save token to local storage
            setLogin(true);
            navigate('/dashboard'); // Redirect after login
         } else {
            setError(data.message || 'Failed to login. Try again.');
         }
      } catch (err) {
         setError('Something went wrong. Please try again.');
      }
   };

   return (
      <div
         className="flex items-center justify-center min-h-screen bg-gradient-to-b bg-cover bg-center px-4 py-6"
         style={{ backgroundImage: 'url(/src/assets/images/loginBG-2.jpg)' }}
      >
         <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md">
            <h2 className="text-white text-xl sm:text-2xl font-bold text-center mb-6">Login</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
               <div className="mb-4">
                  <input
                     type="text"
                     placeholder="Name"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
               </div>
               <div className="mb-4">
                  <input
                     type="email"
                     placeholder="Email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                     required
                  />
               </div>
               <div className="mb-4">
                  <input
                     type="password"
                     placeholder="Password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                     required
                  />
               </div>
               <button
                  type="submit"
                  className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors duration-200"
               >
                  LOGIN
               </button>
            </form>
            <div className="w-full bg-white mt-6" style={{ height: '1px' }}></div>
            <div className="mt-2 mb-4 text-center text-white">Continue As</div>
            <div className="flex flex-col items-center">
               <GoogleSignIn setLogin={setLogin} />
            </div>
            <p className="text-center text-gray-300 mt-6">
               Don't have an account?{' '}
               <button onClick={() => navigate('/register')} className="text-purple-400 hover:underline">
                  SIGN UP
               </button>
            </p>
         </div>
      </div>
   );
}

export default Login;
