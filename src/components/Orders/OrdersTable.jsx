import React from "react";

const OrdersTable = ({ orders, onStatusChange }) => {
  const statuses = ['accepted', 'preparing', 'on the way', 'completed'];

  return (
    <div className="space-y-8">
      {statuses.map(status => (
        <div key={status} className="shadow-lg rounded-lg p-4 bg-white">
          <h2 className="text-lg font-bold text-gray-700 mb-4">{status.toUpperCase()}</h2>
          <table className="min-w-full table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 w-1/4">Order ID</th>
                <th className="px-4 py-2 w-1/4">Recipient</th>
                <th className="px-4 py-2 w-1/4">Total</th>
                <th className="px-4 py-2 w-1/4">Status</th>
                {status !== 'completed' && (
                  <th className="px-4 py-2 w-1/4">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {orders.filter(order => order.status === status).map((order) => (
                <tr key={order.order_id} className="border-b last:border-b-0">
                  <td className="border px-4 py-2">{order.order_id}</td>
                  <td className="border px-4 py-2">{order.recipient_name}</td>
                  <td className="border px-4 py-2">${order.total}</td>
                  <td className="border px-4 py-2">{order.status}</td>

                  {status !== 'completed' && (
                    <td className="border">
                      <button
                        onClick={() => onStatusChange(order, statuses[statuses.indexOf(status) + 1])}
                        className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
      ))}
    </div>
  );
};

export default OrdersTable;
