import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
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
      setOrdersList([]);
      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const newOrdersList = [];
          snapshot.docChanges().forEach((change) => {
            const data = { ...change.doc.data() };
            const orderData = { ...data, status: data.status.toLowerCase() };

            if (orderData.status === 'pending') {
              setTimeout(() => {
                const audio = new Audio(sound);
                audio.play().catch((error) => {
                  console.error('Sound play error:', error);
                });
              }, 100);
            }

            newOrdersList.push(orderData);
          });
          setOrdersList(newOrdersList);
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
  }, [currentUser, dayOrders, setBiteDrivers]);


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
  }, [])


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