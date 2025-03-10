import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { MdClose, MdPrint } from "react-icons/md";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getDatabase, ref, get, onValue, set, push } from "firebase/database";
import { fsdb } from "../../utils/firebaseconfig";
import { useUpdateOrderPrices } from "../../lib/query/queries";
import { useStateContext } from "../../contexts/ContextProvider";
import { useJsApiLoader } from '@react-google-maps/api';
import LocationRender from '../Map';
import toast from "react-hot-toast";

const OrderDetailsPopup = React.memo(({ order, onClose }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  // user details from real-time database to be displayed in the order details popup
  const [userDetails, setUserDetails] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);
  const [editedOrderItems, setEditedOrderItems] = useState([]);
  const updateOrderPricesMutation = useUpdateOrderPrices();

  const { ordersList, setOrdersList } = useStateContext();
  const { isLoaded } = useJsApiLoader({
      id: "google-map-script",
      googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });
  const getUserLocation = () => {
    if (order.user_location && 
        typeof order.user_location.latitude === 'number' && 
        typeof order.user_location.longitude === 'number') {
      return {
        lat: order.user_location.latitude,
        lng: order.user_location.longitude
      };
    }
    
    // Fallback to a default location if user_location is not available
    return { lat: 33.8938, lng: 35.5018 }; // Default coordinates (Beirut)
  };
  // Fetch user details from Realtime Database
  const fetchUserDetails = async () => {
    try {
      const userRef = ref(getDatabase(), `users/${order.user_id}`);
      onValue(userRef, (snapshot) => {
        setUserDetails(snapshot.val());
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    if (order && order.user_id) {
      fetchUserDetails();
    }
  }, [order]);

  useEffect(() => {
    if (order?.order_id) {
      const fetchOrderItems = async () => {
        const items = await getOrderItems(order.order_id);
        setOrderItems(items);
      };
      fetchOrderItems();
    }
  }, [order]);

  const getOrderItems = async (orderId) => {
    try {
      // First, get the orders collection reference
      const ordersRef = collection(fsdb, "orders");

      // Create a query to filter by order_id
      const orderQuery = query(ordersRef, where("order_id", "==", orderId));

      // Execute the query
      const orderSnapshot = await getDocs(orderQuery);

      // Assuming 'items' are a sub-collection of each order
      const items = [];
      for (const doc of orderSnapshot.docs) {
        const itemsRef = collection(doc.ref, "items"); // Sub-collection 'items' under each order
        const itemsSnapshot = await getDocs(itemsRef);
        itemsSnapshot.forEach((itemDoc) => {
          items.push(itemDoc.data());
        });
      }

      return items;
    } catch (error) {
      console.error("Error fetching order items:", error);
      return [];
    }
  };
  useEffect(() => {
    if (order) {
      setEditedOrder({
        ...order,
        total: order.total,
        delivery_fee: order.delivery_fee,
        costInCredits: order.costInCredits
      });
    }
  }, [order]);

  useEffect(() => {
    if (orderItems.length > 0) {
      setEditedOrderItems([...orderItems]);
    }
  }, [orderItems]);
  // Initialize pdfMake with fonts
  pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;
  pdfMake.fonts = {
    Roboto: {
      normal: "Roboto-Regular.ttf",
      bold: "Roboto-Medium.ttf",
      italics: "Roboto-Italic.ttf",
      bolditalics: "Roboto-MediumItalic.ttf",
    },
  };

  const handlePrint = useCallback(async () => {
    if (!order || orderItems.length === 0) {
      alert("Order items are not available.");
      return;
    }
    try {
      setIsGeneratingPDF(true);
      const docDefinition = await generateInvoicePDF(order);
      const pdf = pdfMake.createPdf(docDefinition);
      pdf.open(); // Open in new window instead of download
    } catch (error) {
      console.error("Error creating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [order, orderItems]);

  const generateInvoicePDF = async (order) => {
    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          columns: [
            {
              width: "*",
              stack: [
                {
                  text: "SWIFT GO",
                  fontSize: 28,
                  bold: true,
                  color: "#4CAF50",
                },
                { text: "Food Delivery Service", fontSize: 12, color: "#666" },
              ],
            },
            {
              width: "auto",
              stack: [
                {
                  text: `Invoice #${order.order_id}`,
                  alignment: "right",
                  bold: true,
                },
                {
                  text: new Date(order.time.seconds * 1000).toLocaleString(),
                  alignment: "right",
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },

        {
          columns: [
            {
              width: "*",
              stack: [
                { text: "Restaurant Details ", style: "sectionHeader" },
                { text: order.restaurant_details.rest_name, bold: true },
                { text: `Rating: ${order.restaurant_details.rating}` },
                { text: `Estimated Time: ${order.restaurant_details.time}` },
              ],
            },
            {
              width: "*",
              stack: [
                { text: "Delivery Details", style: "sectionHeader" },
                { text: order.recipient_name, bold: true },
                { text: order.user_address },
                { text: `Floor: ${order.floor_num}`, margin: [0, 2] },
                { text: `Unit: ${order.unit_num}`, margin: [0, 2] },
              ],
            },
          ],
          columnGap: 20,
          margin: [0, 0, 0, 20],
        },

        // show order items here as a table
        {
          stack: [
            { text: "Order Items", style: "sectionHeader" },
            {
              table: {
                headerRows: 1,
                widths: ["*", "auto", "auto", "auto", "auto", "auto"],
                body: [
                  // Header Row
                  [
                    { text: "Name", style: "tableHeader" },
                    { text: "Quantity", style: "tableHeader" },
                    { text: "Size", style: "tableHeader" },
                    { text: "Addons", style: "tableHeader" },
                    { text: "Instructions", style: "tableHeader" },
                    { text: "Total", style: "tableHeader" },
                  ],
                  // Data Rows
                  ...orderItems.map((item) => [
                    item.item_name, // Name
                    item.quantity, // Quantity
                    item.size === "No size selected." ? "N/A" : item.size, // Size
                    item.addons === "No addons selected." ? "N/A" : item.addons, // Addons
                    item.instructions === "No instructions provided."
                      ? "N/A"
                      : item.instructions, // Instructions
                    `$${item.total.toFixed(2)}`, // Total
                  ]),
                ],
              },
              layout: {
                hLineWidth: function (i, currentNode) {
                  return i === 0 || i === currentNode.table.body.length ? 2 : 1;
                },
                vLineWidth: function () {
                  return 0;
                },
                hLineColor: function (i, currentNode) {
                  return i === 0 || i === currentNode.table.body.length
                    ? "#4CAF50"
                    : "#dedede";
                },
                paddingTop: function (i) {
                  return i === 0 ? 10 : 5;
                },
                paddingBottom: function (i, currentNode) {
                  return i === currentNode.table.body.length - 1 ? 10 : 5;
                },
              },
            },
          ],
          margin: [0, 0, 0, 20],
        },

        {
          stack: [
            { text: "Order Summary", style: "sectionHeader" },
            {
              table: {
                headerRows: 1,
                widths: ["*", "auto", "auto"],
                body: [
                  [
                    { text: "Description", style: "tableHeader" },
                    { text: "Amount", style: "tableHeader" },
                    { text: "Status", style: "tableHeader" },
                  ],
                  [
                    "Order Subtotal",
                    `$${order.total.toFixed(2)}`,
                    order.status,
                  ],
                  ["Delivery Fee", `$${order.delivery_fee.toFixed(2)}`, ""],
                  [
                    { text: "Total Amount", bold: true },
                    {
                      text: `$${(order.total + order.delivery_fee).toFixed(2)}`,
                      bold: true,
                    },
                    "",
                  ],
                ],
              },
              layout: {
                hLineWidth: function (i, currentNode) {
                  return i === 0 || i === currentNode.table.body.length ? 2 : 1;
                },
                vLineWidth: function () {
                  return 0;
                },
                hLineColor: function (i, currentNode) {
                  return i === 0 || i === currentNode.table.body.length
                    ? "#4CAF50"
                    : "#dedede";
                },
                paddingTop: function (i) {
                  return i === 0 ? 10 : 5;
                },
                paddingBottom: function (i, currentNode) {
                  return i === currentNode.table.body.length - 1 ? 10 : 5;
                },
              },
            },
          ],
          margin: [0, 0, 0, 20],
        },

        {
          stack: [
            { text: "Payment Information", style: "sectionHeader" },
            { text: `Payment Method: ${order.payment_method}` },
            { text: `Credits Cost: ${order.costInCredits}` },
          ],
          margin: [0, 0, 0, 20],
        },

        {
          stack: [
            {
              text: "Thank you for choosing Swift Go!",
              alignment: "center",
              fontSize: 14,
            },
            {
              text: "For support: +961 81 999 769",
              alignment: "center",
              color: "#666",
              fontSize: 10,
            },
          ],
        },
      ],
      styles: {
        sectionHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 10],
          color: "#4CAF50",
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: "#4CAF50",
        },
      },
      defaultStyle: {
        font: "Roboto",
        fontSize: 11,
        lineHeight: 1.2,
      },
    };

    return docDefinition;
  };


  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  const handlePriceChange = (field, value) => {
    const newValue = parseFloat(value) || 0;
    if (field === 'total') {
      return;
    }

    setEditedOrder(prev => ({
      ...prev,
      [field]: newValue
    }));
  };
  const handleItemPriceChange = (index, value) => {
    const newValue = parseFloat(value) || 0;

    // Update this specific item's price
    const updatedItems = [...editedOrderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      total: newValue
    };
    setEditedOrderItems(updatedItems);

    // Recalculate and update the product total
    const newProductTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);

    setEditedOrder(prev => ({
      ...prev,
      total: parseFloat(newProductTotal.toFixed(2))
    }));
  };
  useEffect(() => {
    if (editMode && editedOrderItems.length > 0) {
      const itemsTotal = editedOrderItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

      // Only update if the calculated total is different (to prevent infinite loops)
      if (Math.abs(itemsTotal - (editedOrder?.total || 0)) > 0.01) {
        setEditedOrder(prev => ({
          ...prev,
          total: parseFloat(itemsTotal.toFixed(2))
        }));
      }
    }
  }, [editedOrderItems, editMode]);
  const handleSaveChanges = async () => {
    try {
      setIsGeneratingPDF(true);

      const result = await updateOrderPricesMutation.mutateAsync({
        order_id: editedOrder.order_id,
        total: editedOrder.total,
        delivery_fee: editedOrder.delivery_fee,
        costInCredits: editedOrder.costInCredits,
        items: editedOrderItems
      });

      if (result.success) {
        const updatedOrdersList = ordersList.map(o =>
          o.order_id === editedOrder.order_id
            ? {
              ...o,
              total: editedOrder.total,
              delivery_fee: editedOrder.delivery_fee,
              costInCredits: editedOrder.costInCredits
            }
            : o
        );
        onClose();
        setOrdersList(updatedOrdersList);
        setEditMode(false);
      } else {
        alert(`Error saving changes: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert(`Error saving changes: ${error.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  if (!order) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative z-10 bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-semibold">{order.order_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-semibold">
              {new Date(order.time.seconds * 1000).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${order.status === "completed"
                ? "bg-green-100 text-green-800"
                : order.status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
                }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Add price editing section */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <p className="text-sm text-gray-500">Product Total</p>
            <p className="font-semibold">
              ${editMode
                ? editedOrderItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2)
                : order.total.toFixed(2)}
            </p>
            {editMode && (
              <p className="text-xs text-gray-500 mt-1">
                (Calculated from item prices)
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Delivery Fee</p>
            {editMode ? (
              <input
                type="number"
                step="0.01"
                className="font-semibold border rounded p-1 w-28"
                value={editedOrder?.delivery_fee || 0}
                onChange={(e) => handlePriceChange('delivery_fee', e.target.value)}
              />
            ) : (
              <p className="font-semibold">${order.delivery_fee.toFixed(2)}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Cost in Credits</p>
            {editMode ? (
              <input
                type="number"
                step="0.01"
                className="font-semibold border rounded p-1 w-28"
                value={editedOrder?.costInCredits || 0}
                onChange={(e) => handlePriceChange('costInCredits', e.target.value)}
              />
            ) : (
              <p className="font-semibold">{order.costInCredits.toFixed(2)}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Grand Total</p>
            <p className="font-semibold text-lg text-green-600">
              ${(
                parseFloat((editMode ? editedOrder?.total : order.total) || 0) +
                parseFloat((editMode ? editedOrder?.delivery_fee : order.delivery_fee) || 0)
              ).toFixed(2)}
            </p>
            {editMode && (
              <p className="text-xs text-gray-500 mt-1">
                (Sum of Product Total + Delivery Fee)
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Restaurant Details */}
          <div className="flex items-center space-x-4">
            {order.restaurant_details?.main_image && (
              <img
                src={order.restaurant_details.main_image}
                alt={order.restaurant_details.rest_name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-semibold">
                {order.restaurant_details.rest_name}
              </p>
              <p className="text-sm text-gray-500">Rating</p>
              <p className="font-semibold">{order.restaurant_details.rating}</p>
              <p className="text-sm text-gray-500">Estimated Time</p>
              <p className="font-semibold">{order.restaurant_details.time}</p>
            </div>
          </div>

          {/* Client Data */}
          <div>
            <h4 className="text-xl font-semibold text-gray-800">Client Data</h4>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mt-4">
              <div>
                <p className="text-sm text-gray-500">Profile Pic</p>
                <img
                  src={
                    userDetails?.ProfilePic == null
                      ? "https://via.placeholder.com/150"
                      : userDetails?.ProfilePic
                  }
                  alt="profile pic"
                  className="w-16 h-16 object-cover rounded-full"
                />
              </div>

              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-semibold">{userDetails?.fullname}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold">{userDetails?.phone}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2 mt-6 mb-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">Delivery Location</h4>
          {order.user_location ? (
            <>
              <div className="border rounded-lg overflow-hidden">
                <LocationRender 
                  markerPosition={getUserLocation()} 
                  isLoaded={isLoaded}
                  onMapClick={() => {}}
                />
              </div>
              <div className="mt-3 flex">
                <input
                  type="text"
                  readOnly
                  value={`https://www.google.com/maps?q=${order.user_location.latitude},${order.user_location.longitude}`}
                  className="flex-1 p-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-700 font-mono text-sm"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${order.user_location.latitude},${order.user_location.longitude}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Location URL copied to clipboard.");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy
                </button>
              </div>
            </>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 text-gray-500 text-center">
              No location data available for this order
            </div>
          )}
        </div> 
        {/* Items List */}
        <div className="my-4">
          <h3 className="text-xl font-semibold text-gray-800">Order Items</h3>
          <table className="min-w-full mt-2 border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-gray-600">
                  Item Image
                </th>
                <th className="px-4 py-2 text-left text-gray-600">Item Name</th>
                <th className="px-4 py-2 text-left text-gray-600">Quantity</th>
                <th className="px-4 py-2 text-left text-gray-600">Size</th>
                <th className="px-4 py-2 text-left text-gray-600">Addons</th>
                <th className="px-4 py-2 text-left text-gray-600">
                  Instructions
                </th>
                <th className="px-4 py-2 text-left text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {(editMode ? editedOrderItems : orderItems).map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">
                    <img
                      src={item.item_image}
                      alt={item.item_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2">{item.item_name}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">
                    {item.size === "No size selected." ? "N/A" : item.size}
                  </td>
                  <td className="px-4 py-2">
                    {item.addons === "No addons selected." ? "N/A" : item.addons}
                  </td>
                  <td className="px-4 py-2">
                    {item.instructions === "No instructions provided."
                      ? "N/A"
                      : item.instructions}
                  </td>
                  <td className="px-4 py-2">
                    {editMode ? (
                      <input
                        type="number"
                        step="0.01"
                        className="font-semibold border rounded p-1 w-28"
                        value={item.total}
                        onChange={(e) => handleItemPriceChange(index, e.target.value)}
                      />
                    ) : (
                      `$${item.total.toFixed(2)}`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Actions */}
        <div className="flex justify-between mt-6">
          {editMode ? (
            <>
              <button
                onClick={handleSaveChanges}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Prices
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                disabled={isGeneratingPDF}
              >
                <MdPrint className="mr-2" />
                {isGeneratingPDF ? "Generating PDF..." : "Print Invoice"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});

OrderDetailsPopup.propTypes = {
  order: PropTypes.shape({
    order_id: PropTypes.string.isRequired,
    time: PropTypes.object.isRequired,
    status: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    delivery_fee: PropTypes.number.isRequired,
    payment_method: PropTypes.string.isRequired,
    recipient_name: PropTypes.string.isRequired,
    user_address: PropTypes.string.isRequired,
    floor_num: PropTypes.string,
    unit_num: PropTypes.string,
    restaurant_details: PropTypes.object.isRequired,
    costInCredits: PropTypes.number.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default OrderDetailsPopup;
