import React, { useState } from "react";

const OrdersTable = ({ orders, onStatusChange }) => {
  const statuses = ["accepted", "preparing", "on the way", "completed"];
  const [activeTab, setActiveTab] = useState(statuses[0]); // Default to the first status

  const getStatusCount = (status) => {
    return orders.filter((order) => order.status === status).length;
  };

  return (
    <div className="my-10">
      <div className="flex justify-center mb-6">
        {/* Status Tabs */}
        {statuses.map((status) => (
          <button
            key={status}
            className={`relative mx-2 px-6 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ease-in-out ${activeTab === status ? "bg-blue-500 text-white shadow-lg" : "bg-gray-200 text-gray-700"}`}
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

      <div className={`shadow-lg rounded-lg overflow-hidden ${activeTab ? 'block' : 'hidden'}`}>
        <h2 className="text-xl font-bold text-gray-800 bg-gray-100 py-3 px-4 border-b">
          {activeTab.toUpperCase()}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-blue-100 text-blue-600 border-b border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-sm">Order ID</th>
                <th className="px-6 py-3 text-left font-medium text-sm">Recipient</th>
                <th className="px-6 py-3 text-left font-medium text-sm">Total</th>
                <th className="px-6 py-3 text-left font-medium text-sm">Status</th>
                <th className="px-6 py-3 text-left font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter((order) => order.status === activeTab)
                .map((order) => (
                  <tr
                    key={order.order_id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm">{order.order_id}</td>
                    <td className="px-6 py-4 text-sm">{order.recipient_name}</td>
                    <td className="px-6 py-4 text-sm">${order.total + order.delivery_fee}</td>
                    <td className="px-6 py-4 text-sm capitalize">{order.status}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onStatusChange(
                            order,
                            e.target.value
                          )
                        }
                        className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        {statuses.map((status) => (
                          <option
                            key={status}
                            value={status}
                            disabled={status === order.status}
                          >
                            Move to {status.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
