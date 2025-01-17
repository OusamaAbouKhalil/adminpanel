import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import PropTypes from 'prop-types';

const StateContext = createContext();

const initialState = {
  ui: {
    chat: false,
    cart: false,
    userProfile: false,
    notification: false,
    activeMenu: true,
    screenSize: window.innerWidth,
  },
  app: {
    ordersList: [],
    dayOrders: "",
    scheduleDates: [],
    financials: { expense: 0, budget: 0 },
    cards: [],
    biteDrivers: [],
    drivers: [],
  }
};

export const ContextProvider = ({ children }) => {
  const [uiState, setUiState] = useState(initialState.ui);
  const [appState, setAppState] = useState(initialState.app);
  const [isLoading, setIsLoading] = useState(false);

  const setActiveMenu = useCallback((value) => {
    setUiState(prev => ({ ...prev, activeMenu: value }));
  }, []);

  const setScreenSize = useCallback((size) => {
    setUiState(prev => ({ ...prev, screenSize: size }));
  }, []);

  const handleClick = useCallback((clicked) => {
    setUiState(prev => ({
      ...prev,
      chat: false,
      cart: false,
      userProfile: false,
      notification: false,
      [clicked]: true
    }));
  }, []);

  // App State Handlers
  const setOrdersList = useCallback((orders) => {
    setAppState(prev => ({ ...prev, ordersList: orders }));
  }, []);

  const setBiteDrivers = useCallback((drivers) => {
    setAppState(prev => ({ ...prev, biteDrivers: drivers }));
  }, []);

  const setDrivers = useCallback((drivers) => {
    setAppState(prev => ({ ...prev, drivers: drivers }));
  }, []);

  const setDayOrders = useCallback((date) => {
    setAppState(prev => ({ ...prev, dayOrders: date }));
  }, []);

  const contextValue = useMemo(() => ({
    // UI State
    activeMenu: uiState.activeMenu,
    setActiveMenu,
    screenSize: uiState.screenSize,
    setScreenSize,
    isClicked: {
      chat: uiState.chat,
      cart: uiState.cart,
      userProfile: uiState.userProfile,
      notification: uiState.notification
    },
    handleClick,
    isLoading,
    setIsLoading,

    // App State
    ...appState,
    setOrdersList,
    setBiteDrivers,
    setDrivers,
    setDayOrders,
  }), [
    uiState,
    appState,
    isLoading,
    setActiveMenu,
    setScreenSize,
    handleClick,
    setOrdersList,
    setBiteDrivers,
    setDrivers,
    setDayOrders
  ]);

  return (
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
};

ContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within a ContextProvider');
  }
  return context;
};

export default ContextProvider;