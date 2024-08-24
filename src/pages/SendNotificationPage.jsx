import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';

const SendNotificationPage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('alert');
  const [time, setTime] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const db = getDatabase(); // Get a reference to the Firebase Realtime Database

  const sendNotification = async (title, body) => {
    const sendNotificationFunction = httpsCallable(
        functions,
        "	sendTopicNotification"
    );
    try {
        const result = await sendNotificationFunction({title, body });
        console.log(result.data);
        if (result.data.success) {
            console.log("Notification sent successfully");
        } else {
            console.log("Failed to send notification:", result.data.error);
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !message || !time || !type) {
      setError('All fields are required.');
      return;
    }

    try {
      const notificationsRef = ref(db, 'Notifications');
      await push(notificationsRef, {
        title,
        message,
        type,
        time,
      });
      await sendNotification(
                    title,
                    message
                );

      setSuccess('Notification sent successfully!');
      setTitle('');
      setMessage('');
      setType('alert');
      setTime('');
    } catch (err) {
      setError('Failed to send notification: ' + err.message);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow-md rounded-lg border border-gray-200 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">Send Notification</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-gray-800 font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-gray-800 font-medium mb-2">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          ></textarea>
        </div>
        <div>
          <label htmlFor="type" className="block text-gray-800 font-medium mb-2">
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            <option value="alert">Alert</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
          </select>
        </div>
        <div>
          <label htmlFor="time" className="block text-gray-800 font-medium mb-2">
            Time
          </label>
          <input
            type="datetime-local"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
        >
          Send Notification
        </button>
      </form>
    </div>
  );
};

export default SendNotificationPage;
