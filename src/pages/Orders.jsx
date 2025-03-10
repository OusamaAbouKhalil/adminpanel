import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { OrdersTable, SpecialOrderCard } from "../components";
import { useUpdateOrderStatus } from "../lib/query/queries";
import PendingOrders from "../components/Orders/PendingOrders";
import { FaRegClock } from "react-icons/fa";
import { useStateContext } from "../contexts/ContextProvider";
import { startOfDay, endOfDay } from "date-fns";

const Orders = () => {
  const { ordersList, setDayOrders, dayOrders, specialOrders } = useStateContext();
  const [openPendingOrders, setOpenPendingOrders] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const { mutate: updateOrderStatus } = useUpdateOrderStatus();

  // Handle user interaction detection
  useEffect(() => {
    const handleInteraction = () => {
      setUserHasInteracted(true);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Handlers
  const handleStatusChange = (order, newStatus) => {
    updateOrderStatus({ ...order, status: newStatus });
  };

  const handlePendingOrdersClick = () => {
    setOpenPendingOrders((prev) => !prev);
  };

  const pendingOrdersCount = ordersList.filter(
    (order) => order.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-10 flex flex-col">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div className="w-full sm:w-auto relative">
            <DatePicker
              selected={dayOrders || new Date()}
              onChange={setDayOrders}
              className="w-full sm:w-72 px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-gray-700 placeholder-gray-400 transition-all duration-300"
              wrapperClassName="w-full"
              placeholderText="Select Date"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <button
            onClick={handlePendingOrdersClick}
            className="relative w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group flex items-center justify-center gap-3"
          >
            <FaRegClock className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
            <span className="text-sm font-semibold uppercase tracking-wider">Pending Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md animate-bounce">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex-grow flex flex-col">
        {openPendingOrders ? (
          <PendingOrders
            orders={ordersList}
            handlePendingOrdersClick={handlePendingOrdersClick}
            className="flex-grow"
          />
        ) : (
          <div className="flex flex-col flex-grow space-y-10">
            {specialOrders.length > 0 && (
              <section className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl flex-shrink-0">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Special Orders
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                    {specialOrders.length} {specialOrders.length === 1 ? 'order' : 'orders'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {specialOrders
                    .sort((a, b) => {
                      if (a.status === "pending" && b.status !== "pending") return -1;
                      if (a.status !== "pending" && b.status === "pending") return 1;
                      return new Date(b.time || 0) - new Date(a.time || 0);
                    })
                    .map((order) => (
                      <SpecialOrderCard
                        key={order.order_id}
                        order={order}
                        className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                      />
                    ))}
                </div>
              </section>
            )}
            <section className="bg-white rounded-2xl shadow-lg transform transition-all duration-300 hover:shadow-xl flex-grow">
              <OrdersTable
                orders={ordersList}
                onStatusChange={handleStatusChange}
                className="h-full"
              />
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
