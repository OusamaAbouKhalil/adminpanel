import React, { useState, useEffect } from "react";
import { OrdersTable, SpecialOrderCard } from "../components";
import { useUpdateOrderStatus } from "../lib/query/queries";
import { onSnapshot, collection } from "firebase/firestore";
import { fsdb } from "../utils/firebaseconfig";
import PendingOrders from "../components/Orders/PendingOrders";

const Orders = () => {
  const [specialOrders, setSpecialOrders] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [openPendingOrders, setOpenPendingOrders] = useState(false);
  const [showCanceledOrders, setShowCanceledOrders] = useState(false); // State to toggle canceled orders view
  const { mutate: updateOrderStatus } = useUpdateOrderStatus();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(fsdb, "orders"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const orderData = { ...change.doc.data() };

        setOrdersList((prevOrdersList) => {
          const existingOrderIndex = prevOrdersList.findIndex(order => order.order_id === orderData.order_id);

          if (existingOrderIndex !== -1) {
            // Order exists, update it
            const updatedOrdersList = [...prevOrdersList];
            updatedOrdersList[existingOrderIndex] = orderData;
            return updatedOrdersList;
          } else {
            // New order, add it to the list
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
    console.log(updatedOrder);
    updateOrderStatus(updatedOrder);
  };

  const pendingOrdersCount = ordersList.filter(
    (order) => order.status === "pending"
  ).length;

  const canceledOrdersCount = ordersList.filter(
    (order) => order.status === "canceled"
  ).length;

  const handlePendingOrdersClick = () => {
    setOpenPendingOrders(!openPendingOrders);
  };

  const handleCanceledOrdersClick = () => {
    setShowCanceledOrders(!showCanceledOrders);
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <button
            className="relative bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-80 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            onClick={handlePendingOrdersClick}
          >
            <span className="text-lg">Pending Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            className="relative bg-gradient-to-r from-red-500 to-red-700 hover:opacity-80 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            onClick={handleCanceledOrdersClick}
          >
            <span className="text-lg">Canceled Orders</span>
            {canceledOrdersCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                {canceledOrdersCount}
              </span>
            )}
          </button>
        </div>

        {openPendingOrders && (
          <PendingOrders
            orders={ordersList}
            handlePendingOrdersClick={handlePendingOrdersClick}
          />
        )}

        <OrdersTable
          orders={showCanceledOrders
            ? ordersList.filter(order => order.status === "canceled")
            : ordersList}
          onStatusChange={handleStatusChange}
        />
      </div>
    </>
  );
};

export default Orders;
