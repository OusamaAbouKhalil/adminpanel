import React from "react";

const OrderDetailsPopup = ({ order, items, onClose }) => {
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Order Receipt</title>");
    printWindow.document.write(`<style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1, h2, h3 { margin: 0; padding-bottom: 10px; }
      p { margin: 0; padding: 5px 0; }
      .receipt-container { border: 1px solid #ccc; padding: 20px; }
      .total { margin-top: 20px; font-size: 18px; font-weight: bold; }
      .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #555; }
    </style>`);
    printWindow.document.write("</head><body>");
    printWindow.document.write(`<div class="receipt-container">`);
    printWindow.document.write(`<h1>Order Receipt</h1>`);
    printWindow.document.write(`<h2>Order ID: ${order.order_id}</h2>`);
    printWindow.document.write(`<p><strong>Restaurant:</strong> ${order.restaurant_name}</p>`);
    printWindow.document.write(`<p><strong>Recipient:</strong> ${order.recipient_name}</p>`);
    printWindow.document.write(`<p><strong>Date:</strong> ${new Date(order.time.seconds * 1000).toLocaleString()}</p>`);

    const total = order.total + order.delivery_fee;

    printWindow.document.write(`<p class="total">Subtotal: $${order.total.toFixed(2)}</p>`);
    printWindow.document.write(`<p class="total">Delivery Fee: $${order.delivery_fee.toFixed(2)}</p>`);
    printWindow.document.write(`<p class="total">Total: $${total.toFixed(2)}</p>`);
    printWindow.document.write(`<p class="total">In credits: $${order.costInCredits.toFixed(2)}</p>`);
    printWindow.document.write(`<p><strong>Payment Method:</strong> ${order.payment_method}</p>`);
    printWindow.document.write(`</div>`);

    // Footer with Thank You message and All rights reserved
    printWindow.document.write(`<div class="footer">`);
    printWindow.document.write(`<p>Thank you for your order!</p>`);
    printWindow.document.write(`<p>All rights reserved © SwiftGo ${new Date().getFullYear()}</p>`);
    printWindow.document.write(`</div>`);

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
        {/* Display order items */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Order Items:</h3>
          <ul className="list-disc pl-5">
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <li key={index} className="mb-1">
                  <p><strong>{item.name}</strong> - ${item.price.toFixed(2)} x {item.quantity}</p>
                </li>
              ))
            ) : (
              <li>No items available</li>
            )}
          </ul>
        </div>
        <div className="absolute top-3 right-3">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-3 py-1 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            &times;
          </button>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
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
