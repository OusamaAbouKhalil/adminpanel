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
  const {
    setBiteDrivers,
    setOrdersList,
    setSpecialOrdersList,
    dayOrders,
    setDrivers
  } = useStateContext();
  const { data: permissions, isPending: loading } = useGetPermissions(currentUser);
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingOrderIds, setPendingOrderIds] = useState(new Set());
  const audioInstance = useMemo(() => new Audio(sound), []);

  useEffect(() => {
    const specialOrdersRef = collection(fsdb, 'special_orders');




    let today;
    try {
      if (dayOrders instanceof Date && !isNaN(dayOrders.getTime())) {
        today = dayOrders;

      } else if (dayOrders && typeof dayOrders === 'object' && dayOrders.seconds) {
        today = new Date(dayOrders.seconds * 1000);

      } else if (dayOrders && typeof dayOrders === 'string') {
        today = new Date(dayOrders);

      } else {
        today = new Date();

      }

      if (isNaN(today.getTime())) {
        console.error("Invalid date after parsing", today);
        today = new Date();
      }
    } catch (error) {
      console.error("Error parsing date:", error);
      today = new Date();
    }




    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;



    const startOfDayStr = `${formattedDate} 00:00:00`;
    const endOfDayStr = `${formattedDate} 23:59:59`;


    const specialOrdersQuery = query(
      specialOrdersRef,
      where('createdAt', '>=', startOfDayStr),
      where('createdAt', '<=', endOfDayStr)
    );

    const unsubscribe = onSnapshot(specialOrdersQuery, (snapshot) => {
      if (snapshot.empty) {
        setSpecialOrdersList([]);
        return;
      }

      const specialOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        const [datePart, timePart] = data.createdAt.split(' ');
        const [day, month, year] = datePart.split('/');
        const timestamp = new Date(`${year}-${month}-${day} ${timePart}`);

        return {
          orderId: data.orderId,
          fromAddress: data.FromAddress,
          additionalText: data.additionalText,
          contactNumber: data.contactNumber,
          total: data.cost,
          createdAt: data.createdAt,
          deliveryAddress: data.deliveryAddress,
          deliveryTime: data.deliveryTime,
          recipientName: data.recipientName,
          status: data.status?.toLowerCase() || 'unknown',
          userId: data.userId,
          order_id: doc.id,
          time: timestamp
        };
      });


      setSpecialOrdersList(specialOrders);

      // Handle notifications
      specialOrders.forEach(order => {
        if (order.status === 'pending' && !pendingOrderIds.has(order.orderId)) {
          audioInstance.play().catch(error => console.error('Audio error:', error));
          setPendingOrderIds(prev => new Set([...prev, order.orderId]));
        }
      });
    }, (error) => {
      console.error('Query error details:', error);
    });

    return () => unsubscribe();
  }, [audioInstance, pendingOrderIds, setSpecialOrdersList, dayOrders]);
  // Setup Orders Listener
  useEffect(() => {

    const ordersRef = collection(fsdb, 'orders');
    const today = dayOrders || new Date();
    const startTime = startOfDay(today);
    const endTime = endOfDay(today);

    const ordersQuery = query(
      ordersRef,
      where('time', '>=', startTime),
      where('time', '<=', endTime)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {

      if (snapshot.empty) {
        setOrdersList([]);
        return;
      }

      const orders = snapshot.docs.map(doc => ({
        ...doc.data(),
        order_id: doc.id,
        status: doc.data().status?.toLowerCase() || 'unknown'
      }));

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

  // Updated Drivers Listener
  useEffect(() => {
    const driversRef = ref(db, '/drivers');
    const onDriversChange = (snapshot) => {
      const driversArray = snapshot.exists()
        ? Object.entries(snapshot.val()).map(([key, value]) => ({ id: key, ...value }))
        : [];
      setDrivers(driversArray);
    };

    onValue(driversRef, onDriversChange);
    return () => off(driversRef, 'value', onDriversChange);
  }, [setDrivers]);

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