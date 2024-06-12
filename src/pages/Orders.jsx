import React, { useState, useMemo } from 'react';
import { useStateContext } from '../contexts/ContextProvider';
import { OrderRequest, OrdersTable, SpecialOrderCard, Modal } from '../components';

const Orders = () => {
  const [specialOrders, setSpecialOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { drivers, orders, updateOrderStatus } = useStateContext();

  const pendingOrders = useMemo(() => orders.filter(order => order.status === 'pending'), [orders]);

  const handleAccept = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleReject = (order) => {
    const updatedOrder = { ...order, status: 'rejected' };
    updateOrderStatus(updatedOrder);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectDriver = (driver) => {
    console.log(driver)
    const updatedOrder = { ...selectedOrder, status: 'accepted', driver_id: driver.id };
    console.log("selecting")
    updateOrderStatus(updatedOrder);
    setIsModalOpen(false);
  };

  const handleStatusChange = (order, newStatus) => {
    const updatedOrder = { ...order, status: newStatus };
    updateOrderStatus(updatedOrder);
  };

  return (
    <div className="container mx-auto p-4">
      {specialOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialOrders.map((order) => (
            <SpecialOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
      {pendingOrders.map((order) => (
        <OrderRequest key={order.order_id} order={order} onAccept={() => handleAccept(order)} onReject={() => handleReject(order)} />
      ))}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        drivers={drivers}
        onSelectDriver={handleSelectDriver}
      />
      <OrdersTable orders={orders} onStatusChange={handleStatusChange} />
    </div>
  );
};

export default Orders;
