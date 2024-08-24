import React, { useState } from "react";

const OrdersTable = ({ orders, onStatusChange }) => {
  const statuses = ["accepted", "preparing", "on the way", "completed"];
  const [activeTab, setActiveTab] = useState(statuses[0]); // Default to the first status

  const getStatusCount = (status) => {
    return orders.filter((order) => order.status === status).length;
  };

  return (
    <div className="my-10">
      <div className="flex justify-center mb-4">
        {/* Status Tabs */}
        {statuses.map((status) => (
          <div key={status} className="relative inline-block mx-2">
            <button
              className={`rounded-t-lg px-4 py-2 text-sm font-bold text-gray-700 transition-colors duration-300 ease-in-out ${activeTab === status ? "bg-gray-200" : "bg-white"}`}
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

      <div
        className={`shadow-lg rounded-lg p-4 bg-white ${activeTab ? 'block' : 'hidden'}`}
      >
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          {activeTab.toUpperCase()}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">Recipient</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter((order) => order.status === activeTab)
                .map((order) => (
                  <tr
                    key={order.order_id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 text-sm">{order.order_id}</td>
                    <td className="px-4 py-2 text-sm">{order.recipient_name}</td>
                    <td className="px-4 py-2 text-sm">${order.total + order.delivery_fee}</td>
                    <td className="px-4 py-2 text-sm">{order.status}</td>
                    <td className="px-4 py-2">
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
