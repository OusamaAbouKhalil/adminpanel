import React, { useState, useEffect } from 'react';
import { getDatabase, ref, query, orderByChild, limitToLast, onValue } from 'firebase/database';

const LastThreeNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  const db = getDatabase();

  useEffect(() => {
    const fetchNotifications = () => {
      const notificationsRef = ref(db, 'Notifications');
      const notificationsQuery = query(notificationsRef, orderByChild('time'), limitToLast(3)); // Order by 'time' and limit to last 3

      onValue(notificationsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const notificationsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setNotifications(notificationsArray);
        } else {
          setNotifications([]);
        }
      }, (error) => {
        setError('Failed to fetch notifications: ' + error.message);
      });
    };

    fetchNotifications();
  }, [db]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow-md rounded-lg border border-gray-200 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">Last 3 Notifications</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <ul className="space-y-4">
        {notifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
          notifications.map((notification) => (
            <li key={notification.id} className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800">{notification.title}</h2>
              <p className="text-gray-600">{notification.message}</p>
              <p className="text-gray-500 text-sm">{notification.time}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default LastThreeNotificationsPage;
