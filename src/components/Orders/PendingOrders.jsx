import React, { useState, useMemo } from "react";
import OrderRequest from "./OrderRequest";
import { useStateContext } from "../../contexts/ContextProvider";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";

const PendingOrders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { drivers, orders, updateOrderStatus } = useStateContext();
  const navigate = useNavigate();

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "pending"),
    [orders]
  );

  const handleAccept = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleReject = (order) => {
    const updatedOrder = { ...order, status: "rejected" };
    updateOrderStatus(updatedOrder);
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
  const handleClosePage = () => {
    navigate("/orders");
  };
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClosePage();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={handleOutsideClick}
    >
      <div className="bg-white p-4 rounded shadow-lg relative max-w-4xl w-full overflow-y-auto">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded absolute top-2 right-2"
          onClick={handleClosePage}
        >
          X
        </button>
        <h1 className="text-xl font-bold mt-5 mb-10 text-center">
          Pending Orders
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {pendingOrders.length === 0 ? (
            <p>No pending orders</p>
          ) : (
            pendingOrders.map((order) => (
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
