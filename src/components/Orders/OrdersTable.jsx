import React, { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import { fsdb } from "../../utils/firebaseconfig";
import OrderDetailsPopup from "./OrderDetailsPopup";

const OrdersTable = ({ orders, onStatusChange }) => {
  const statuses = ["accepted", "preparing", "on the way", "completed", "rejected", "cancelled"];
  const [activeTab, setActiveTab] = useState(statuses[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const restaurantsCollection = collection(fsdb, 'restaurants');
        const restaurantsSnapshot = await getDocs(restaurantsCollection);
        const restaurantData = {};
        restaurantsSnapshot.forEach(doc => {
          restaurantData[doc.id] = doc.data();
        });
        setRestaurants(restaurantData);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };
    fetchRestaurants();
  }, []);

  const getStatusCount = (status) => orders.filter((order) => order.status === status).length;

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    const formattedDate = date.toLocaleDateString("en-US");
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate}, ${formattedTime}`;
  };

  const sortedOrders = orders
    .filter((order) => order.status === activeTab && order.order_id.includes(searchTerm))
    .sort((a, b) => b.time.seconds - a.time.seconds);

  // Function to get the status color
  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-300 text-green-800";
      case "preparing":
        return "bg-yellow-200 text-yellow-800";
      case "on the way":
        return "bg-blue-200 text-blue-800";
      case "completed":
        return "bg-green-400 text-gray-800";
      case "rejected":
        return "bg-red-300 text-red-800";
      case "cancelled":
        return "bg-red-300 text-red-800";
      default:
        return "bg-white text-black";
    }
  };

  return (
    <div className="my-10 p-6 bg-gray-50 rounded-lg shadow-lg">
      {selectedOrder && (
        <OrderDetailsPopup
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      <div className="flex justify-center mb-6 space-x-4">
        {statuses.map((status) => (
          <button
            key={status}
            className={`relative px-6 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ease-in-out ${activeTab === status ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setActiveTab(status)}
          >
            {status.toUpperCase()}
            {getStatusCount(status) > 0 && (
              <span
                className="absolute top-0 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                style={{ transform: "translate(50%, -50%)" }}
              >
                {getStatusCount(status)}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search by Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg shadow-md w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 bg-gray-100 py-3 px-4 border-b">
          {activeTab.toUpperCase()}
        </h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-100 text-blue-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Logo</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Restaurant</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Order ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Recipient</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Total</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedOrders.map((order) => {
              const restaurant = restaurants[order.restaurant_id] || {};
              return (
                <tr key={order.order_id} className="hover:bg-gray-100">
                  <td className="px-6 py-4 text-sm">
                    <img src={restaurant.main_image} alt="Restaurant" className="w-20 h-20 object-cover rounded-lg" />
                  </td>
                  <td className="px-6 py-4 text-sm">{restaurant.rest_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-500 underline"
                    >
                      {order.order_id}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">{order.recipient_name}</td>
                  <td className="px-6 py-4 text-sm">{formatDateTime(order.time)}</td>
                  <td className="px-6 py-4 text-sm">${order.total + order.delivery_fee}</td>
                  <td className={`px-6 py-4 text-sm capitalize ${getStatusColor(order.status)}`}>
                    <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => onStatusChange(order, e.target.value)}
                        className="bg-gray-100 border border-gray-300 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out py-2 px-4 w-full"
                      >
                        {statuses.map((status) => (
                          <option
                            key={status}
                            value={status}
                            disabled={status === order.status}
                            className="text-gray-800"
                          >
                            {status.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
