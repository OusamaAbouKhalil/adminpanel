import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OrdersTable, SpecialOrderCard } from "../components";
import { useUpdateOrderStatus } from "../lib/query/queries";
import { onSnapshot, collection } from "firebase/firestore";
import { fsdb } from "../utils/firebaseconfig";

const Orders = () => {
  const [specialOrders, setSpecialOrders] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const { mutate: updateOrderStatus } = useUpdateOrderStatus();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(fsdb, "orders"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const orderData = { ...change.doc.data() };

        setOrdersList((prevOrdersList) => {
          const existingOrderIndex = prevOrdersList.findIndex(order => order.order_id === orderData.order_id);

          if (existingOrderIndex !== -1) {
            const updatedOrdersList = [...prevOrdersList];
            updatedOrdersList[existingOrderIndex] = orderData;
            return updatedOrdersList;
          } else {
            return [...prevOrdersList, orderData];
          }
        });
      });
    }, (error) => {
      console.error("Snapshot error:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = (order, newStatus) => {
    const updatedOrder = { ...order, status: newStatus };
    updateOrderStatus(updatedOrder);
  };

  const pendingOrdersCount = ordersList.filter(
    (order) => order.status === "pending"
  ).length;

  const handlePendingOrdersClick = () => {
    navigate("/orders/pendingOrders");
  };

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <button
        className="relative bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handlePendingOrdersClick}
      >
        Pending Orders
        {pendingOrdersCount > 0 && (
          <span className="absolute -top-3 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {pendingOrdersCount}
          </span>
        )}
      </button>

      {specialOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {specialOrders.map((order) => (
            <SpecialOrderCard
              key={order.order_id}
              order={order}
              onClick={() => handleOrderClick(order.order_id)}
            />
          ))}
        </div>
      )}

      <OrdersTable
        orders={ordersList}
        onStatusChange={handleStatusChange}
        onOrderClick={handleOrderClick}
      />
    </div>
  );
};

export default Orders;
