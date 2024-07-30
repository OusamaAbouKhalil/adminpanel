import React, { useState, useMemo } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { OrdersTable, SpecialOrderCard } from "../components";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [specialOrders, setSpecialOrders] = useState([]);
  const { orders, updateOrderStatus } = useStateContext();
  const navigate = useNavigate();

  const pendingOrdersCount = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const handlePendingOrdersClick = () => {
    navigate("/orders/pendingOrders");
  };

  const handleStatusChange = (order, newStatus) => {
    const updatedOrder = { ...order, status: newStatus };
    updateOrderStatus(updatedOrder);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialOrders.map((order) => (
            <SpecialOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      <OrdersTable orders={orders} onStatusChange={handleStatusChange} />
    </div>
  );
};

export default Orders;
