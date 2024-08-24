import React, { useState } from "react";

const OrdersTable = ({ orders, onStatusChange }) => {
  const statuses = ["accepted", "preparing", "on the way", "completed", "cancelled", "rejected"];
  const [activeTab, setActiveTab] = useState(statuses[0]); // Default to the first status
  const [searchTerm, setSearchTerm] = useState(""); // For filtering by Order ID
  const [openDropdownId, setOpenDropdownId] = useState(null); // Track which dropdown is open

  const getStatusCount = (status) => {
    return orders.filter((order) => order.status === status).length;
  };import React, { useState } from "react";

const OrdersTable = ({ orders, onStatusChange }) => {
  const statuses = ["accepted", "preparing", "on the way", "completed", "cancelled", "rejected"];
  const [activeTab, setActiveTab] = useState(statuses[0]); // Default to the first status
  const [searchTerm, setSearchTerm] = useState(""); // For filtering by Order ID
  const [openDropdownId, setOpenDropdownId] = useState(null); // Track which dropdown is open

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

  const handleDropdownToggle = (orderId) => {
    if (openDropdownId === orderId) {
      setOpenDropdownId(null); // Close dropdown if the same button is clicked again
    } else {
      setOpenDropdownId(orderId); // Open dropdown for the selected order
    }
  };

  const handleDropdownChange = (order, newStatus) => {
    onStatusChange(order, newStatus);
    setOpenDropdownId(null); // Close dropdown after action
  };

  return (
    <div className="my-10 p-4">
      <div className="flex justify-center mb-6">
        {/* Center the status buttons */}
        {statuses.map((status) => (
          <div key={status} className="relative inline-block mr-4">
            <button
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
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left sticky top-0 bg-gray-200">Order ID</th>
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left sticky top-0 bg-gray-200">Recipient</th>
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left sticky top-0 bg-gray-200">Total</th>
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left sticky top-0 bg-gray-200">Date</th> {/* New column */}
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left sticky top-0 bg-gray-200">Status</th>
                  {status !== "accepted" && status !== "cancelled" && status !== "rejected" && (
                    <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left sticky top-0 bg-gray-200">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="border-b last:border-b-0 hover:bg-gray-100 transition-colors duration-300"
                  >
                    <td className="border px-4 py-2 text-sm">{order.order_id}</td>
                    <td className="border px-4 py-2 text-sm">{order.recipient_name}</td>
                    <td className="border px-4 py-2 text-sm">${order.total + order.delivery_fee}</td>
                    <td className="border px-4 py-2 text-sm">{formatDateTime(order.time)}</td> {/* New column */}
                    <td className="border px-4 py-2 text-sm">{order.status}</td>
                    {status !== "cancelled" && status !== "rejected" && (
                      <td className="border px-4 py-2 text-sm">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => handleDropdownToggle(order.order_id)}
                            className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          >
                            Actions
                          </button>
                          {openDropdownId === order.order_id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
                              <button
                                onClick={() => handleDropdownChange(order, statuses[statuses.indexOf(status) - 1])}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
                              >
                                Move to {statuses[statuses.indexOf(status) - 1]}
                              </button>
                              <button
                                onClick={() => handleDropdownChange(order, statuses[statuses.indexOf(status) + 1])}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
                              >
                                Move to {statuses[statuses.indexOf(status) + 1]}
                              </button>
                            </div>
                          )}
                        </div>
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

  const handleDropdownToggle = (orderId) => {
    if (openDropdownId === orderId) {
      setOpenDropdownId(null); // Close dropdown if the same button is clicked again
    } else {
      setOpenDropdownId(orderId); // Open dropdown for the selected order
    }
  };

  const handleDropdownChange = (order, newStatus) => {
    onStatusChange(order, newStatus);
    setOpenDropdownId(null); // Close dropdown after action
  };

  return (
    <div className="my-10 p-4">
      <div className="flex justify-center mb-6">
        {/* Center the status buttons */}
        {statuses.map((status) => (
          <div key={status} className="relative inline-block mr-4">
            <button
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
                  {status !== "accepted" && status !== "cancelled" && status !== "rejected" && (
                    <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Actions</th>
                  )}
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Order ID</th>
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Recipient</th>
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Total</th>
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Date</th> {/* New column */}
                  <th className="px-4 py-2 border-b border-gray-300 w-1/6 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="border-b last:border-b-0 hover:bg-gray-100 transition-colors duration-300"
                  >
                    {status !== "accepted" && status !== "cancelled" && status !== "rejected" && (
                      <td className="border px-4 py-2 text-sm">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => handleDropdownToggle(order.order_id)}
                            className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          >
                            Actions
                          </button>
                          {openDropdownId === order.order_id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
                              <button
                                onClick={() => handleDropdownChange(order, statuses[statuses.indexOf(status) - 1])}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
                              >
                                Move to {statuses[statuses.indexOf(status) - 1]}
                              </button>
                              <button
                                onClick={() => handleDropdownChange(order, statuses[statuses.indexOf(status) + 1])}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
                              >
                                Move to {statuses[statuses.indexOf(status) + 1]}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="border px-4 py-2 text-sm">{order.order_id}</td>
                    <td className="border px-4 py-2 text-sm">{order.recipient_name}</td>
                    <td className="border px-4 py-2 text-sm">${order.total + order.delivery_fee}</td>
                    <td className="border px-4 py-2 text-sm">{formatDateTime(order.time)}</td> {/* New column */}
                    <td className="border px-4 py-2 text-sm">{order.status}</td>
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
