import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { useAuth } from '../contexts/AuthProvider'; // Assuming you have a useAuth hook for authentication

const PricesPage = () => {
  const [prices, setPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Assuming user is obtained from AuthProvider

  const db = getDatabase(); // Get a reference to the Firebase Realtime Database

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const pricesRef = ref(db, 'prices'); // Reference to the 'prices' node
        onValue(pricesRef, (snapshot) => {
          setPrices(snapshot.val());
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
    setPrices((prevPrices) => ({ ...prevPrices, [name]: parseFloat(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const pricesRef = ref(db, 'Prices');
      await update(pricesRef, prices);
      alert('Prices updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Edit Prices</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.keys(prices).map((key) => (
          <div key={key} className="flex items-center justify-between border-b border-gray-300 pb-4">
            <label
              className="block text-gray-700 font-medium w-1/4"
              htmlFor={key}
            >
              {key.replace(/_/g, ' ')}:
            </label>
            <input
              type="number"
              step="0.01"
              name={key}
              id={key}
              value={prices[key]}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-2 w-3/4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default PricesPage;
