import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';

const OffersPage = () => {
  const [offers, setOffers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // To handle spinner for saving changes
  const [newOfferKey, setNewOfferKey] = useState('');
  const [newOfferValue, setNewOfferValue] = useState('');

  useEffect(() => {
    const db = getDatabase();
    const offersRef = ref(db, 'Offers');

    const unsubscribe = onValue(offersRef, (snapshot) => {
      const data = snapshot.val();
      setOffers(data || {});
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddOffer = async () => {
    if (!newOfferKey || newOfferValue < 0 || newOfferValue > 100) {
      alert('Please provide a valid key and ensure the value is between 0 and 100.');
      return;
    }

    setSaving(true); // Start the spinner
    try {
      const db = getDatabase();
      const offersRef = ref(db, `Offers/${newOfferKey}`);
      await update(offersRef, parseInt(newOfferValue));
      setNewOfferKey('');
      setNewOfferValue('');
    } catch (err) {
      console.error('Error adding offer:', err);
    }
    setSaving(false); // Stop the spinner
  };

  const handleUpdateOffer = async (key, value) => {
    if (value < 0 || value > 100) {
      alert('Please ensure the value is between 0 and 100.');
      return;
    }

    setSaving(true); // Start the spinner
    try {
      const db = getDatabase();
      const offerRef = ref(db, `Offers/${key}`);
      await update(offerRef, parseInt(value));
    } catch (err) {
      console.error('Error updating offer:', err);
    }
    setSaving(false); // Stop the spinner
  };

  const handleDeleteOffer = async (key) => {
    if (window.confirm(`Are you sure you want to delete the offer "${key}"?`)) {
      try {
        const db = getDatabase();
        const offerRef = ref(db, `Offers/${key}`);
        await remove(offerRef);
      } catch (err) {
        console.error('Error deleting offer:', err);
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
    <div className="container mx-auto p-6 sm:p-8 lg:p-10 bg-white shadow-xl rounded-lg border border-gray-200 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">Manage Offers</h1>

      {/* Form to Add a New Offer */}
      <div className="mb-10">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Add New Offer</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Offer Key (e.g., 100offer)"
            value={newOfferKey}
            onChange={(e) => setNewOfferKey(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          />
          <input
            type="number"
            placeholder="Offer Value (0-100)"
            value={newOfferValue}
            onChange={(e) => setNewOfferValue(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            min="0"
            max="100"
          />
          <button
            onClick={handleAddOffer}
            className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
            disabled={saving} // Disable button while saving
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Add Offer'
            )}
          </button>
        </div>
      </div>

      {/* List of Current Offers with Edit/Delete Options */}
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Current Offers</h2>
      <ul className="space-y-6">
        {Object.entries(offers).map(([key, value]) => (
          <li key={key} className="bg-gray-100 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={key}
                readOnly
                className="mr-4 text-lg font-medium text-gray-700 bg-gray-200 p-3 rounded-lg w-1/3"
              />
              <input
                type="number"
                value={value}
                onChange={(e) => handleUpdateOffer(key, e.target.value)}
                className="mr-4 w-20 text-lg font-medium text-gray-900 p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
              <button
                onClick={() => handleDeleteOffer(key)}
                className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OffersPage;
