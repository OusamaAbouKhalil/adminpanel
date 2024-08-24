import React from "react";

const OrderDetailsPopup = ({ order, onClose }) => {
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Order Details</title>");
    printWindow.document.write("</head><body>");
    printWindow.document.write(`<h1>Order ID: ${order.order_id}</h1>`);
    printWindow.document.write(`<p>Restaurant: ${order.restaurant_name}</p>`);
    printWindow.document.write(`<p>Recipient: ${order.recipient_name}</p>`);
    printWindow.document.write(`<p>Date: ${new Date(order.time.seconds * 1000).toLocaleString()}</p>`);
    printWindow.document.write(`<p>Total: $${order.total + order.delivery_fee}</p>`);
    printWindow.document.write(`<p>Status: ${order.status}</p>`);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-lg">
        <h2 className="text-xl font-bold mb-4">Order Details</h2>
        <p><strong>Order ID:</strong> {order.order_id}</p>
        <p><strong>Restaurant:</strong> {order.restaurant_name}</p>
        <p><strong>Recipient:</strong> {order.recipient_name}</p>
        <p><strong>Date:</strong> {new Date(order.time.seconds * 1000).toLocaleString()}</p>
        <p><strong>Total:</strong> ${order.total + order.delivery_fee}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
      <div
        className="fixed inset-0 bg-gray-900 opacity-50"
        onClick={onClose}
      />
    </div>
  );
};

export default OrderDetailsPopup;
