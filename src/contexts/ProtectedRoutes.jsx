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
  const { setBiteDrivers, setOrdersList, dayOrders, setDrivers, ordersList } = useStateContext();
  const { data: permissions, isPending: loading } = useGetPermissions(currentUser);
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingOrderIds, setPendingOrderIds] = useState(new Set());

  useEffect(() => {
    if (!currentUser || !currentUser.email) {
      logOut();
      navigate('/login');
      return;
    }

    const driversRef = ref(db, '/swiftBitesDrivers');
    const onDriversChange = (snapshot) => {
      const driversArray = snapshot.exists()
        ? Object.entries(snapshot.val()).map(([key, value]) => ({ id: key, ...value }))
        : [];
      setBiteDrivers(driversArray);
    };

    const fetchOrdersForDay = (date = new Date()) => {
      const start = startOfDay(date);
      const end = endOfDay(date);

      const ordersQuery = query(
        collection(fsdb, 'orders'),
        where('time', '>=', start),
        where('time', '<=', end)
      );

      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const newOrdersList = [...ordersList]; // Copy the existing orders list
          const newPendingOrderIds = new Set(pendingOrderIds); // Copy the existing pending order IDs

          snapshot.docChanges().forEach((change) => {
            const data = { ...change.doc.data() };
            const orderData = { ...data, status: data.status.toLowerCase() };

            if (orderData.status === 'pending' && !newPendingOrderIds.has(orderData.order_id)) {
              setTimeout(() => {
                const audio = new Audio(sound);
                audio.play().catch((error) => {
                  console.error('Sound play error:', error);
                });
              }, 100);
              newPendingOrderIds.add(orderData.order_id);
            }

            const existingOrderIndex = newOrdersList.findIndex(order => order.order_id === orderData.order_id);
            if (existingOrderIndex !== -1) {
              // Overwrite the existing order
              newOrdersList[existingOrderIndex] = orderData;
            } else {
              // Push the new order
              newOrdersList.push(orderData);
            }
          });

          setOrdersList(newOrdersList);
          setPendingOrderIds(newPendingOrderIds);
        },
        (error) => {
          console.error('Snapshot error:', error);
        }
      );

      return unsubscribe;
    };

    onValue(driversRef, onDriversChange, (error) => console.error('Error fetching drivers:', error));
    const unsubscribe = fetchOrdersForDay(dayOrders || new Date());
    return () => {
      unsubscribe();
      off(driversRef, 'value', onDriversChange);
    };
  }, [currentUser, dayOrders, setBiteDrivers, setOrdersList, ordersList, pendingOrderIds]);

  useEffect(() => {
    const driversRef = ref(db, '/drivers');
    const onDriversChange = (snapshot) => {
      console.log('Drivers snapshot:', snapshot);
      const driversArray = snapshot.exists()
        ? Object.entries(snapshot.val()).map(([key, value]) => ({ id: key, ...value }))
        : [];
      setDrivers(driversArray);
    };

    onValue(driversRef, onDriversChange, (error) => console.error('Error fetching drivers:', error));
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