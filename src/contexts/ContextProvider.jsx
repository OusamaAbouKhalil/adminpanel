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
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";

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
  const [scheduleDates, setScheduleDates] = useState([]);
  const [financials, setFinancials] = useState({ expense: 0, budget: 0 });
  const [cards, setCards] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const handleClick = (clicked) => {
    if (clicked != -1) {
      setIsClicked({ ...initialState, [clicked]: true });
    } else {
      setIsClicked({ ...initialState });
    }
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

  const uploadImage = async (file) => {
    const storage = getStorage();
    const filename = Date.now() + "." + file.name.split('.').pop();
    const storageReference = storageRef(storage, `images/${filename}`);
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
        scheduleDates,
        getRestaurantsMenu,
        getMenuItem,
        setMenuItem,
        addAddonToMenuItem,
        uploadImage,
        setDrivers,
        drivers
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
