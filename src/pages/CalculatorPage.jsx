import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../contexts/AuthProvider'; // Assuming you have a useAuth hook for authentication

const CalculatorPage = () => {
  const [prices, setPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(0);
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
            console.log('No data found at Prices node');
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

  const handleChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setDistance(value);
  };

  const calculateCost = () => {
    const {
      base_fare = 0,
      cost_per_km = 0,
      cost_per_km_swift_bites = 0,
      swift_bites_booking_fee = 0,
      distance_rule_1 = 0,
      distance_rule_2 = 0
    } = prices;

    console.log('Prices:', prices);
    console.log('Distance:', distance);

    // Swift Drive Calculation
    const swiftDriveCost = base_fare + (cost_per_km * distance) + distance_rule_1;
    console.log('Swift Drive Cost Calculation:', {
      base_fare,
      cost_per_km,
      distance,
      distance_rule_1,
      result: swiftDriveCost
    });

    // Swift Bites Calculation
    let swiftBitesCost;
    if (distance < 2.6) {
      swiftBitesCost = base_fare + (cost_per_km_swift_bites * 2) + swift_bites_booking_fee;
    } else if (distance >= 2.6 && distance <= 4) {
      swiftBitesCost = base_fare + (cost_per_km_swift_bites * distance) + swift_bites_booking_fee;
    } else {
      swiftBitesCost = base_fare + (cost_per_km_swift_bites * distance) + swift_bites_booking_fee;
    }
    console.log('Swift Bites Cost Calculation:', {
      base_fare,
      cost_per_km_swift_bites,
      distance,
      swift_bites_booking_fee,
      result: swiftBitesCost
    });

    setResult({ swiftDriveCost, swiftBitesCost });
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div></div>;
  if (error) return <div className="text-center text-red-600 text-lg">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-green-50 to-white shadow-md rounded-lg border border-gray-200 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">Distance-Based Price Calculator</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          calculateCost();
        }}
        className="space-y-6"
      >
        <div className="flex flex-col space-y-4">
          <input
            type="number"
            name="distance"
            value={distance}
            onChange={handleChange}
            placeholder="Distance (km)"
            className="border border-gray-300 rounded-lg p-2 w-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out"
        >
          Calculate
        </button>
        {result && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-800">Results</h2>
            <p className="text-gray-700">Swift Drive Cost: ${result.swiftDriveCost.toFixed(2)}</p>
            <p className="text-gray-700">Swift Bites Cost: ${result.swiftBitesCost.toFixed(2)}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default CalculatorPage;
