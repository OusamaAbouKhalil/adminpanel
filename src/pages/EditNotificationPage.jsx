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
      } catch (err) {
        setErrors(prevErrors => [...prevErrors, `Failed to update notification: ${err.message}`]);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow-md rounded-lg border border-gray-200 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">Edit Notifications</h1>
      {success && <p className="text-green-600 mb-4">{success}</p>}
      {errors.length > 0 && errors.map((error, index) => (
        <p key={index} className="text-red-600 mb-4">{error}</p>
      ))}
      {notifications.length === 0 ? (
        <p>Loading...</p>
      ) : (
        notifications.map(notification => (
          <form key={notification.id} onSubmit={(e) => { e.preventDefault(); handleUpdate(notification.id); }} className="space-y-6 mb-6">
            <div>
              <label htmlFor={`title-${notification.id}`} className="block text-gray-800 font-medium mb-2">Title</label>
              <input
                type="text"
                id={`title-${notification.id}`}
                value={notification.title}
                onChange={(e) => handleChange(notification.id, 'title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor={`message-${notification.id}`} className="block text-gray-800 font-medium mb-2">Message</label>
              <textarea
                id={`message-${notification.id}`}
                value={notification.message}
                onChange={(e) => handleChange(notification.id, 'message', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              ></textarea>
            </div>
            <div>
              <label htmlFor={`type-${notification.id}`} className="block text-gray-800 font-medium mb-2">Type</label>
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
            <div>
              <label htmlFor={`time-${notification.id}`} className="block text-gray-800 font-medium mb-2">Time</label>
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
              className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
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
