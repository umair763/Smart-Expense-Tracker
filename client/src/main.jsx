import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = '316180628351-2j6kgtqo4hg7b7enpn6kgvsgkvkjbmeg.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
   <StrictMode>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
         <App />
      </GoogleOAuthProvider>
   </StrictMode>
);
