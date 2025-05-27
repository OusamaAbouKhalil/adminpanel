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
        return "bg-emerald-100 text-emerald-800 ring-emerald-500/20";
      case "preparing":
        return "bg-amber-100 text-amber-800 ring-amber-500/20";
      case "on the way":
        return "bg-teal-100 text-teal-800 ring-teal-500/20";
      case "completed":
        return "bg-green-100 text-green-800 ring-green-500/20";
      case "rejected":
      case "cancelled":
        return "bg-rose-100 text-rose-800 ring-rose-500/20";
      default:
        return "bg-gray-100 text-gray-800 ring-gray-500/20";
    }
  };

  return (
    <div className="py-8 px-6 bg-white rounded-2xl shadow-lg">
      {selectedOrder && (
        <OrderDetailsPopup
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {statuses.map((status) => (
          <button
            key={status}
            className={`relative px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
              activeTab === status
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab(status)}
          >
            {status.toUpperCase()}
            {getStatusCount(status) > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-pulse"
              >
                {getStatusCount(status)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-gray-700 placeholder-gray-400 transition-all duration-300"
            aria-label="Search by Order ID"
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* No Data Available */}
      {sortedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MdOutlineErrorOutline className="text-5xl text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600">No orders available</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your search or status filter</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Table for medium and larger screens */}
          <table className="hidden md:table w-full divide-y divide-gray-200">
            <thead className="bg-indigo-600 text-white">
              <tr>
                {["Logo", "Restaurant Name", "Order ID", "Recipient", "Date", "Total", "Status", "Actions"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-sm font-semibold tracking-wide uppercase"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedOrders.map((order) => {
                const restaurant = restaurants[order.restaurant_id] || {};
                return (
                  <tr key={order.order_id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <img
                        src={restaurant.main_image}
                        alt={`${restaurant.rest_name} Logo`}
                        className="w-12 h-12 object-cover rounded-lg shadow-sm"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{restaurant.rest_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          const restaurant = restaurants[order.restaurant_id] || {};
                          setSelectedOrder({
                            ...order,
                            restaurant_details: restaurant
                          });
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                      >
                        {order.order_id}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.recipient_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(order.time)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">${(order.total + order.delivery_fee).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => onStatusChange(order, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-700 transition-all duration-200"
                        aria-label={`Change status for order ${order.order_id}`}
                      >
                        {statuses.map((status) => (
                          <option
                            key={status}
                            value={status}
                            disabled={status === order.status}
                            className="text-gray-700"
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
          <div className="md:hidden space-y-4">
            {sortedOrders.map((order) => {
              const restaurant = restaurants[order.restaurant_id] || {};
              return (
                <div key={order.order_id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <img
                      src={restaurant.main_image}
                      alt={`${restaurant.rest_name} Logo`}
                      className="w-14 h-14 object-cover rounded-lg mr-4 shadow-sm"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{restaurant.rest_name || 'N/A'}</h3>
                      <p className="text-sm text-gray-600">{formatDateTime(order.time)}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Order ID: </span>
                      <button
                        onClick={() => {
                          const restaurant = restaurants[order.restaurant_id] || {};
                          setSelectedOrder({
                            ...order,
                            restaurant_details: restaurant
                          });
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                      >
                        {order.order_id}
                      </button>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Recipient: </span>
                      <span className="text-sm text-gray-600">{order.recipient_name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Total: </span>
                      <span className="text-sm text-gray-600">${order.total.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Status: </span>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-700 transition-all duration-200"
                      aria-label={`Change status for order ${order.order_id}`}
                    >
                      {statuses.map((status) => (
                        <option
                          key={status}
                          value={status}
                          disabled={status === order.status}
                          className="text-gray-700"
                        >
                          {status.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
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