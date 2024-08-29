import React, { createContext, useContext, useState } from "react";

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
  const [ordersList, setOrdersList] = useState([]);
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
        setDrivers,
        drivers,
        ordersList,
        setOrdersList,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
