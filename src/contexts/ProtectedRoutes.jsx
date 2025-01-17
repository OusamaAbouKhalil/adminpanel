import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useStateContext } from './ContextProvider';
import { useGetPermissions } from '../lib/query/queries';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { ref, onValue, off } from 'firebase/database';
import sound from '/success.mp3';
import db, { fsdb } from '../utils/firebaseconfig';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, logOut } = useAuth();
  const { setBiteDrivers, setOrdersList, setDrivers } = useStateContext();
  const { data: permissions, isPending: loading } = useGetPermissions(currentUser);
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingOrderIds, setPendingOrderIds] = useState(new Set());
  const audioInstance = useMemo(() => new Audio(sound), []);

  // Setup Orders Listener
  useEffect(() => {
    const ordersRef = collection(fsdb, 'orders');
    const ordersQuery = query(ordersRef);

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const order = {
          ...change.doc.data(),
          order_id: change.doc.id
        };

        if (order.status?.toLowerCase() === 'pending') {
          // Only play sound if this is a new pending order we haven't seen
          if (!pendingOrderIds.has(order.order_id)) {
            audioInstance.play();
            setPendingOrderIds(prev => new Set([...prev, order.order_id]));
          }
        }
      });
    });

    return () => unsubscribe();
  }, [audioInstance, pendingOrderIds]);

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