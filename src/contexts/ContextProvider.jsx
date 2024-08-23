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
        setDrivers,
        drivers
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
