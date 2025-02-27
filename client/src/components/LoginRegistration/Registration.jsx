import React, { useState } from 'react';
import GoogleSignIn from './GoogleSignIn';
import { useNavigate } from 'react-router-dom';

// Updated ProfileImageUploader to properly pass the selected image to the parent component
const ProfileImageUploader = ({ setImage }) => {
   const [selectedImage, setSelectedImage] = useState(null);

   const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
         const file = e.target.files[0];
         setSelectedImage(URL.createObjectURL(file)); // Preview the image
         setImage(file); // Pass the file to the parent component
      }
   };

   return (
      <div className="flex flex-col items-center justify-center -mt-2 mb-3 ">
         <div className="relative">
            {/* Profile Image or Placeholder */}
            {selectedImage ? (
               <img
                  src={selectedImage}
                  alt="Selected Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400"
               />
            ) : (
               <img
                  src="./src/assets/profile1.webp" // Default profile image
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
                  src="./src/assets/camera1.jpeg" // Default upload icon image
                  alt="Upload Icon"
                  className="w-full h-full object-cover rounded-full m"
               />
            </label>

            {/* File Input (Hidden) */}
            <input type="file" id="file-input" accept="image/*" className="hidden" onChange={handleFileChange} />
         </div>
      </div>
   );
};

function Registration({ setLogin }) {
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [image, setImage] = useState(null); // Image file to send to backend
   const [error, setError] = useState('');
   const navigate = useNavigate();

   const handleRegister = async (e) => {
      e.preventDefault();
      if (!name || !email || !password) {
         setError('All fields are required.');
         return;
      }
      try {
         const formData = new FormData();
         formData.append('name', name);
         formData.append('email', email);
         formData.append('password', password);
         if (image) {
            formData.append('image', image); // Include the image file
         }
         console.log('Form Data:', formData); // Debugging line

         const response = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            body: formData,
         });

         const data = await response.json();
         if (response.ok) {
            navigate('/');
         } else {
            setError(data.message || 'Failed to register. Try again.');
         }
      } catch (err) {
         setError('Server error. Please try again.');
      }
   };

   return (
      <div
         className="flex items-center justify-center min-h-screen bg-gradient-to-b bg-cover bg-center "
         style={{ backgroundImage: 'url(./src/assets/loginBG-3.jpg)' }}
      >
         <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 w-96">
            <h2 className="text-white text-2xl font-bold text-center mb-6">Registration</h2>
            <ProfileImageUploader setImage={setImage} />
            <form onSubmit={handleRegister}>
               {/* Name Field */}
               <div className="mb-4">
                  <label className="sr-only" htmlFor="username">
                     Name
                  </label>
                  <div className="relative">
                     <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                     />
                     <span className="absolute inset-y-0 right-4 flex items-center text-gray-400">
                        <i className="fas fa-user"></i>
                     </span>
                  </div>
               </div>
               {/* Email Field */}
               <div className="mb-4">
                  <label className="sr-only" htmlFor="username">
                     Email
                  </label>
                  <div className="relative">
                     <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                     />
                     <span className="absolute inset-y-0 right-4 flex items-center text-gray-400">
                        <i className="fas fa-user"></i>
                     </span>
                  </div>
               </div>

               {/* Password Field */}
               <div className="mb-4">
                  <label className="sr-only" htmlFor="password">
                     Password
                  </label>
                  <div className="relative">
                     <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                     />
                     <span className="absolute inset-y-0 right-4 flex items-center text-gray-400">
                        <i className="fas fa-lock"></i>
                     </span>
                  </div>
               </div>

               {/* Register Button */}
               <button
                  type="submit"
                  className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
               >
                  REGISTER
               </button>
               {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            </form>

            <div className="w-full bg-white mt-4" style={{ height: '1px' }}></div>
            <div className="mt-2 mb-4 text-center text-white">Register As</div>
            <div className="flex flex-col items-center">
               <GoogleSignIn setLogin={setLogin} />
            </div>
            <p className="text-center text-gray-300 mt-3 -mb-3">
               Already have an account?{' '}
               <button onClick={() => navigate('/')} className="text-purple-400 hover:underline">
                  LOGIN
               </button>
            </p>
         </div>
      </div>
   );
}

export default Registration;
