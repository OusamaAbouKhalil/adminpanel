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
    const sound = new Audio("../public/success.mp3");

    const unsubscribe = onSnapshot(
      collection(fsdb, "orders"),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const orderData = { ...change.doc.data() };

          setOrdersList((prevOrdersList) => {
            const existingOrderIndex = prevOrdersList.findIndex(
              (order) => order.order_id === orderData.order_id
            );

            if (existingOrderIndex !== -1) {
              const updatedOrdersList = [...prevOrdersList];
              updatedOrdersList[existingOrderIndex] = orderData;
              return updatedOrdersList;
            } else {
              // New order, play sound if it's pending
              if (orderData.status === "pending") {
                sound.play();
                //console.log("New order:", orderData);
                console.log("Sound played");
              }
              return [...prevOrdersList, orderData];
            }
          });
        });
      },
      (error) => {
        console.error("Snapshot error:", error);
      }
    );

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

        </div>

        {openPendingOrders && (
          <PendingOrders
            orders={ordersList}
            handlePendingOrdersClick={handlePendingOrdersClick}
          />
        )}

        {showCanceledOrders && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ordersList
              .filter(order => order.status === "canceled")
              .map(order => (
                <SpecialOrderCard key={order.id} order={order} />
              ))}
          </div>
        )}

        {!openPendingOrders && !showCanceledOrders && (
          <>
            {specialOrders.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialOrders.map((order) => (
                  <SpecialOrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

            <OrdersTable orders={ordersList} onStatusChange={handleStatusChange} />
          </>
        )}
      </div>
    </>
  );
};

export default Orders;
