import React, { useState, useEffect } from 'react';
import { getDatabase, ref, query, orderByChild, limitToLast, onValue, update } from 'firebase/database';

const EditNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);
  const db = getDatabase();

  useEffect(() => {
    const notificationsRef = ref(db, 'Notifications');
    const notificationsQuery = query(notificationsRef, orderByChild('timestamp'), limitToLast(3));

    const unsubscribe = onValue(notificationsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNotifications(Object.entries(data).map(([id, value]) => ({ id, ...value })));
      }
    });

    return () => unsubscribe();
  }, [db]);

  const handleChange = (id, field, value) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, [field]: value } : notification
    ));
  };

  const handleUpdate = async (id) => {
    const updatedNotification = notifications.find(notification => notification.id === id);
    if (updatedNotification) {
      const notificationRef = ref(db, `Notifications/${id}`);
      try {
        await update(notificationRef, updatedNotification);
        setSuccess('Notification updated successfully!');
        setErrors([]);
      } catch (err) {
        setErrors(prevErrors => [...prevErrors, `Failed to update notification: ${err.message}`]);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow-lg rounded-lg border border-gray-200 max-w-3xl">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 text-center">Edit Notifications</h1>
      {success && <p className="text-green-700 bg-green-100 border border-green-300 rounded-lg p-4 mb-6">{success}</p>}
      {errors.length > 0 && errors.map((error, index) => (
        <p key={index} className="text-red-700 bg-red-100 border border-red-300 rounded-lg p-4 mb-6">{error}</p>
      ))}
      {notifications.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
      ) : (
        notifications.map(notification => (
          <form key={notification.id} onSubmit={(e) => { e.preventDefault(); handleUpdate(notification.id); }} className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
            <div className="mb-4">
              <label htmlFor={`title-${notification.id}`} className="block text-gray-700 text-lg font-semibold mb-2">Title</label>
              <input
                type="text"
                id={`title-${notification.id}`}
                value={notification.title}
                onChange={(e) => handleChange(notification.id, 'title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                placeholder="Enter title here"
              />
            </div>
            <div className="mb-4">
              <label htmlFor={`message-${notification.id}`} className="block text-gray-700 text-lg font-semibold mb-2">Message</label>
              <textarea
                id={`message-${notification.id}`}
                value={notification.message}
                onChange={(e) => handleChange(notification.id, 'message', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                placeholder="Enter message here"
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor={`type-${notification.id}`} className="block text-gray-700 text-lg font-semibold mb-2">Type</label>
              <select
                id={`type-${notification.id}`}
                value={notification.type}
                onChange={(e) => handleChange(notification.id, 'type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                <option value="alert">Alert</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor={`time-${notification.id}`} className="block text-gray-700 text-lg font-semibold mb-2">Time</label>
              <input
                type="datetime-local"
                id={`time-${notification.id}`}
                value={notification.time}
                onChange={(e) => handleChange(notification.id, 'time', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Update Notification
            </button>
          </form>
        ))
      )}
    </div>
  );
};

export default EditNotificationsPage;
