import React, { createContext, useContext, useState, useCallback } from "react";

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
  const [dayOrders, setDayOrders] = useState("");
  const [scheduleDates, setScheduleDates] = useState([]);
  const [financials, setFinancials] = useState({ expense: 0, budget: 0 });
  const [cards, setCards] = useState([]);
  const [biteDrivers, setBiteDrivers] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const handleClick = useCallback((clicked) => {
    setIsClicked((prev) =>
      clicked !== -1
        ? { ...initialState, [clicked]: true }
        : { ...initialState }
    );
  }, []);

  const handleSelectDayOrders = useCallback((date) => {
    setDayOrders(date);
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
        scheduleDates,
        setBiteDrivers,
        biteDrivers,
        ordersList,
        setOrdersList,
        dayOrders,
        setDayOrders,
        drivers,
        setDrivers,
        handleSelectDayOrders,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within a ContextProvider');
  }
  return context;
};
