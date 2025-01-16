import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useStateContext } from './ContextProvider';
import { off, onValue, query, ref } from 'firebase/database';
import { collection, onSnapshot, where } from 'firebase/firestore';
import db, { fsdb } from '../utils/firebaseconfig';
import AccessDeniedPage from '../components/AccessDenied';
import sound from '/success.mp3';
import { startOfDay, endOfDay } from 'date-fns';
import { useGetPermissions } from '../lib/query/queries';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, logOut } = useAuth();
  const { setBiteDrivers, setOrdersList, dayOrders, setDrivers } = useStateContext();
  const { data: permissions, isPending: loading } = useGetPermissions(currentUser);
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingOrderIds, setPendingOrderIds] = useState(new Set());
  const audioInstance = useMemo(() => new Audio(sound), []);

  useEffect(() => {
    let isSubscribed = true;

    const setupListeners = async () => {
      if (!currentUser?.email) {
        await logOut();
        navigate('/login');
        return;
      }

      // Firebase Realtime Database: Drivers Listener
      const driversRef = ref(db, '/swiftBitesDrivers');
      const onDriversChange = (snapshot) => {
        if (!isSubscribed) return;

        const driversArray = snapshot.exists()
          ? Object.entries(snapshot.val()).map(([key, value]) => ({ id: key, ...value }))
          : [];
        setBiteDrivers((prevDrivers) =>
          JSON.stringify(driversArray) !== JSON.stringify(prevDrivers) ? driversArray : prevDrivers
        );
      };

      // Firestore: Orders Listener
      const ordersQuery = query(
        collection(fsdb, 'orders'),
        where('time', '>=', startOfDay(dayOrders || new Date())),
        where('time', '<=', endOfDay(dayOrders || new Date()))
      );

      const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        if (!isSubscribed) return;

        setOrdersList((prevOrdersList) => {
          const newOrdersList = [...prevOrdersList];
          const newPendingOrderIds = new Set(pendingOrderIds);

          snapshot.docChanges().forEach((change) => {
            const orderData = { ...change.doc.data(), status: change.doc.data().status.toLowerCase() };

            // Only play sound for newly added pending orders
            if (
              change.type === 'added' &&
              orderData.status === 'pending' &&
              !prevOrdersList.some(order => order.order_id === orderData.order_id)
            ) {
              audioInstance.currentTime = 0;
              audioInstance.play().catch(console.error);
              newPendingOrderIds.add(orderData.order_id);
            }

            const existingOrderIndex = newOrdersList.findIndex(
              (order) => order.order_id === orderData.order_id
            );

            if (existingOrderIndex !== -1) {
              newOrdersList[existingOrderIndex] = orderData;
            } else {
              newOrdersList.push(orderData);
            }
          });

          setPendingOrderIds(newPendingOrderIds);
          return newOrdersList;
        });
      });

      // Attach Realtime Database Listener
      onValue(driversRef, onDriversChange);

      return () => {
        isSubscribed = false;
        unsubscribeOrders();
        off(driversRef, 'value', onDriversChange);
      };
    };

    setupListeners();
  }, [currentUser, dayOrders, logOut, navigate, setBiteDrivers, setOrdersList, pendingOrderIds]);

  useEffect(() => {
    const driversRef = ref(db, '/drivers');
    const onDriversChange = (snapshot) => {
      const driversArray = snapshot.exists()
        ? Object.entries(snapshot.val()).map(([key, value]) => ({ id: key, ...value }))
        : [];
      setDrivers((prevDrivers) =>
        JSON.stringify(driversArray) !== JSON.stringify(prevDrivers) ? driversArray : prevDrivers
      );
    };

    onValue(driversRef, onDriversChange);

    return () => {
      off(driversRef, 'value', onDriversChange);
    };
  }, [setDrivers]);

  const hasAccess = useMemo(() => {
    const route = location.pathname.split('/')[1];
    return permissions?.[route] || false;
  }, [location.pathname, permissions]);

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessDeniedPage />;
  }

  return children;
};
