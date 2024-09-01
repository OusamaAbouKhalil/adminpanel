import React from "react";

const OrderDetailsPopup = ({ order, onClose }) => {
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Order Details</title>");
    printWindow.document.write("</head><body>");
    printWindow.document.write(`<h1>Order ID: ${order.order_id}</h1>`);
    printWindow.document.write(`<p><strong>Restaurant:</strong> ${order.restaurant_name}</p>`);
    printWindow.document.write(`<p><strong>Recipient:</strong> ${order.recipient_name}</p>`);
    printWindow.document.write(`<p><strong>Date:</strong> ${new Date(order.time.seconds * 1000).toLocaleString()}</p>`);
    printWindow.document.write(`<p><strong>Total:</strong> $${order.total + order.delivery_fee}</p>`);
    printWindow.document.write(`<p><strong>Status:</strong> ${order.status}</p>`);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Popup */}
      <div className="relative z-20 bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Order Details</h2>
        <div className="mb-4 border-b border-gray-200 pb-4">
          <p className="text-lg font-medium"><strong>Order ID:</strong> {order.order_id}</p>
          <p className="text-lg font-medium"><strong>Restaurant:</strong> {order.restaurant_name}</p>
          <p className="text-lg font-medium"><strong>Recipient:</strong> {order.recipient_name}</p>
        </div>
        <div className="mb-4 border-b border-gray-200 pb-4">
          <p className="text-lg font-medium"><strong>Date:</strong> {new Date(order.time.seconds * 1000).toLocaleString()}</p>
          <p className="text-lg font-medium"><strong>Total:</strong> ${order.total + order.delivery_fee}</p>
          <p className="text-lg font-medium"><strong>Status:</strong> {order.status}</p>
        </div>
        <div className="absolute top-3 right-3">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-3 py-1 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            &times;
          </button>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>

      {/* Background Overlay */}
      <div
        className="fixed inset-0 z-10 bg-gray-900 opacity-50"
        onClick={onClose}
      />
    </div>
  );
};

export default OrderDetailsPopup;
