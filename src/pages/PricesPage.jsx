import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useGetPrices, useUpdatePrices } from '../lib/query/queries';

const PricesPage = () => {
  const { data: prices, isLoading, error } = useGetPrices();
  const { mutate: updatePrices, isLoading: isUpdating } = useUpdatePrices();
  // Update form data when prices are loaded
  const [formData, setFormData] = useState(prices || {});
  useEffect(() => {
    if (prices) {
      setFormData(prices);
    }
  }, [prices]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    updatePrices(formData, {
      onSuccess: () => {
        toast.success('Prices updated successfully!');
      },
      onError: (error) => {
        toast.error(`Error updating prices: ${error.message}`);
      }
    });
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">
    <div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div>
  </div>;

  if (error) return <div className="text-center text-red-600 text-lg">Error: {error.message}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-green-50 to-white shadow-md rounded-lg border border-gray-200 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">Edit Prices</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Swift Drive Pricing</h2>
          <div className="text-gray-600 text-sm">
            <strong className="font-medium">Formula:</strong> Cost = Base Fare + (Cost per min * Time in ride) + (Cost per km * Distance) + Booking Fee
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Swift Bites Pricing</h2>
          <div className="text-gray-600 text-sm">
            <strong className="font-medium">Formula:</strong> Cost = Base Fare + (Cost per km * Distance) + Booking Fee
          </div>
          <div className="text-gray-600 text-sm">
            <strong className="font-medium">Distance Rules:</strong>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Distance less than 2.6 km: Cost Per Km * 2 will be added</li>
              <li>Distance between 2.6 km and 4 km: Cost Per Km is added to the total cost</li>
              <li>Distance greater than 4 km: Cost Per Km * Distance</li>
            </ul>
          </div>
        </div>

        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between border-b border-gray-300 py-3">
            <label className="block text-gray-800 font-medium text-base w-1/3" htmlFor={key}>
              {key.replace(/_/g, ' ')}:
            </label>
            <input
              type="number"
              step="0.01"
              name={key}
              id={key}
              value={value}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-2 w-2/3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={isUpdating}
          className={`w-full ${isUpdating ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} 
            text-white py-2 rounded-lg shadow-md transition duration-300 ease-in-out`}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default PricesPage;