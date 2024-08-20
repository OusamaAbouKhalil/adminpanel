import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { fsdb } from "../utils/firebaseconfig";
import { formatCurrency } from "../utils/formatters"; // Helper function for currency formatting

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const orderRef = doc(fsdb, "orders", orderId);
      const orderDoc = await getDoc(orderRef);

      if (orderDoc.exists()) {
        setOrder(orderDoc.data());
      } else {
        console.error("No such order!");
      }
    };

    fetchOrder();
  }, [orderId]);

  const printInvoice = () => {
    const printContent = document.getElementById('invoice').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={printInvoice}
      >
        Print Invoice
      </button>

      <div id="invoice" className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row">
          <img
            src="/path-to-main-restaurant-image.jpg" // Update with actual path
            alt="Restaurant"
            className="w-full md:w-1/3 h-auto object-cover rounded-lg mb-4 md:mb-0 md:mr-4"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-4">Order Details</h1>
            <h2 className="text-xl font-semibold mb-2">Order ID: {order.order_id}</h2>
            <p className="mb-2"><strong>Status:</strong> {order.status}</p>
            <p className="mb-2"><strong>Customer:</strong> {order.customer_name}</p>
            <p className="mb-2"><strong>Date:</strong> {new Date(order.created_at.toDate()).toLocaleDateString()}</p>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Items:</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <img
                      src={item.image} // Ensure item.image contains a valid image URL
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                    />
                    <div>
                      <p className="text-lg font-medium">{item.name}</p>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-gray-600">Price: {formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xl font-bold">Total Price: {formatCurrency(order.total_price)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
