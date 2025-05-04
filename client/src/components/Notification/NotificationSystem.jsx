import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { IoMdClose } from 'react-icons/io';
import { FiAlertCircle, FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';

const NotificationSystem = () => {
   const [notifications, setNotifications] = useState([]);
   const [socket, setSocket] = useState(null);

   // Connect to Socket.IO server
   useEffect(() => {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      // Socket connection events
      newSocket.on('connect', () => {
         console.log('Connected to notification server');
      });

      newSocket.on('disconnect', () => {
         console.log('Disconnected from notification server');
      });

      // Clean up on unmount
      return () => {
         newSocket.disconnect();
      };
   }, []);

   // Listen for notifications
   useEffect(() => {
      if (!socket) return;

      socket.on('notification', (data) => {
         // Add new notification with unique ID
         const newNotification = {
            id: Date.now(),
            ...data,
            read: false,
         };

         setNotifications((prev) => [newNotification, ...prev].slice(0, 5)); // Keep only 5 most recent

         // Auto-remove notification after 5 seconds
         setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
         }, 5000);
      });

      return () => {
         socket.off('notification');
      };
   }, [socket]);

   // Remove notification
   const removeNotification = (id) => {
      setNotifications(notifications.filter((n) => n.id !== id));
   };

   // Get icon based on operation type
   const getNotificationIcon = (type) => {
      switch (type) {
         case 'insert':
            return <FiPlus className="text-green-500" />;
         case 'update':
            return <FiEdit className="text-blue-500" />;
         case 'delete':
            return <FiTrash2 className="text-red-500" />;
         default:
            return <FiAlertCircle className="text-yellow-500" />;
      }
   };

   // Get background color based on collection
   const getNotificationColor = (collection) => {
      switch (collection) {
         case 'expenses':
            return 'bg-red-100 border-red-300';
         case 'incomes':
            return 'bg-green-100 border-green-300';
         case 'transactions':
            return 'bg-blue-100 border-blue-300';
         default:
            return 'bg-gray-100 border-gray-300';
      }
   };

   if (notifications.length === 0) return null;

   return (
      <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
         {notifications.map((notification) => (
            <div
               key={notification.id}
               className={`${getNotificationColor(
                  notification.collection
               )} border rounded-lg shadow-md p-3 flex items-start transition-all duration-300 animate-slide-in`}
            >
               <div className="mr-3 mt-1">{getNotificationIcon(notification.type)}</div>

               <div className="flex-1">
                  <div className="font-bold">Trigger Says:</div>
                  <div className="text-sm">{notification.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                     {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
               </div>

               <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
               >
                  <IoMdClose />
               </button>
            </div>
         ))}
      </div>
   );
};

export default NotificationSystem;
