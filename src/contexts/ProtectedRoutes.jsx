import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useStateContext } from './ContextProvider';
import { useEffect } from 'react';
import { off, onValue, query, ref } from 'firebase/database';
import db, { fsdb } from '../utils/firebaseconfig';
import { collection, onSnapshot, where } from 'firebase/firestore';
import AccessDeniedPage from '../components/AccessDenied';
import sound from '/success.mp3';
import { startOfDay, endOfDay } from 'date-fns';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, logOut } = useAuth();
  const { setDrivers, setOrdersList, dayOrders } = useStateContext();
  const location = useLocation();

  useEffect(() => {
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
  }, [dayOrders]);

  if (currentUser.email.split('-')[0] === 'admin') {
    const adminRoutes = [
      'restaurants',
      'orders',
      'orders/pendingOrders',
      'add',
      'prices',
      'notification',
      'editnotification',
      'promo',
      'offers',
      'titles'
    ];
    if (!adminRoutes.includes(location.pathname.split('/')[1])) {
      return <AccessDeniedPage />;
    }
  }

  return children;
};