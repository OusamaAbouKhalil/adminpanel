import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaClock, FaUser, FaMoneyBill } from "react-icons/fa";

const SpecialOrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(true);
  const [showMore, setShowMore] = useState({
    fromAddress: false,
    deliveryAddress: false,
    additionalText: false
  });
  const isPending = order.status === 'pending';
  const shouldShowFullCard = isPending || expanded;

  const toggleExpand = () => {
    if (!isPending) {
      setExpanded(!expanded);
    }
  };

  const toggleShowMore = (field) => {
    setShowMore(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return showMore[text] ? text : `${text.slice(0, maxLength)}...`;
  };

  return (
    <div
      className={`border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-300 w-full
        ${!isPending && 'cursor-pointer'} 
        ${shouldShowFullCard ? 'p-6' : 'p-4'}`}
      onClick={!isPending ? toggleExpand : undefined}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg text-gray-900">Special Order</h2>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
              order.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                order.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                  'bg-gray-100 text-gray-800'}`}>
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </span>
          {!isPending && (
            expanded ? 
              <FaChevronUp className="text-gray-500 hover:text-gray-700 transition-colors" size={18} /> :
              <FaChevronDown className="text-gray-500 hover:text-gray-700 transition-colors" size={18} />
          )}
        </div>
      </div>

      {!shouldShowFullCard ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600 gap-4">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" size={14} />
            <span className="truncate max-w-[200px]">{truncateText(order.deliveryAddress, 30)}</span>
            {showMore.deliveryAddress }
           
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-green-500" size={14} />
            <span>{order.deliveryTime?.replace('Time: ', '')}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaMoneyBill className="text-purple-500" size={14} />
            <span className="font-semibold text-gray-900">${order.total}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <FaMoneyBill className="text-purple-500" size={16} />
              <div>
                <p className="text-xs font-medium text-gray-500">Cost</p>
                <p className="text-sm text-gray-900">${order.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-500" size={16} />
              <div>
                <p className="text-xs font-medium text-gray-500">From Address</p>
                <p className="text-sm text-gray-900">
                  {order.fromAddress}
                  
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-500" size={16} />
              <div>
                <p className="text-xs font-medium text-gray-500">Delivery Address</p>
                <p className="text-sm text-gray-900">
                  {order.deliveryAddress}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <FaUser className="text-indigo-500" size={16} />
              <div>
                <p className="text-xs font-medium text-gray-500">Recipient</p>
                <p className="text-sm text-gray-900">{order.recipientName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-green-500" size={16} />
              <div>
                <p className="text-xs font-medium text-gray-500">Delivery Time</p>
                <p className="text-sm text-gray-900">{order.deliveryTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-green-500" size={16} />
              <div>
                <p className="text-xs font-medium text-gray-500">Created At</p>
                <p className="text-sm text-gray-900">{order.createdAt}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Order ID</p>
                <p className="text-sm text-gray-900">{
                  // take order id first 8 characters only using slice
                  order.order_id.slice(0, 8) 
                  }</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Contact</p>
                <p className="text-sm text-gray-900">{order.contactNumber}</p>
              </div>
            </div>
            {order.additionalText && (
              <div>
                <p className="text-xs font-medium text-gray-500">Additional Notes</p>
                <p className="text-sm text-gray-900">
                  {order.additionalText}
               
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialOrderCard;
