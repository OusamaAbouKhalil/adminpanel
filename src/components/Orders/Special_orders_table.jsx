import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useUpdateOrderStatus } from "../../lib/query/queries";
import { useUpdateSpecialOrderCost }  from "../../lib/query/queries";

const statusOptions = ['pending', 'on the way', 'completed', 'rejected', 'canceled'];

const SpecialOrdersTable = ({ orders }) => {
  const { mutate: updateOrderStatus } = useUpdateOrderStatus();
  const { mutate: updateSpecialOrderCost } = useUpdateSpecialOrderCost();

  const handleStatusChange = (order, newStatus) => {
    updateOrderStatus({ ...order, status: newStatus });
  };

  const handleCostChange = (order, newCost) => {
    const cost = parseFloat(newCost);
    if (!isNaN(cost) && cost >= 0) {
      updateSpecialOrderCost({ orderId: order.orderId, cost });
    }
  };

  return (
    <div className="p-6">
      <TableContainer component={Paper} className="shadow-lg rounded-2xl">
        <Table>
          <TableHead>
            <TableRow className="bg-indigo-50">
              <TableCell className="text-indigo-700 font-semibold">Order ID</TableCell>
              <TableCell className="text-indigo-700 font-semibold">Recipient</TableCell>
              <TableCell className="text-indigo-700 font-semibold">Contact</TableCell>
              <TableCell className="text-indigo-700 font-semibold">Delivery Address</TableCell>
              <TableCell className="text-indigo-700 font-semibold">Delivery Charge</TableCell>
              <TableCell className="text-indigo-700 font-semibold">Status</TableCell>
              <TableCell className="text-indigo-700 font-semibold">Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.orderId}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <TableCell className="text-gray-700">
                  {order.orderId.slice(0, 8)}...
                </TableCell>
                <TableCell className="text-gray-700">
                  {order.recipientName}
                </TableCell>
                <TableCell className="text-gray-700">
                  {order.contactNumber}
                </TableCell>
                <TableCell className="text-gray-700">
                  {order.deliveryAddress}
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={order.cost}
                    onChange={(e) => handleCostChange(order, e.target.value)}
                    size="small"
                    variant="outlined"
                    className="w-24"
                    inputProps={{ min: 0, step: 0.5 }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    size="small"
                    className="w-32"
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell className="text-gray-700">
                  {order.createdAt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SpecialOrdersTable;