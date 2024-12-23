import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';

const SendNotificationPage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('alert');
  const [time, setTime] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const db = getDatabase(); // Get a reference to the Firebase Realtime Database
  const functions = getFunctions(); // Initialize Firebase Functions

  const sendTopicNotification = async (title, message) => {
    const sendNotificationFunction = httpsCallable(functions, "sendTopicNotification");
    try {
      const result = await sendNotificationFunction({ title, message });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true); // Show spinner and disable button

    if (!title || !message || !time || !type) {
      setError('All fields are required.');
      setIsSubmitting(false); // Hide spinner
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
      await sendTopicNotification(title, message);

      setSuccess('Notification sent successfully!');
      setTitle('');
      setMessage('');
      setType('alert');
      setTime('');
    } catch (err) {
      setError('Failed to send notification: ' + err.message);
    } finally {
      setIsSubmitting(false); // Hide spinner
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
            className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
            disabled={isSubmitting} // Disable input while submitting
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
            className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
            disabled={isSubmitting} // Disable input while submitting
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
            className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
            disabled={isSubmitting} // Disable select while submitting
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
            className="w-full border border-gray-300 rounded-lg p-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
            disabled={isSubmitting} // Disable input while submitting
          />
        </div>
        <button
          type="submit"
          className={`w-full py-2 rounded-lg shadow-md transition duration-300 ease-in-out ${isSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} text-white`}
          disabled={isSubmitting} // Disable button while submitting
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          ) : null}
          {isSubmitting ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
};

export default SendNotificationPage;
