import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { useAuth } from '../contexts/AuthProvider'; // Assuming you have a useAuth hook for authentication

const PaymentMethod = () => {
  const [prices, setPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Assuming user is obtained from AuthProvider

  const db = getDatabase(); // Get a reference to the Firebase Realtime Database

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const pricesRef = ref(db, 'PaymentMethods'); // Reference to the 'PaymentMethods' node
        onValue(pricesRef, (snapshot) => {
          setPrices(snapshot.val() || {});
          setIsLoading(false);
        });
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchPrices();
  }, [db]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrices((prevPrices) => ({
      ...prevPrices,
      [name]: value, // No need to parseFloat for strings
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const pricesRef = ref(db, 'PaymentMethods');
      await update(pricesRef, prices);
      alert('Prices updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  if (error) {
    return <div className="text-center text-red-600 text-lg">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-green-50 to-white shadow-md rounded-lg border border-gray-200 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">Edit Payment Methods</h1>
      <form onSubmit={handleSubmit}>
        {Object.keys(prices).map((key) => (
          <div key={key} className="flex items-center justify-between border-b border-gray-300 py-3">
            <label
              className="block text-gray-800 font-medium text-base w-1/3"
              htmlFor={key}
            >
              {key.replace(/_/g, ' ')}:
            </label>
            <input
              type="text"
              name={key}
              id={key}
              value={prices[key]}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-2 w-2/3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default PaymentMethod;
