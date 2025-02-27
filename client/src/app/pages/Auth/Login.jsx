import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import GoogleSignIn from './GoogleSignIn';

function Login({ setLogin }) {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const navigate = useNavigate();
   const { setIsAuthenticated, setUser } = useContext(AuthContext);

   const handleSubmit = (e) => {
      e.preventDefault();

      const storedUser = localStorage.getItem('user'); // Get user from localStorage

      if (storedUser) {
         const user = JSON.parse(storedUser);

         // Check if entered credentials match the stored credentials
         if (user.email === email && user.password === password) {
            setUser(user); // Set user data in context
            setIsAuthenticated(true); // Mark the user as authenticated
            navigate('/MainDashBoard'); // Redirect to the main dashboard
         } else {
            setError('Invalid credentials, please try again.'); // Show error message for incorrect login
         }
      } else {
         setError('No user found. Please sign up first.'); // If no user found in localStorage
      }
   };

   return (
      <div
         className="flex items-center justify-center min-h-screen bg-gradient-to-b bg-cover bg-center"
         style={{ backgroundImage: 'url(./src/assets/images/loginBG-2.jpg)' }}
      >
         <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 w-96">
            <h2 className="text-white text-2xl font-bold text-center mb-6">Login</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
               <div className="mb-4">
                  <input
                     type="email"
                     placeholder="Email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
               </div>
               <div className="mb-4">
                  <input
                     type="password"
                     placeholder="Password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
               </div>
               <button
                  type="submit"
                  className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
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
               <button onClick={() => navigate('/Registration')} className="text-purple-400 hover:underline">
                  SIGN UP
               </button>
            </p>
         </div>
      </div>
   );
}

export default Login;
