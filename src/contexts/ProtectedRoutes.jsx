import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useStateContext } from './ContextProvider';
import { useGetPermissions } from '../lib/query/queries';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { ref, onValue, off } from 'firebase/database';
import sound from '/success.mp3';
import db, { fsdb } from '../utils/firebaseconfig';
import { endOfDay, startOfDay } from 'date-fns';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, logOut } = useAuth();
  const { setBiteDrivers, setOrdersList, dayOrders, setDrivers } = useStateContext();
  const { data: permissions, isPending: loading } = useGetPermissions(currentUser);
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingOrderIds, setPendingOrderIds] = useState(new Set());
  const audioInstance = useMemo(() => new Audio(sound), []);

  // Setup Orders Listener
  useEffect(() => {
    console.log('Current dayOrders:', dayOrders); // Debug log

    const ordersRef = collection(fsdb, 'orders');
    const today = dayOrders || new Date();
    const startTime = startOfDay(today);
    const endTime = endOfDay(today);

    console.log('Query range:', { startTime, endTime }); // Debug log

    const ordersQuery = query(
      ordersRef,
      where('time', '>=', startTime),
      where('time', '<=', endTime)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      console.log('Snapshot received, docs count:', snapshot.size); // Debug log

      if (snapshot.empty) {
        console.log('No orders found for the date range');
        setOrdersList([]);
        return;
      }

      const orders = snapshot.docs.map(doc => ({
        ...doc.data(),
        order_id: doc.id,
        status: doc.data().status?.toLowerCase() || 'unknown'
      }));

      console.log('Processed orders:', orders); // Debug log
      setOrdersList(orders);

      // Handle pending orders notification
      orders.forEach(order => {
        if (order.status === 'pending' && !pendingOrderIds.has(order.order_id)) {
          audioInstance.play().catch(console.error);
          setPendingOrderIds(prev => new Set([...prev, order.order_id]));
        }
      });
    },
      (error) => {
        console.error('Error fetching orders:', error);
      });

    return () => unsubscribe();
  }, [audioInstance, pendingOrderIds, setOrdersList, dayOrders]);

  // Regular Drivers Listener
  useEffect(() => {
    const driversRef = ref(db, '/swiftBitesDrivers');
    const onDriversChange = (snapshot) => {
      const driversArray = snapshot.exists()
        ? Object.entries(snapshot.val()).map(([key, value]) => ({ id: key, ...value }))
        : [];
      setBiteDrivers(driversArray);
    };

    onValue(driversRef, onDriversChange);
    return () => off(driversRef, 'value', onDriversChange);
  }, [setBiteDrivers]);

  const hasAccess = useMemo(() => {
    const route = location.pathname.split('/')[1];
    return permissions?.[route] || false;
  }, [location.pathname, permissions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;