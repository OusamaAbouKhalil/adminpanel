import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaClock, FaUser, FaMoneyBill } from "react-icons/fa";

const SpecialOrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const isPending = order.status === 'pending';

  // Always show full card for pending orders, and conditionally for others
  const shouldShowFullCard = isPending || expanded;

  const toggleExpand = () => {
    if (!isPending) {
      setExpanded(!expanded);
    }
  };

  return (
    <div
      className={`border rounded-lg shadow-md bg-white hover:shadow-lg transition-all duration-300
        ${!isPending && 'cursor-pointer'} 
        ${shouldShowFullCard ? 'p-4' : 'p-2'}`}
      onClick={!isPending ? toggleExpand : undefined}
      style={{
        height: shouldShowFullCard ? 'auto' : '70px',
        maxHeight: shouldShowFullCard ? 'none' : '70px',
        overflow: shouldShowFullCard ? 'visible' : 'hidden'
      }}
    >
      <div className={`flex justify-between items-center ${shouldShowFullCard ? 'mb-3' : 'mb-1'}`}>
        <h2 className={`font-bold text-gray-800 ${shouldShowFullCard ? 'text-lg' : 'text-sm'}`}>
          Special Order
        </h2>
        <div className="flex items-center">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium mr-2
            ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'}`}>
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </span>
          {!isPending && (
            expanded ?
              <FaChevronUp className="text-gray-500" /> :
              <FaChevronDown className="text-gray-500" />
          )}
        </div>
      </div>

      {/* Show minimal info for non-expanded cards */}
      {!shouldShowFullCard ? (
        <div className="flex justify-between items-center text-xs text-gray-700">
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-gray-500 mr-1 flex-shrink-0" size={10} />
            <span className="truncate max-w-[100px]">{order.deliveryAddress}</span>
          </div>
          <div className="flex items-center ml-2">
            <FaClock className="text-gray-500 mr-1 flex-shrink-0" size={10} />
            <span>{order.deliveryTime?.replace('Time: ', '')}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <FaMoneyBill className="text-gray-500 mr-1 flex-shrink-0" size={10} />
            <span className="font-medium text-gray-900">${order.total}</span>
          </div>
        </div>
      ) : (
        <>
          {/* Full content for expanded cards */}
          <div className="text-sm mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-600">Order ID:</p>
                <p className="text-gray-800">{order.orderId}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Cost:</p>
                <p className="text-gray-800">${order.total}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-600">From Address:</p>
              <p className="text-gray-800">{order.fromAddress}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-600">Delivery Address:</p>
              <p className="text-gray-800">{order.deliveryAddress}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-600">Recipient:</p>
                <p className="text-gray-800">{order.recipientName}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Contact:</p>
                <p className="text-gray-800">{order.contactNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-600">Created At:</p>
                <p className="text-gray-800">{order.createdAt}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Delivery Time:</p>
                <p className="text-gray-800">{order.deliveryTime}</p>
              </div>
            </div>

            {order.additionalText && (
              <div>
                <p className="font-semibold text-gray-600">Additional Notes:</p>
                <p className="text-gray-800">{order.additionalText}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SpecialOrderCard;