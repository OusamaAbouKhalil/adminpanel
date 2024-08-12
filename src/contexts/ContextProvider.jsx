import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { getDatabase, ref, get, onValue } from "firebase/database";

import db, { fsdb, functions, httpsCallable } from "../utils/firebaseconfig";
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

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
  const [usersList, setUsersList] = useState({});

  const handleClick = (clicked) => {
    if (clicked != -1) {
      setIsClicked({ ...initialState, [clicked]: true });
    } else {
      setIsClicked({ ...initialState });
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
      const itemRef = doc(
        fsdb,
        `restaurants/${restaurantId}/menu_items`,
        itemId
      );
      const itemSnapshot = await getDoc(itemRef);
      if (itemSnapshot.exists()) {
        console.log(itemSnapshot.data());
        return itemSnapshot.data();
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching menu item: ", error);
    }
  };
  const setMenuItem = async (restaurantId, itemId, itemData) => {
    try {
      const itemRef = doc(
        fsdb,
        `restaurants/${restaurantId}/menu_items`,
        itemId
      );
      await updateDoc(itemRef, itemData);
      console.log("Document successfully updated!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  // const getOrders = async (id) => {
  //   try {
  //     const querySnapshot = await getDocs(collection(fsdb, 'orders'));
  //     const ordersList = querySnapshot.docs.map((doc) => ({
  //       ...doc.data()
  //     }));
  //     setOrders(ordersList);
  //     console.log(ordersList);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const uploadImage = async (file) => {
    const storage = getStorage();
    const storageReference = storageRef(storage, `images/${file.name}`);
    try {
      console.log("Uploading to:", storageReference.fullPath);
      const snapshot = await uploadBytes(storageReference, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("File available at:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error during file upload:", error);
      throw error;
    }
  };
  const getRestaurantsMenu = async (id) => {
    try {
      const querySnapshot = await getDocs(
        collection(fsdb, `restaurants/${id}/menu_items`)
      );
      const menuList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
      }));
      return menuList;
    } catch (error) {
      console.error("Error fetching Menu: ", error);
    }
  };
  const addAddonToMenuItem = async (restaurantId, menuItemId, addonData) => {
    try {
      const addonRef = collection(
        fsdb,
        `restaurants/${restaurantId}/menu_items/${menuItemId}/addons`
      );
      await addDoc(addonRef, addonData);
      console.log("Addon added successfully!");
    } catch (error) {
      console.error("Error adding addon: ", error);
    }
  };
  const getRestaurants = async () => {
    try {
      const querySnapshot = await getDocs(collection(fsdb, "restaurants"));
      const restaurantList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
      }));
      for (let i = 0; i < restaurantList.length; i++) {
        const location = await getLocationByCoordinates(
          restaurantList[i].location._lat,
          restaurantList[i].location._long
        );
        restaurantList[i].location = location;
      }
      // console.log(restaurantList);
      setRestaurants(restaurantList);
      setRestaurantsNum(restaurantList.length);
    } catch (error) {
      console.error("Error fetching restaurants: ", error);
    }
  };

  const getOrders = () => {
    try {
      const ordersCollection = collection(fsdb, "orders");

      let itemsListeners = {};

      const unsubscribeOrders = onSnapshot(
        ordersCollection,
        (ordersSnapshot) => {
          const ordersList = ordersSnapshot.docs.map((doc) => {
            const order = doc.data();
            order.id = doc.id;

            if (!itemsListeners[doc.id]) {
              itemsListeners[doc.id] = onSnapshot(
                collection(fsdb, "orders", doc.id, "items"),
                (itemsSnapshot) => {
                  const itemsList = itemsSnapshot.docs.map((itemDoc) => ({
                    ...itemDoc.data(),
                    id: itemDoc.id,
                  }));
                  setOrders((prevOrders) =>
                    prevOrders.map((o) =>
                      o.id === doc.id ? { ...o, items: itemsList } : o
                    )
                  );
                }
              );
            }

            return { ...order, items: [] };
          });

          setOrders(ordersList);
        }
      );

      // Cleanup function to unsubscribe from snapshots
      return () => {
        unsubscribeOrders();
        Object.values(itemsListeners).forEach((unsubscribe) => unsubscribe());
      };
    } catch (error) {
      console.log(error);
    }
  };

  const updateOrderStatus = async (order) => {
    console.log("Updating order:", order);
    const orderRef = doc(fsdb, "orders", order.order_id);

    try {
      await updateDoc(orderRef, {
        status: order.status,
        driver_id: order.driver_id,
      });
      // console.log("Order updated successfully!");

      const updatedOrders = orders.map((o) => {
        if (o.order_id === order.order_id) {
          return order;
        }
        return o;
      });
      setOrders(updatedOrders);

      // Fetch user data based on user_id from the Realtime Database
      const db = getDatabase();
      const userRef = ref(db, `users/${order.user_id}`);
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        if (order.status === "accepted" && userData.firebaseMessagingToken) {
          // console.log("Sending notification to user");
          await sendNotification(
            userData.firebaseMessagingToken,
            "Order Accepted",
            "Your order has been accepted."
          );
        }
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error updating order: ", error);
    }
  };

  const sendNotification = async (token, title, body) => {
    const sendNotificationFunction = httpsCallable(
      functions,
      "sendNotification"
    );
    try {
      const result = await sendNotificationFunction({ token, title, body });
      console.log(result.data);
      if (result.data.success) {
        console.log("Notification sent successfully");
      } else {
        console.log("Failed to send notification:", result.data.error);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const getLocationByCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`
      );
      const data = await response.json();
      // console.log(data);
      return (
        data["features"][0]["properties"]["city"] +
        ", " +
        data["features"][0]["properties"]["country"]
      );
    } catch (error) {
      console.error("Error fetching location: ", error);
    }
  };

  const getRestaurantById = async (id) => {
    try {
      const restaurantRef = doc(fsdb, "restaurants", id);
      const restaurantSnapshot = await getDoc(restaurantRef);
      if (restaurantSnapshot.exists()) {
        console.log(restaurantSnapshot.data());
        return restaurantSnapshot.data();
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching restaurant: ", error);
    }
  };

  useEffect(() => {
    const driversRef = ref(db, "/swiftBitesDrivers");
    onValue(driversRef, onDriversChange);

    getRestaurants();
    getOrders();
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
        uploadImage,
        getLocationByCoordinates,
        getRestaurantById,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
