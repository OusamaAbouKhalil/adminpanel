import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { OrdersTable, SpecialOrderCard } from "../components";
import { useUpdateOrderStatus } from "../lib/query/queries";
import PendingOrders from "../components/Orders/PendingOrders";
import { FaRegClock } from "react-icons/fa";
import { useStateContext } from "../contexts/ContextProvider";
import { startOfDay, endOfDay } from 'date-fns';

const Orders = () => {
  const { ordersList, setDayOrders, dayOrders, specialOrders } = useStateContext();
  const [openPendingOrders, setOpenPendingOrders] = useState(false);
  const [showCanceledOrders, setShowCanceledOrders] = useState(false); // State to toggle canceled orders view
  const [userHasInteracted, setUserHasInteracted] = useState(false); // Track user interaction
  const { mutate: updateOrderStatus } = useUpdateOrderStatus();

  // Set userHasInteracted to true on first interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserHasInteracted(true);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  const handleStatusChange = (order, newStatus) => {
    const updatedOrder = { ...order, status: newStatus };

    updateOrderStatus(updatedOrder);
  };

  const pendingOrdersCount = ordersList.filter(
    (order) => order.status === "pending"
  ).length;

  const handlePendingOrdersClick = () => {
    setOpenPendingOrders(!openPendingOrders);
  };
  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <DatePicker
            selected={dayOrders || new Date()}
            onChange={(date) => setDayOrders(date)}
            className="mb-4 md:mb-0 md:w-64 p-2 border border-gray-300 rounded-lg shadow-sm"
          />
          <button
            className="relative bg-gradient-to-r from-green-500 to-green-700 hover:opacity-80 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            onClick={handlePendingOrdersClick}
          >
            <span className="text-lg">Pending Orders  <FaRegClock className="inline-block" color="bg-white" size={24} /></span>
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

        {!openPendingOrders && (
          <>
            {specialOrders.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Special Orders</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {specialOrders.length} orders
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 auto-rows-auto grid-flow-dense">
                  {specialOrders
                    .sort((a, b) => {
                      if (a.status === "pending" && b.status !== "pending") return -1;
                      if (a.status !== "pending" && b.status === "pending") return 1;
                      return new Date(b.time || 0) - new Date(a.time || 0);
                    })
                    .map((order) => (
                      <SpecialOrderCard key={order.order_id} order={order} />
                    ))
                  }
                </div>
              </>
            )}
            <OrdersTable
              orders={ordersList}
              onStatusChange={handleStatusChange}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Orders;