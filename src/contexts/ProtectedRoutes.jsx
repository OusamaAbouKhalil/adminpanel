import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useStateContext } from './ContextProvider';
import { useEffect } from 'react';
import { off, onValue, ref } from 'firebase/database';
import db, { fsdb } from '../utils/firebaseconfig';
import { collection, onSnapshot } from 'firebase/firestore';
import AccessDeniedPage from '../components/AccessDenied'; 
import sound from '/success.mp3';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, logOut } = useAuth();
  const { setDrivers, setOrdersList } = useStateContext();
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

    const unsubscribe = onSnapshot(
      collection(fsdb, 'orders'),
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

    onValue(driversRef, onDriversChange, (error) => console.error('Error fetching drivers:', error));
    return () => {
      unsubscribe();
      off(driversRef, 'value', onDriversChange);
    };
  }, [currentUser, logOut, setDrivers, setOrdersList]);

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
      'titles',
      'banners',
    ];
    if (!adminRoutes.includes(location.pathname.split('/')[1])) {
      return <AccessDeniedPage />;
    }
  }

  return children;
};
