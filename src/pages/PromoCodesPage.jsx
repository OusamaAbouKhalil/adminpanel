import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, update, push, remove } from 'firebase/database';

const PromoCodesPage = () => {
  const [promoCodes, setPromoCodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newCredits, setNewCredits] = useState('');
  const [newUsesLeft, setNewUsesLeft] = useState('');

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
      alert('Please provide a valid promo code and ensure credits and uses left are non-negative.');
      return;
    }

    setSaving(true);
    try {
      const db = getDatabase();
      const newPromoCodeRef = push(ref(db, 'PromoCodes'));
      await update(newPromoCodeRef, {
        promoCode: newPromoCode,
        credits: parseInt(newCredits),
        usesLeft: parseInt(newUsesLeft),
      });
      setNewPromoCode('');
      setNewCredits('');
      setNewUsesLeft('');
    } catch (err) {
      console.error('Error adding promo code:', err);
    }
    setSaving(false);
  };

  const handleUpdatePromoCode = async (id, field, value) => {
    if (field !== 'promoCode' && value < 0) {
      alert('Credits and uses left must be non-negative.');
      return;
    }

    setSaving(true);
    try {
      const db = getDatabase();
      const promoCodeRef = ref(db, `PromoCodes/${id}`);
      await update(promoCodeRef, {
        [field]: field === 'promoCode' ? value : parseInt(value),
      });
    } catch (err) {
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
      } catch (err) {
        console.error('Error deleting promo code:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 sm:p-10 lg:p-12 bg-gradient-to-r from-blue-50 via-white to-blue-50 shadow-2xl rounded-lg border border-gray-200 max-w-4xl">
      <h1 className="text-5xl font-extrabold mb-10 text-gray-900 text-center">Promo Codes Management</h1>

      {/* Form to Add a New Promo Code */}
      <div className="mb-12">
        <h2 className="text-4xl font-semibold mb-6 text-gray-800">Add New Promo Code</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Promo Code (e.g., First10)"
            value={newPromoCode}
            onChange={(e) => setNewPromoCode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-150 ease-in-out"
          />
          <input
            type="number"
            placeholder="Credits"
            value={newCredits}
            onChange={(e) => setNewCredits(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-150 ease-in-out"
            min="0"
          />
          <input
            type="number"
            placeholder="Uses Left"
            value={newUsesLeft}
            onChange={(e) => setNewUsesLeft(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-150 ease-in-out"
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

      {/* List of Current Promo Codes with Edit/Delete Options */}
      <h2 className="text-4xl font-semibold mb-6 text-gray-800">Current Promo Codes</h2>
      <ul className="space-y-6">
        {Object.entries(promoCodes).map(([id, data]) => (
          <li key={id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                value={data.promoCode}
                onChange={(e) => handleUpdatePromoCode(id, 'promoCode', e.target.value)}
                className="text-lg font-medium text-gray-900 p-3 rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="number"
                value={data.credits}
                onChange={(e) => handleUpdatePromoCode(id, 'credits', e.target.value)}
                className="w-full text-lg font-medium text-gray-900 p-3 rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                min="0"
              />
              <input
                type="number"
                value={data.usesLeft}
                onChange={(e) => handleUpdatePromoCode(id, 'usesLeft', e.target.value)}
                className="w-full text-lg font-medium text-gray-900 p-3 rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                min="0"
              />
              <div className="flex space-x-4">
                <button
                  onClick={() => handleUpdatePromoCode(id, 'promoCode', data.promoCode)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out"
                >
                  Save
                </button>
                <button
                  onClick={() => handleDeletePromoCode(id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PromoCodesPage;
