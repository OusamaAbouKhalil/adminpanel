import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, update, push, remove } from 'firebase/database';

const PromoCodesPage = () => {
  const [promoCodes, setPromoCodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newCredits, setNewCredits] = useState('');
  const [newUsesLeft, setNewUsesLeft] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'

  useEffect(() => {
    const db = getDatabase();
    const promoCodesRef = ref(db, 'PromoCodes');

    const unsubscribe = onValue(promoCodesRef, (snapshot) => {
      const data = snapshot.val();
      setPromoCodes(data || {});
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddPromoCode = async () => {
    if (!newPromoCode || newCredits < 0 || newUsesLeft < 0) {
      setMessage('Please provide a valid promo code and ensure credits and uses left are non-negative.');
      setMessageType('error');
      return;
    }

    setSaving(true);
    try {
      const db = getDatabase();
      const newPromoCodeRef = push(ref(db, 'PromoCodes'));
      await update(newPromoCodeRef, {
        promoCode: newPromoCode,
        credits: parseInt(newCredits),
        usesleft: parseInt(newUsesLeft),
      });
      setMessage('Promo code added successfully!');
      setMessageType('success');
      setNewPromoCode('');
      setNewCredits('');
      setNewUsesLeft('');
    } catch (err) {
      setMessage('Error adding promo code.');
      setMessageType('error');
      console.error('Error adding promo code:', err);
    }
    setSaving(false);
  };

  const handleUpdatePromoCode = async (id, field, value) => {
    if (field !== 'promoCode' && value < 0) {
      setMessage('Credits and uses left must be non-negative.');
      setMessageType('error');
      return;
    }

    setSaving(true);
    try {
      const db = getDatabase();
      const promoCodeRef = ref(db, `PromoCodes/${id}`);
      const updatedValue = field === 'promoCode' ? value : parseInt(value);
      await update(promoCodeRef, { [field]: updatedValue });
      setMessage('Promo code updated successfully!');
      setMessageType('success');
    } catch (err) {
      setMessage('Error updating promo code.');
      setMessageType('error');
      console.error('Error updating promo code:', err);
    }
    setSaving(false);
  };

  const handleDeletePromoCode = async (id) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      try {
        const db = getDatabase();
        const promoCodeRef = ref(db, `PromoCodes/${id}`);
        await remove(promoCodeRef);
        setMessage('Promo code deleted successfully!');
        setMessageType('success');
      } catch (err) {
        setMessage('Error deleting promo code.');
        setMessageType('error');
        console.error('Error deleting promo code:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-t-4 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">Promo Codes Management</h1>

        {/* Tabs */}
        <div className="flex mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-6 rounded-t-lg text-lg font-semibold transition-transform transform ${activeTab === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Add Promo Code
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 px-6 rounded-t-lg text-lg font-semibold transition-transform transform ${activeTab === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Edit Promo Code
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Form to Add a New Promo Code */}
        {activeTab === 'add' && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Add New Promo Code</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Promo Code (e.g., FIRST10)"
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-4 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Credits"
                value={newCredits}
                onChange={(e) => setNewCredits(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-4 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <input
                type="number"
                placeholder="Uses Left"
                value={newUsesLeft}
                onChange={(e) => setNewUsesLeft(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-4 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <button
                onClick={handleAddPromoCode}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition duration-300 ease-in-out"
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Add Promo Code'
                )}
              </button>
            </div>
          </div>
        )}

        {/* List of Current Promo Codes with Edit/Delete Options */}
        {activeTab === 'edit' && (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Current Promo Codes</h2>
            <ul className="space-y-6">
              {Object.entries(promoCodes).map(([id, data]) => (
                <li key={id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
                  <div className="flex flex-col space-y-4">
                    <input
                      type="text"
                      value={data.promoCode}
                      onChange={(e) => setPromoCodes((prev) => ({
                        ...prev,
                        [id]: { ...prev[id], promoCode: e.target.value }
                      }))}
                      className="text-lg font-medium text-gray-900 p-3 rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={data.credits}
                      onChange={(e) => setPromoCodes((prev) => ({
                        ...prev,
                        [id]: { ...prev[id], credits: e.target.value }
                      }))}
                      className="w-full text-lg font-medium text-gray-900 p-3 rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <input
                      type="number"
                      value={data.usesleft}
                      onChange={(e) => setPromoCodes((prev) => ({
                        ...prev,
                        [id]: { ...prev[id], usesleft: e.target.value }
                      }))}
                      className="w-full text-lg font-medium text-gray-900 p-3 rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleUpdatePromoCode(id, 'promoCode', data.promoCode)}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => handleDeletePromoCode(id)}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-red-700 transition duration-300 ease-in-out"
                        disabled={saving}
                      >
                        {saving ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default PromoCodesPage;
