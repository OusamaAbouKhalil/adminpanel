import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';

const OffersPage = () => {
  const [offers, setOffers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleUpdateOffer = async (key, value) => {
    if (value < 0 || value > 100) {
      alert('Please ensure the value is between 0 and 100.');
      return;
    }

    setSaving(true);
    try {
      const db = getDatabase();
      const offerRef = ref(db, `Offers/${key}`);
      await update(offerRef, parseInt(value));

      setSuccessMessage(`Offer "${key}" updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
    } catch (err) {
      console.error('Error updating offer:', err);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 sm:p-8 lg:p-10 bg-white shadow-xl rounded-lg border border-gray-200 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">Manage Offers</h1>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {successMessage}</span>
        </div>
      )}

      {/* List of Current Offers with Edit Option */}
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Current Offers</h2>
      <ul className="space-y-6">
        {Object.entries(offers).map(([key, value]) => {
          const packageDescription = key === '10Offer' ? 'Basic Package' : key === '100Offer' ? 'Premium Package' : 'Custom Package';

          return (
            <li key={key} className="bg-gradient-to-r from-blue-500 to-green-500 p-6 rounded-lg shadow-md text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{packageDescription}</p>
                  <p className="text-lg font-medium">{key}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleUpdateOffer(key, e.target.value)}
                    className="w-24 text-lg font-medium p-3 rounded-lg border border-gray-300 text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    disabled={saving}
                  />
                  {saving && (
                    <div className="flex items-center text-white">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OffersPage;
