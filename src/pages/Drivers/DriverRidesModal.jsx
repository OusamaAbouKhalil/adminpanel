import React, { useState, useEffect } from 'react';
import { getDriverRides, updateRidePaymentStatus } from '../../lib/firebase/api';

const DriverRidesModal = ({ driver, onClose }) => {
    const [rides, setRides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalOutstanding, setTotalOutstanding] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchRides = async () => {
            console.log('🔄 DriverRidesModal: Fetching rides for driver:', driver.id, driver.fullname);
            try {
                const driverRides = await getDriverRides(driver.id);
                console.log('📋 DriverRidesModal: Rides fetched successfully:', driverRides);
                setRides(driverRides);

                // Calculate total outstanding amount
                const outstanding = driverRides
                    .filter(ride => {
                        console.log(`🧮 Ride ${ride.id} - Status: ${ride.status}, MoneyTurnedIn: ${ride.moneyTurnedIn}`);
                        return !ride.moneyTurnedIn && ride.status === "accepted";
                    })
                    .reduce((sum, ride) => {
                        const cost = parseFloat(ride.cost || 0);
                        console.log(`💵 Adding to total: $${cost} from ride ${ride.id}`);
                        return sum + cost;
                    }, 0);

                console.log(`💰 DriverRidesModal: Total outstanding calculated: $${outstanding}`);
                setTotalOutstanding(outstanding);
                setIsLoading(false);
            } catch (error) {
                console.error("❌ DriverRidesModal: Error fetching driver rides:", error);
                setErrorMessage(`Error loading rides: ${error.message}`);
                setIsLoading(false);
            }
        };

        fetchRides();
    }, [driver.id]);

    const handleTogglePaymentStatus = async (ride) => {
        console.log(`🔄 Toggling payment status for ride ${ride.id} from ${ride.moneyTurnedIn} to ${!ride.moneyTurnedIn}`);
        try {
            await updateRidePaymentStatus(ride.id, driver.id, !ride.moneyTurnedIn);

            // Update local state
            const updatedRides = rides.map(r =>
                r.id === ride.id ? { ...r, moneyTurnedIn: !ride.moneyTurnedIn } : r
            );

            console.log('✅ Ride payment status updated successfully');
            setRides(updatedRides);

            // Recalculate outstanding amount
            const outstanding = updatedRides
                .filter(r => !r.moneyTurnedIn && r.status === "accepted")
                .reduce((sum, r) => sum + parseFloat(r.cost || 0), 0);

            console.log(`💰 New outstanding total: $${outstanding}`);
            setTotalOutstanding(outstanding);
        } catch (error) {
            console.error("❌ Error updating payment status:", error);
            alert(`Failed to update payment status: ${error.message}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Rides for {driver.fullname}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-lg font-medium text-gray-800">
                        Total Outstanding: <span className="text-red-600 font-bold">${totalOutstanding.toFixed(2)}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Driver ID: {driver.id}
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{errorMessage}</p>
                        <p className="text-sm text-gray-700 mt-2">
                            This could be due to permission issues. Please check if your account has access to ride data.
                        </p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : rides.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-2">No rides found for this driver</p>
                        <p className="text-sm text-gray-400">Driver ID: {driver.id}</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ride ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rides.map(ride => (
                                <tr key={ride.id} className={ride.status === "accepted" ? "" : "bg-gray-100"}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {new Date(ride.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {ride.id.substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-[150px] truncate">
                                        {ride.pickup_address || "No pickup address"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-[150px] truncate">
                                        {ride.destination_address || "No destination address"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        ${parseFloat(ride.cost || 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${ride.status === "accepted" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                            }`}>
                                            {ride.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {ride.status === "accepted" && (
                                            <button
                                                onClick={() => handleTogglePaymentStatus(ride)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg ${ride.moneyTurnedIn
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                    : "bg-red-100 text-red-800 hover:bg-red-200"
                                                    }`}
                                            >
                                                {ride.moneyTurnedIn ? "Turned In ✓" : "Mark as Turned In"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DriverRidesModal;