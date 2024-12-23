import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { MdClose, MdPrint } from 'react-icons/md';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};
const generateInvoicePDF = async (order) => {
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      // Header
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'SWIFT GO', fontSize: 28, bold: true, color: '#4CAF50' },
              { text: 'Food Delivery Service', fontSize: 12, color: '#666' }
            ]
          },
          {
            width: 'auto',
            stack: [
              { text: `Invoice #${order.order_id}`, alignment: 'right', bold: true },
              { text: new Date(order.time.seconds * 1000).toLocaleString(), alignment: 'right' }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },

      // Restaurant & Customer Info
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Restaurant Details', style: 'sectionHeader' },
              { text: order.restaurant_details.rest_name, bold: true },
              { text: `Rating: ${order.restaurant_details.rating}` },
              { text: `Estimated Time: ${order.restaurant_details.time}` }
            ]
          },
          {
            width: '*',
            stack: [
              { text: 'Delivery Details', style: 'sectionHeader' },
              { text: order.recipient_name, bold: true },
              { text: order.user_address },
              { text: `Floor: ${order.floor_num}`, margin: [0, 2] },
              { text: `Unit: ${order.unit_num}`, margin: [0, 2] }
            ]
          }
        ],
        columnGap: 20,
        margin: [0, 0, 0, 20]
      },

      // Order Details
      {
        stack: [
          { text: 'Order Summary', style: 'sectionHeader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto'],
              body: [
                [
                  { text: 'Description', style: 'tableHeader' },
                  { text: 'Amount', style: 'tableHeader' },
                  { text: 'Status', style: 'tableHeader' }
                ],
                [
                  'Order Subtotal',
                  `$${order.total.toFixed(2)}`,
                  order.status
                ],
                [
                  'Delivery Fee',
                  `$${order.delivery_fee.toFixed(2)}`,
                  ''
                ],
                [
                  { text: 'Total Amount', bold: true },
                  { text: `$${(order.total + order.delivery_fee).toFixed(2)}`, bold: true },
                  ''
                ]
              ]
            },
            layout: {
              hLineWidth: function (i, currentNode) {
                return (i === 0 || i === currentNode.table.body.length) ? 2 : 1;
              },
              vLineWidth: function () {
                return 0;
              },
              hLineColor: function (i, currentNode) {
                return (i === 0 || i === currentNode.table.body.length) ? '#4CAF50' : '#dedede';
              },
              paddingTop: function (i) {
                return i === 0 ? 10 : 5;
              },
              paddingBottom: function (i, currentNode) {
                return (i === currentNode.table.body.length - 1) ? 10 : 5;
              }
            }
          }
        ],
        margin: [0, 0, 0, 20]
      },

      // Payment Info
      {
        stack: [
          { text: 'Payment Information', style: 'sectionHeader' },
          { text: `Payment Method: ${order.payment_method}` },
          { text: `Credits Cost: ${order.costInCredits}` }
        ],
        margin: [0, 0, 0, 20]
      },

      // Footer
      {
        stack: [
          { text: 'Thank you for choosing Swift Go!', alignment: 'center', fontSize: 14 },
          { text: 'For support: support@swiftgo.com', alignment: 'center', color: '#666', fontSize: 10 }
        ]
      }
    ],
    styles: {
      sectionHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 10],
        color: '#4CAF50'
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: '#4CAF50'
      }
    },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 11,
      lineHeight: 1.2
    }
  };

  return docDefinition;
};

const OrderDetailsPopup = React.memo(({ order, onClose }) => {
  console.log(order);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  const handlePrint = useCallback(async () => {
    if (!order) return;
    try {
      setIsGeneratingPDF(true);
      const docDefinition = await generateInvoicePDF(order);
      const pdf = pdfMake.createPdf(docDefinition);
      pdf.open(); // Open in new window instead of download
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [order]);

  if (!order) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
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
        className="relative z-10 bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl mx-4"
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

        {/* Content */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
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
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm
                ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'}`}
              >
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-semibold">
                ${(order.total + order.delivery_fee).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">Customer Details</h3>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {order.recipient_name}
              </p>
              {order.phone && (
                <p className="text-sm text-gray-600">
                  <strong>Phone:</strong> {order.phone}
                </p>
              )}
              {order.address && (
                <p className="text-sm text-gray-600">
                  <strong>Address:</strong> {order.address}
                </p>
              )}
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">Restaurant Details</h3>
              {order.restaurant_details?.main_image && (
                <img
                  src={order.restaurant_details.main_image}
                  alt={order.restaurant_details.rest_name}
                  className="w-24 h-24 object-cover rounded-lg mb-3"
                />
              )}
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {order.restaurant_details?.rest_name}
              </p>
              {order.restaurant_details?.address && (
                <p className="text-sm text-gray-600">
                  <strong>Address:</strong> {order.restaurant_details.address}
                </p>
              )}
              {order.restaurant_details?.phone && (
                <p className="text-sm text-gray-600">
                  <strong>Phone:</strong> {order.restaurant_details.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
          <button
            onClick={handlePrint}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <MdPrint />
            {isGeneratingPDF ? 'Generating...' : 'Print'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  if (!prevProps.order && !nextProps.order) return true;
  if (!prevProps.order || !nextProps.order) return false;
  return prevProps.order.order_id === nextProps.order.order_id;
});

OrderDetailsPopup.propTypes = {
  order: PropTypes.shape({
    order_id: PropTypes.string.isRequired,
    restaurant_name: PropTypes.string.isRequired,
    recipient_name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    time: PropTypes.shape({
      seconds: PropTypes.number.isRequired
    }).isRequired,
    total: PropTypes.number.isRequired,
    delivery_fee: PropTypes.number.isRequired,
    phone: PropTypes.string,
    address: PropTypes.string,
    restaurant_details: PropTypes.shape({
      rest_name: PropTypes.string,
      main_image: PropTypes.string,
      address: PropTypes.string,
      phone: PropTypes.string
    })
  }),
  onClose: PropTypes.func.isRequired
};

OrderDetailsPopup.displayName = 'OrderDetailsPopup';

export default OrderDetailsPopup;