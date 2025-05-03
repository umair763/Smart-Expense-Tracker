import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleSignIn from './GoogleSignIn';

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
      <div className="flex flex-col items-center justify-center mb-4">
         <div className="relative">
            {/* Profile Image or Placeholder */}
            {selectedImage ? (
               <img
                  src={selectedImage}
                  alt="Selected Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-yellow-400"
               />
            ) : (
               <img
                  src="/src/assets/images/profile1.webp" // Default profile image
                  alt="Default Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-yellow-400"
               />
            )}

            {/* Upload Icon */}
            <label
               htmlFor="file-input"
               className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-yellow-400 flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-600"
            >
               <img
                  src="/src/assets/images/camera1.jpeg" // Default upload icon image
                  alt="Upload Icon"
                  className="w-full h-full object-cover rounded-full"
               />
            </label>

            {/* File Input (Hidden) */}
            <input type="file" id="file-input" accept="image/*" className="hidden" onChange={handleFileChange} />
         </div>
      </div>
   );
};

function Registration({ setLogin }) {
   const [image, setImage] = useState(null);
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const navigate = useNavigate();

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');

      // Check if all fields are filled before submitting
      if (!name || !email || !password || !image) {
         setError('Please fill in all the fields.');
         return;
      }

      // Prepare FormData for the multipart form submission
      const formData = new FormData();
      formData.append('image', image);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);

      try {
         const response = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            body: formData, // Send the formData
         });

         const data = await response.json();

         if (response.ok) {
            setSuccess('Registration successful!');
            setTimeout(() => (window.location.href = '/'), 2000);
         } else {
            // Provide detailed error messages based on the response
            if (data.message) {
               setError(data.message);
            } else {
               setError('Registration failed. Please check your inputs.');
            }
         }
      } catch (err) {
         setError('An error occurred. Please try again.');
      }
   };

   return (
      <div
         className="flex items-center justify-center min-h-screen bg-gradient-to-b bg-cover bg-center px-4 py-6"
         style={{ backgroundImage: 'url(/src/assets/images/loginBG-3.jpg)' }}
      >
         <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md">
            <h2 className="text-white text-xl sm:text-2xl font-bold text-center mb-4">Registration</h2>
            {success && <p className="text-green-400 text-center mb-4">{success}</p>}
            <ProfileImageUploader setImage={setImage} />
            <form onSubmit={handleSubmit}>
               {/* Name Field */}
               <div className="mb-4">
                  <div className="relative">
                     <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                     />
                  </div>
               </div>
               {/* Email Field */}
               <div className="mb-4">
                  <div className="relative">
                     <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                     />
                  </div>
               </div>

               {/* Password Field */}
               <div className="mb-4">
                  <div className="relative">
                     <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-2 px-4 bg-white/20 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                     />
                  </div>
               </div>

               {/* Register Button */}
               <button
                  type="submit"
                  className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors duration-200"
               >
                  REGISTER
               </button>
               {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </form>

            <div className="w-full bg-white mt-6" style={{ height: '1px' }}></div>
            <div className="mt-2 mb-4 text-center text-white">Register As</div>
            <div className="flex flex-col items-center">
               <GoogleSignIn setLogin={setLogin} />
            </div>
            <p className="text-center text-gray-300 mt-6">
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
