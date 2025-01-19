import React from "react";

const SpecialOrderCard = ({ order }) => (
  <div className="p-4 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold text-gray-800">Special Order</h2>
      <span className={`px-3 py-1 rounded-full text-sm font-medium
        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'accepted' ? 'bg-green-100 text-green-800' :
            order.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'}`}>
        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
      </span>
    </div>

    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-gray-600">Order ID:</p>
          <p className="text-gray-800">{order.orderId}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Cost:</p>
          <p className="text-gray-800">${order.cost}</p>
        </div>
      </div>

      <div>
        <p className="font-semibold text-gray-600">From Address:</p>
        <p className="text-gray-800">{order.fromAddress}</p>
      </div>

      <div>
        <p className="font-semibold text-gray-600">Delivery Address:</p>
        <p className="text-gray-800">{order.deliveryAddress}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-gray-600">Recipient:</p>
          <p className="text-gray-800">{order.recipientName}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Contact:</p>
          <p className="text-gray-800">{order.contactNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-gray-600">Created At:</p>
          <p className="text-gray-800">{order.createdAt}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Delivery Time:</p>
          <p className="text-gray-800">{order.deliveryTime}</p>
        </div>
      </div>

      {order.additionalText && (
        <div>
          <p className="font-semibold text-gray-600">Additional Notes:</p>
          <p className="text-gray-800">{order.additionalText}</p>
        </div>
      )}
    </div>
  </div>
);

export default SpecialOrderCard;