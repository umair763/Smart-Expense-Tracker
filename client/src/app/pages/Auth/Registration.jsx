import React, { useState } from 'react';
import GoogleSignIn from './GoogleSignIn';
import { useNavigate } from 'react-router-dom';

const ProfileImageUploader = ({ setImage }) => {
   const [username, setUsername] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [profileImage, setProfileImage] = useState(null);
   const navigate = useNavigate();

   const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            setProfileImage(reader.result);
         };
         reader.readAsDataURL(file);
      }
   };

   return (
      <div className="flex flex-col items-center justify-center -mt-2 mb-3 ">
         <div className="relative">
            {/* Profile Image or Placeholder */}
            {profileImage ? (
               <img
                  src={profileImage}
                  alt="Selected Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400"
               />
            ) : (
               <img
                  src=".\src\assets\images\profile1.webp" // Default profile image
                  alt="Default Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-yellow-400"
               />
            )}

            {/* Upload Icon */}
            <label
               htmlFor="file-input"
               className="absolute bottom-0 right-0 w-10 h-10 rounded-full border-yellow-400 flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-600"
            >
               <img
                  src=".\src\assets\images\camera1.jpeg" // Default upload icon image
                  alt="Upload Icon"
                  className="w-full h-full object-cover rounded-full m"
               />
            </label>

            {/* File Input (Hidden) */}
            <input type="file" id="file-input" accept="image/*" className="hidden" onChange={handleImageUpload} />
         </div>
      </div>
   );
};


const Registration = () => {
   const [username, setUsername] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [profileImage, setProfileImage] = useState(null);
   const [error, setError] = useState('');
   const navigate = useNavigate();

   const handleSubmit = (e) => {
      e.preventDefault();

      if (!username || !email || !password) {
         setError('All fields are required.');
         return;
      }

      // Save user details to localStorage
      const user = { username, email, password, profileImage };
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to login page after registration
      navigate('/Login');
   };

   return (
      <div
         className="flex items-center justify-center min-h-screen bg-gradient-to-b bg-cover bg-center"
         style={{ backgroundImage: 'url(./src/assets/images/loginBG-3.jpg)' }}
      >
         <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 w-96">
            <h2 className="text-white text-2xl font-bold text-center mb-6">Registration</h2>
            <ProfileImageUploader setImage={setProfileImage} />
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
               {/* Username Field */}
               <div className="mb-4">
                  <input
                     type="text"
                     placeholder="Username"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
               </div>

               {/* Email Field */}
               <div className="mb-4">
                  <input
                     type="email"
                     placeholder="Email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
               </div>

               {/* Password Field */}
               <div className="mb-4">
                  <input
                     type="password"
                     placeholder="Password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
               </div>

               {/* Register Button */}
               <button
                  type="submit"
                  className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
               >
                  REGISTER
               </button>
            </form>
            <p className="text-center text-gray-300 mt-3">
               Already have an account?{' '}
               <button onClick={() => navigate('/Login')} className="text-purple-400 hover:underline">
                  LOGIN
               </button>
            </p>
         </div>
      </div>
   );
};

export default Registration;
