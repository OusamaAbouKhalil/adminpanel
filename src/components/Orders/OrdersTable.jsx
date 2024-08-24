import React, { useState } from "react";

const OrdersTable = ({ orders, onStatusChange }) => {
  const statuses = ["accepted", "preparing", "on the way", "completed"];
  const [activeTab, setActiveTab] = useState(statuses[0]); // Default to the first status
  const [searchTerm, setSearchTerm] = useState(""); // For filtering by Order ID

  const getStatusCount = (status) => {
    return orders.filter((order) => order.status === status).length;
  };

  const filteredOrders = orders.filter((order) => 
    order.status === activeTab && order.order_id.includes(searchTerm)
  );

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JS Date
    const formattedDate = date.toLocaleDateString("en-US");
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate}, ${formattedTime}`;
  };
  
    // Sorting orders by Firestore timestamp
  const sortedOrders = orders
    .filter((order) => order.status === activeTab && order.order_id.includes(searchTerm))
    .sort((a, b) => {
      return b.time.seconds - a.time.seconds;
    });

  return (
    <div className="my-10 p-4">
      <div className="flex justify-center mb-6">
        {/* Center the status buttons */}
        {statuses.map((status) => (
          <div key={status} className="relative inline-block mr-4">
            <button
              key={status}
              className={`rounded-t-lg p-3 mr-2 lg:text-lg text-sm font-bold text-gray-700 ${activeTab === status ? "bg-gray-200" : "bg-white"} transition-colors duration-300`}
              onClick={() => setActiveTab(status)}
            >
              {status.toUpperCase()}
            </button>
            {getStatusCount(status) > 0 && (
              <span
                className="absolute top-0 right-2 rounded-full bg-red-600 text-white text-xs font-bold px-2 py-1"
                style={{ transform: "translate(50%, -50%)" }}
              >
                {getStatusCount(status)}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mb-6 flex justify-center">
        {/* Search bar for Order ID */}
        <input
          type="text"
          placeholder="Search by Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full max-w-md"
        />
      </div>

      {statuses.map((status) => (
        <div
          key={status}
          className={`${activeTab === status ? "block" : "hidden"} shadow-lg rounded-lg p-6 bg-white`}
        >
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            {status.toUpperCase()}
          </h2>
          <div className="overflow-x-auto">
            {/* Add horizontal scroll for smaller screens */}
            <table className="min-w-full table-fixed border-separate border-spacing-0">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  {status !== "accepted" && (
                    <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Actions</th>
                  )}
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Order ID</th>
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Recipient</th>
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Total</th>
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Date</th> {/* New column */}
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Status</th>
                  {status !== "completed" && (
                    <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="border-b last:border-b-0 hover:bg-gray-100 transition-colors duration-300"
                  >
                    {status !== "accepted" && (
                      <td className="border px-4 py-2 text-sm">
                        <button
                          onClick={() =>
                            onStatusChange(
                              order,
                              statuses[statuses.indexOf(status) - 1]
                            )
                          }
                          className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                          Move to {statuses[statuses.indexOf(status) - 1]}
                        </button>
                      </td>
                    )}
                    <td className="border px-4 py-2 text-sm">{order.order_id}</td>
                    <td className="border px-4 py-2 text-sm">{order.recipient_name}</td>
                    <td className="border px-4 py-2 text-sm">${order.total + order.delivery_fee}</td>
                     <td className="border px-4 py-2 text-sm">{formatDateTime(order.time)}</td> {/* New column */}
                     <td className="border px-4 py-2 text-sm">{order.status}</td>

                    {status !== "completed" && (
                      <td className="border px-4 py-2 text-sm">
                        <button
                          onClick={() =>
                            onStatusChange(
                              order,
                              statuses[statuses.indexOf(status) + 1]
                            )
                          }
                          className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                          Move to {statuses[statuses.indexOf(status) + 1]}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersTable;
