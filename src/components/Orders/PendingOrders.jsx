import React, { useState, useMemo } from "react";
import OrderRequest from "./OrderRequest";
import { useStateContext } from "../../contexts/ContextProvider";
import Modal from "./Modal";
import { useUpdateOrderStatus } from "../../lib/query/queries";

const PendingOrders = ({ orders, handlePendingOrdersClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { drivers } = useStateContext();
  const { mutate: updateOrderStatus } = useUpdateOrderStatus();

  const pendingOrders = useMemo(
    () => orders?.filter((order) => order.status === "pending"),
    [orders]
  );

  const handleAccept = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleReject = (order) => {
    const updatedOrder = { ...order, status: "rejected" };
    updateOrderStatus(updatedOrder);
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectDriver = (driver) => {
    console.log(driver);
    const updatedOrder = {
      ...selectedOrder,
      status: "accepted",
      driver_id: driver.id,
    };
    console.log("selecting");
    updateOrderStatus(updatedOrder);
    setIsModalOpen(false);
  };

  return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-xl relative max-w-6xl w-full h-5/6 overflow-y-auto">
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full absolute top-4 right-4"
        onClick={handlePendingOrdersClick}
      >
        X
      </button>
      <h1 className="text-2xl font-extrabold mt-2 mb-8 text-center text-gray-800">
        Pending Orders
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {pendingOrders?.length === 0 ? (
          <p className="text-center text-gray-600">No pending orders</p>
        ) : (
          pendingOrders?.map((order) => (
            <OrderRequest
              key={order.order_id}
              order={order}
              onAccept={() => handleAccept(order)}
              onReject={() => handleReject(order)}
            />
          ))
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        drivers={drivers}
        onSelectDriver={handleSelectDriver}
      />
    </div>
  </div>
);
};

export default PendingOrders;
