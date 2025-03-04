import React, { useState, useMemo } from "react";
import { MdOutlineErrorOutline } from "react-icons/md";
import OrderDetailsPopup from "./OrderDetailsPopup";
import { useGetRestaurantsForOrders } from "../../lib/query/queries";

const OrdersTable = ({ orders, onStatusChange }) => {
  const statuses = ["accepted", "preparing", "on the way", "completed", "rejected", "cancelled"];
  const [activeTab, setActiveTab] = useState(statuses[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Get unique restaurant IDs from orders
  const restaurantIds = useMemo(() =>
    [...new Set(orders.map(order => order.restaurant_id))],
    [orders]
  );

  // Fetch restaurants data
  const { data: restaurants = {} } = useGetRestaurantsForOrders(restaurantIds);

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
        return "bg-green-200 text-green-800";
      case "completed":
        return "bg-green-400 text-gray-800";
      case "rejected":
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

      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-4 flex-wrap">
        {statuses.map((status) => (
          <button
            key={status}
            className={`relative px-6 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ease-in-out ${activeTab === status ? "bg-green-600 text-white shadow-md" : "bg-gray-200 text-gray-700"} mb-2`}
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

      {/* Search Input */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search by Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Search by Order ID"
        />
      </div>

      {/* No Data Available */}
      {sortedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <MdOutlineErrorOutline className="text-6xl text-gray-400 mb-4" />
          <p className="text-gray-600 text-xl font-semibold">No orders available.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          {/* Table for medium and larger screens */}
          <table className="hidden md:table min-w-full divide-y divide-gray-200">
            <thead className="bg-green-600 text-white font-bold">
              <tr>
                <th className="px-6 py-3 text-center text-l font-bold">Logo</th>
                <th className="px-6 py-3 text-center text-l font-bold">Restaurant Name</th>
                <th className="px-6 py-3 text-center text-l font-bold">Order ID</th>
                <th className="px-6 py-3 text-center text-l font-bold">Recipient</th>
                <th className="px-6 py-3 text-center text-l font-bold">Date</th>
                <th className="px-6 py-3 text-center text-l font-bold">Total</th>
                <th className="px-6 py-3 text-center text-l font-bold">Status</th>
                <th className="px-6 py-3 text-center text-l font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOrders.map((order) => {
                const restaurant = restaurants[order.restaurant_id] || {};
                return (
                  <tr key={order.order_id} className="hover:bg-gray-100">
                    <td className="px-6 py-4 text-sm">
                      <img
                        src={restaurant.main_image}
                        alt={`${restaurant.rest_name} Logo`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">{restaurant.rest_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          const restaurant = restaurants[order.restaurant_id] || {};
                          setSelectedOrder({
                            ...order,
                            restaurant_details: restaurant
                          });
                        }}
                        className="text-blue-500 underline font-bold"
                      >
                        {order.order_id}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">{order.recipient_name}</td>
                    <td className="px-6 py-4 text-sm">{formatDateTime(order.time)}</td>
                    <td className="px-6 py-4 text-sm">${(order.total + order.delivery_fee).toFixed(2)}</td>
                    <td className={`px-6 py-4 text-sm capitalize`}>
                      <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => onStatusChange(order, e.target.value)}
                        className="w-full bg-gray-100 border border-gray-300 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out py-2 px-4"
                        aria-label={`Change status for order ${order.order_id}`}
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Card Layout for small screens */}
          <div className="md:hidden">
            {sortedOrders.map((order) => {
              const restaurant = restaurants[order.restaurant_id] || {};
              return (
                <div key={order.order_id} className="border border-gray-200 rounded-lg shadow-md mb-4 p-4 bg-white">
                  <div className="flex items-center mb-4">
                    <img
                      src={restaurant.main_image}
                      alt={`${restaurant.rest_name} Logo`}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{restaurant.rest_name || 'N/A'}</h3>
                      <p className="text-sm text-gray-600">{formatDateTime(order.time)}</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-800">Order ID: </span>
                    <button
                      onClick={() => {
                        const restaurant = restaurants[order.restaurant_id] || {};
                        setSelectedOrder({
                          ...order,
                          restaurant_details: restaurant
                        });
                      }}
                      className="text-blue-500 underline font-bold"
                    >
                      {order.order_id}
                    </button>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-800">Recipient: </span>
                    {order.recipient_name}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-800">Total: </span>
                    ${order.total.toFixed(2)}
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold text-gray-800">Status: </span>
                    <div className={`inline-block p-2 rounded-lg ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order, e.target.value)}
                    className="w-full bg-gray-100 border border-gray-300 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out py-2 px-4"
                    aria-label={`Change status for order ${order.order_id}`}
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
