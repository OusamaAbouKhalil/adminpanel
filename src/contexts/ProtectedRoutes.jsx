import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useStateContext } from './ContextProvider';
import { off, onValue, query, ref } from 'firebase/database';
import { collection, onSnapshot, where,doc,getDoc } from 'firebase/firestore';
import db, { fsdb, auth } from '../utils/firebaseconfig';
import AccessDeniedPage from '../components/AccessDenied';
import sound from '/success.mp3';
import { startOfDay, endOfDay } from 'date-fns';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, logOut } = useAuth();
  const { setDrivers, setOrdersList, dayOrders } = useStateContext();
  const location = useLocation();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !currentUser.email) {
      logOut();
      return;
    }

    const fetchPermissions = async () => {
      try {
        const userRef = doc(fsdb, 'admins', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setPermissions(userDoc.data().permissions || {});
        } else {
          console.error('No such document!');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [currentUser, fsdb, logOut]);

  useEffect(() => {
    if (!loading) {
      if (!currentUser || !currentUser.email) {
        logOut();
        return <Navigate to="/login" replace />;
      }

      const driversRef = ref(db, '/swiftBitesDrivers');
      const onDriversChange = (snapshot) => {
        const driversArray = snapshot.exists()
          ? Object.entries(snapshot.val()).map(([key, value]) => ({ id: key, ...value }))
          : [];
        setDrivers(driversArray);
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
            snapshot.docChanges().forEach((change) => {
              const data = { ...change.doc.data() };
              const orderData = { ...data, status: data.status.toLowerCase() };

              // Function to play sound for pending orders
              const playPendingOrderSound = () => {
                if (orderData.status === 'pending') {
                  setTimeout(() => {
                    const audio = new Audio(sound);
                    audio.play().catch((error) => {
                      console.error('Sound play error:', error);
                    });
                  }, 100); // Delay of 100ms
                }
              };

              setOrdersList((prevOrdersList) => {
                const existingOrderIndex = prevOrdersList.findIndex(
                  (order) => order.order_id === orderData.order_id
                );
                if (existingOrderIndex !== -1) {
                  const updatedOrdersList = [...prevOrdersList];
                  updatedOrdersList[existingOrderIndex] = orderData;
                  playPendingOrderSound(); // Play sound for updated pending orders
                  return updatedOrdersList;
                } else {
                  playPendingOrderSound(); // Play sound for new pending orders
                  return [...prevOrdersList, orderData];
                }
              });
            });
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
    }
  }, [currentUser, dayOrders, fsdb, logOut, setDrivers, setOrdersList, loading]);

  const hasAccess = (path) => {
    const route = path.split('/')[1];
    return permissions[route] || false;
  };

  if (loading) {
    return  <div className="flex justify-center items-center h-64">
    <div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div>
</div>; // Optional: a loading spinner or placeholder
  }

  if (!hasAccess(location.pathname)) {
    return <AccessDeniedPage />;
  }

  return children;
};
