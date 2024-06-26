import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import db, { fsdb } from '../utils/firebaseconfig';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';

const StateContext = createContext();

const initialState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

export const ContextProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);
  const [screenSize, setScreenSize] = useState(undefined);
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restaurantsNum, setRestaurantsNum] = useState(0);
  const [restaurants, setRestaurants] = useState([]);
  const [scheduleDates, setScheduleDates] = useState([]);
  const [financials, setFinancials] = useState({ expense: 0, budget: 0 });
  const [cards, setCards] = useState([]);

  const handleClick = (clicked) => {
    if (clicked != -1) {
      setIsClicked({ ...initialState, [clicked]: true });
    } else {
      setIsClicked({ ...initialState })
    }

  };
  const onDriversChange = (snapshot) => {
    const driversArray = snapshot.exists()
      ? Object.entries(snapshot.val()).map(([key, value]) => ({
        id: key,
        ...value,
      }))
      : [];
    setDrivers(driversArray);
  };
  const getMenuItem = async (restaurantId, itemId) => {
    try {
      const itemRef = doc(fsdb, `restaurants/${restaurantId}/menu_items`, itemId);
      const itemSnapshot = await getDoc(itemRef);
      if (itemSnapshot.exists()) {
        console.log(itemSnapshot.data());
        return itemSnapshot.data();
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error('Error fetching menu item: ', error);
    }
  };
  const setMenuItem = async (restaurantId, itemId, itemData) => {
    try {
      const itemRef = doc(fsdb, `restaurants/${restaurantId}/menu_items`, itemId);
      await updateDoc(itemRef, itemData);
      console.log("Document successfully updated!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  const getOrders = async (id) => {
    try {
      const querySnapshot = await getDocs(collection(fsdb, `orders`));
      const ordersList = querySnapshot.docs.map(doc => ({
        ...doc.data(),
      }));
      setOrders(ordersList)
    } catch (error) {
      console.log(error)
    }
  }
  const uploadImage = async (file) => {
    const storage = getStorage();
    const storageReference = storageRef(storage, `images/${file.name}`);
    try {
      console.log('Uploading to:', storageReference.fullPath);
      const snapshot = await uploadBytes(storageReference, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('File available at:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error during file upload:', error);
      throw error;
    }
  };
  const getRestaurantsMenu = async (id) => {
    try {
      const querySnapshot = await getDocs(collection(fsdb, `restaurants/${id}/menu_items`));
      const menuList = querySnapshot.docs.map(doc => ({
        ...doc.data(),
      }));
      return menuList;
    } catch (error) {
      console.error('Error fetching Menu: ', error);
    }
  }
  const addAddonToMenuItem = async (restaurantId, menuItemId, addonData) => {
    try {
      const addonRef = collection(fsdb, `restaurants/${restaurantId}/menu_items/${menuItemId}/addons`);
      await addDoc(addonRef, addonData);
      console.log("Addon added successfully!");
    } catch (error) {
      console.error("Error adding addon: ", error);
    }
  };
  const getRestaurants = async () => {
    try {
      const querySnapshot = await getDocs(collection(fsdb, 'restaurants'));
      const restaurantList = querySnapshot.docs.map(doc => ({
        ...doc.data(),
      }));
      setRestaurants(restaurantList);
      setRestaurantsNum(restaurantList.length);
    } catch (error) {
      console.error('Error fetching restaurants: ', error);
    }
  };
  const updateOrderStatus = async (order) => {
    console.log('Updating order:', order);
    const orderRef = doc(fsdb, 'orders', order.order_id);

    try {
      await updateDoc(orderRef, {
        status: order.status,
        driver_id: order.driver_id
      });
      console.log("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order: ", error);
    }
    const updatedOrders = orders.map(o => {
      if (o.order_id === order.order_id) {
        return order;
      }
      return o;
    });
    setOrders(updatedOrders);
  };



  useEffect(() => {
    const driversRef = ref(db, '/drivers');
    onValue(driversRef, onDriversChange);

    getRestaurants();
    getOrders()
  }, []);

  return (
    <StateContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        isClicked,
        setIsClicked,
        handleClick,
        screenSize,
        setScreenSize,
        financials,
        cards,
        restaurantsNum,
        restaurants,
        scheduleDates,
        getRestaurantsMenu,
        getMenuItem,
        setMenuItem,
        addAddonToMenuItem,
        drivers,
        orders,
        updateOrderStatus,
        uploadImage
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
