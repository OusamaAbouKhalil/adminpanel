import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../contexts/AuthProvider'; // Assuming you have a useAuth hook for authentication

const CalculatorPage = () => {
  const [prices, setPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [passengers, setPassengers] = useState(1); // State for number of passengers
  const [result, setResult] = useState(null);
  const { user } = useAuth(); // Assuming user is obtained from AuthProvider

  const db = getDatabase(); // Get a reference to the Firebase Realtime Database

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const pricesRef = ref(db, 'Prices'); // Reference to the 'prices' node
        onValue(pricesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setPrices(data);
          } else {

            setPrices({});
          }
          setIsLoading(false);
        });
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchPrices();
  }, [db]);

  const estimateArrivalTime = (distance) => {
    return (distance * 0.3); // Example 0.3 is the average speed of the vehicle
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'distance') {
      const newDistance = parseFloat(value) || 0;
      setDistance(newDistance);
      setTime(estimateArrivalTime(newDistance));
    } else if (name === 'time') {
      setTime(parseFloat(value) || 0);
    } else if (name === 'passengers') {
      setPassengers(parseInt(value, 10) || 1);
    }
  };

  const calculateCost = () => {
    const {
      Base_Fare = 0,
      Cost_Per_Km = 0,
      Cost_Per_Min = 0,
      Cost_Per_Km_SB = 0,
      Booking_Fee = 0,
      // Ensure to include all keys as they appear in Firebase
    } = prices;






    // Swift Drive Calculation
    let swiftDriveCost = Base_Fare + (Cost_Per_Min * time) + (Cost_Per_Km * distance) + Booking_Fee;

    // Adjust cost based on number of passengers
    switch (passengers) {
      case 2:
        swiftDriveCost *= 1.8;
        break;
      case 3:
        swiftDriveCost *= 2.65;
        break;
      case 4:
        swiftDriveCost *= 3.2;
        break;
      default:
        // No adjustment for 1 passenger
        break;
    }

    // Swift Bites Calculation
    let swiftBitesCost;
    if (distance < 2.6) {
      swiftBitesCost = Cost_Per_Km_SB * 2 + (Cost_Per_Km_SB * 2);
    } else if (distance >= 2.6 && distance <= 4) {
      swiftBitesCost = Cost_Per_Km_SB + (Cost_Per_Km_SB * distance);
    } else {
      swiftBitesCost = Cost_Per_Km_SB * distance;
    }

    setResult({ swiftDriveCost, swiftBitesCost });
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div></div>;
  if (error) return <div className="text-center text-red-600 text-lg">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-green-50 to-white shadow-md rounded-lg border border-gray-200 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">Calculate Costs</h1>
      <div className="mb-6">
        <label className="block text-gray-800 font-medium text-lg mb-2" htmlFor="distance">
          Distance (km):
        </label>
        <input
          type="number"
          step="0.01"
          id="distance"
          name="distance"
          value={distance}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2 w-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-800 font-medium text-lg mb-2" htmlFor="time">
          Time (minutes): *Note we consider minutes as extra charge for the ride*
        </label>
        <input
          type="number"
          step="0.01"
          id="time"
          name="time"
          value={time}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2 w-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-800 font-medium text-lg mb-2" htmlFor="passengers">
          Number of Passengers:
        </label>
        <select
          id="passengers"
          name="passengers"
          value={passengers}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2 w-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>
      <button
        onClick={calculateCost}
        className="w-full bg-green-600 text-white py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out"
      >
        Calculate
      </button>
      {result && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Cost Results</h2>
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <p className="text-gray-700">Swift Drive Cost: ${result.swiftDriveCost.toFixed(2)}</p>
            <p className="text-gray-700">Swift Bites Cost: ${result.swiftBitesCost.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorPage;
