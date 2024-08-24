import React, { useState, useEffect } from 'react';
import { getDatabase, ref, query, orderByChild, limitToLast, onValue, update, remove } from 'firebase/database';

const EditNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [dialog, setDialog] = useState({ open: false, type: '', id: null });
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

  const handleUpdate = async () => {
    console.log('Update button clicked'); // Debugging line
    const { id } = dialog;
    const updatedNotification = notifications.find(notification => notification.id === id);
    
    if (updatedNotification) {
      console.log('Updating notification:', updatedNotification); // Debugging line
      const notificationRef = ref(db, `Notifications/${id}`);
      try {
        await update(notificationRef, updatedNotification);
        setSuccess('Notification updated successfully!');
        setErrors([]);
        setDialog({ open: false, type: '', id: null });
        setEditingId(null);
      } catch (err) {
        setErrors(prevErrors => [...prevErrors, `Failed to update notification: ${err.message}`]);
        console.error('Update error:', err); // Debugging line
      }
    } else {
      console.error('No notification found for ID:', id); // Debugging line
    }
  };

  const handleDelete = async () => {
    const { id } = dialog;
    const notificationRef = ref(db, `Notifications/${id}`);
    try {
      await remove(notificationRef);
      setSuccess('Notification deleted successfully!');
      setErrors([]);
      setDialog({ open: false, type: '', id: null });
    } catch (err) {
      setErrors(prevErrors => [...prevErrors, `Failed to delete notification: ${err.message}`]);
    }
  };

  const startEditing = (id) => {
    setEditingId(id);
  };

  const isEditing = (id) => editingId === id;

  const openDialog = (type, id) => {
    setDialog({ open: true, type, id });
  };

  const closeDialog = () => {
    setDialog({ open: false, type: '', id: null });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow-lg rounded-lg border border-gray-200 max-w-6xl">
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white divide-y divide-gray-200 border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-100 text-gray-500 uppercase text-xs leading-normal">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Message</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {notifications.map(notification => (
                <tr key={notification.id} className={isEditing(notification.id) ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {isEditing(notification.id) ? (
                      <input
                        type="text"
                        value={notification.title}
                        onChange={(e) => handleChange(notification.id, 'title', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                      />
                    ) : (
                      notification.title
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {isEditing(notification.id) ? (
                      <textarea
                        value={notification.message}
                        onChange={(e) => handleChange(notification.id, 'message', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                      ></textarea>
                    ) : (
                      notification.message
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {isEditing(notification.id) ? (
                      <select
                        value={notification.type}
                        onChange={(e) => handleChange(notification.id, 'type', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                      >
                        <option value="alert">Alert</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                      </select>
                    ) : (
                      notification.type
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {isEditing(notification.id) ? (
                      <input
                        type="datetime-local"
                        value={notification.time}
                        onChange={(e) => handleChange(notification.id, 'time', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                      />
                    ) : (
                      new Date(notification.time).toLocaleString()
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isEditing(notification.id) ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out mr-2"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-700 transition duration-300 ease-in-out"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(notification.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDialog('delete', notification.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {dialog.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
            <h2 className="text-lg font-bold mb-4">
              {dialog.type === 'delete' ? 'Confirm Deletion' : 'Confirm Update'}
            </h2>
            <p className="mb-4">
              {dialog.type === 'delete' 
                ? 'Are you sure you want to delete this notification?' 
                : 'Are you sure you want to update this notification?'}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={dialog.type === 'delete' ? handleDelete : handleUpdate}
                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out"
              >
                Confirm
              </button>
              <button
                onClick={closeDialog}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-700 transition duration-300 ease-in-out"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditNotificationsPage;
