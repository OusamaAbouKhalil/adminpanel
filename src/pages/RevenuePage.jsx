import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { FaEdit, FaTimes } from 'react-icons/fa'; // Import icons from react-icons

const RevenuePage = () => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('deliveryCharge');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [revenueList, setRevenueList] = useState([]);
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('deliveryCharge');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'
  const [saving, setSaving] = useState(false);
  const [selectedRevenueId, setSelectedRevenueId] = useState(null);

  useEffect(() => {
    const fetchRevenues = async () => {
      const db = getFirestore();
      const revenueCollection = collection(db, 'revenue');
      const revenueQuery = query(revenueCollection, orderBy('date', 'desc')); // Order by date descending
      const revenueSnapshot = await getDocs(revenueQuery);
      const revenueData = revenueSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRevenueList(revenueData);
    };

    fetchRevenues();
  }, []);

  const handleAddRevenue = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('success');

    if (!amount || !date || !description) {
      setMessage('Amount, Date, and Description are required.');
      setMessageType('error');
      return;
    }

    setSaving(true);

    try {
      const db = getFirestore();
      await addDoc(collection(db, 'revenue'), {
        amount: parseFloat(amount),
        type,
        date: new Date(date).toISOString(), // Store as ISO string
        description,
      });

      setMessage('Revenue added successfully!');
      setAmount('');
      setDate('');
      setDescription('');
      setType('deliveryCharge');
    } catch (err) {
      console.error('Error adding revenue:', err);
      setMessage('Failed to add revenue.');
      setMessageType('error');
    }

    setSaving(false);
  };

  const handleEditChange = (revenue) => {
    setEditAmount(revenue.amount);
    setEditType(revenue.type);
    setEditDate(new Date(revenue.date).toISOString().slice(0, 16)); // Format for <input type="datetime-local">
    setEditDescription(revenue.description);
    setSelectedRevenueId(revenue.id);
  };

  const handleUpdateRevenue = async (e) => {
    e.preventDefault();
    if (!editAmount || !editDate || !editDescription || !selectedRevenueId) {
      setMessage('Amount, Date, Description, and Revenue ID are required.');
      setMessageType('error');
      return;
    }

    setSaving(true);

    try {
      const db = getFirestore();
      const revenueRef = doc(db, 'revenue', selectedRevenueId);
      await updateDoc(revenueRef, {
        amount: parseFloat(editAmount),
        type: editType,
        date: new Date(editDate).toISOString(), // Store as ISO string
        description: editDescription,
      });

      setMessage('Revenue updated successfully!');
      setEditAmount('');
      setEditDate('');
      setEditDescription('');
      setEditType('deliveryCharge');
      setSelectedRevenueId(null);
    } catch (err) {
      setMessage('Failed to update revenue.');
      setMessageType('error');
      console.error('Error updating revenue:', err);
    }

    setSaving(false);
  };

  const handleGenerateReport = () => {
    // Placeholder for generating reports
    alert('Report generation feature is not yet implemented.');
  };

  return (
    <div className="container mx-auto p-8 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300 max-w-4xl mx-auto rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Revenue Management</h1>

        {/* Tabs */}
        <div className="flex mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-6 rounded-t-lg text-lg font-semibold transition-transform transform ${activeTab === 'add' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Add Revenue
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 px-6 rounded-t-lg text-lg font-semibold transition-transform transform ${activeTab === 'edit' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Edit Revenue
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Add Revenue Form */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddRevenue} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-lg font-semibold mb-2">Date & Time</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-300 p-3 rounded-lg w-full"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-lg font-semibold mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-gray-300 p-3 rounded-lg w-full"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-lg font-semibold mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border border-gray-300 p-3 rounded-lg w-full"
              >
                <option value="deliveryCharge">Delivery Charge</option>
                <option value="profit">Profit</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-lg font-semibold mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-gray-300 p-3 rounded-lg w-full"
                rows="4"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-6 rounded-lg shadow-lg hover:from-green-700 hover:to-green-600 transition duration-300"
              disabled={saving}
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add Revenue'
              )}
            </button>
          </form>
        )}

        {/* Edit Revenue Section */}
        {activeTab === 'edit' && (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Current Revenues</h2>
            
            {/* Table for Revenue List */}
            <table className="w-full mt-6 border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-green-500 text-white">
                  <th className="px-4 py-2 border-b border-gray-200">Date</th>
                  <th className="px-4 py-2 border-b border-gray-200">Amount</th>
                  <th className="px-4 py-2 border-b border-gray-200">Type</th>
                  <th className="px-4 py-2 border-b border-gray-200">Description</th>
                  <th className="px-4 py-2 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {revenueList.map(revenue => (
                  <tr key={revenue.id} className="bg-white border-b border-gray-200">
                      <td className="px-4 py-2 text-center">{new Date(revenue.date).toLocaleString()}</td>
                    <td className="px-4 py-2 text-center">${revenue.amount.toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">{revenue.type}</td>
                    <td className="px-4 py-2 text-center">{revenue.description}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleEditChange(revenue)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        <FaEdit />
                      </button>
                      {selectedRevenueId === revenue.id && (
                        <button
                          onClick={() => setSelectedRevenueId(null)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedRevenueId && (
              <form onSubmit={handleUpdateRevenue} className="space-y-6 mt-6">
                <div>
                  <label className="block text-gray-700 text-lg font-semibold mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="border border-gray-300 p-3 rounded-lg w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-lg font-semibold mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="border border-gray-300 p-3 rounded-lg w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-lg font-semibold mb-2">Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="border border-gray-300 p-3 rounded-lg w-full"
                  >
                    <option value="deliveryCharge">Delivery Charge</option>
                    <option value="profit">Profit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-lg font-semibold mb-2">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="border border-gray-300 p-3 rounded-lg w-full"
                    rows="4"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-6 rounded-lg shadow-lg hover:from-green-700 hover:to-green-600 transition duration-300"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Revenue'
                  )}
                </button>
              </form>
            )}
          </>
        )}

        <button
          onClick={handleGenerateReport}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg shadow-lg mt-6 hover:bg-blue-700 transition duration-300"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default RevenuePage;
