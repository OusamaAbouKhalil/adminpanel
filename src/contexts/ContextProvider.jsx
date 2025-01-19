import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

const StateContext = createContext(null);

const initialUIState = {
  activeMenu: true,
  screenSize: window.innerWidth,
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

const initialAppState = {
  ordersList: [],
  specialOrders: [],
  dayOrders: "",
  scheduleDates: [],
  financials: { expense: 0, budget: 0 },
  cards: [],
  biteDrivers: [],
  drivers: [],
};

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-boundary">Something went wrong</div>;
    }
    return this.props.children;
  }
}

export const ContextProvider = ({ children }) => {
  const [ui, setUI] = useState(initialUIState);
  const [app, setApp] = useState(initialAppState);
  const [loading, setLoading] = useState(false);

  const updateUI = useCallback((updates) => {
    setUI(prev => ({ ...prev, ...updates }));
  }, []);

  const updateApp = useCallback((updates) => {
    setApp(prev => ({ ...prev, ...updates }));
  }, []);

  const setActiveMenu = useCallback((value) => {
    updateUI({ activeMenu: Boolean(value) });
  }, [updateUI]);

  const setScreenSize = useCallback((size) => {
    updateUI({ screenSize: Number(size) });
  }, [updateUI]);

  const handleClick = useCallback((clicked) => {
    updateUI({
      chat: false,
      cart: false,
      userProfile: false,
      notification: false,
      [clicked]: true
    });
  }, [updateUI]);

  const setSpecialOrdersList = useCallback((orders) => {
    const validOrders = Array.isArray(orders) ? orders : [];
    updateApp({ specialOrders: validOrders });
  }, [updateApp]);

  const setOrdersList = useCallback((orders) => {
    const validOrders = Array.isArray(orders) ? orders : [];
    updateApp({ ordersList: validOrders });
  }, [updateApp]);

  const setBiteDrivers = useCallback((drivers) => {
    const validDrivers = Array.isArray(drivers) ? drivers : [];
    updateApp({ biteDrivers: validDrivers });
  }, [updateApp]);

  const setDrivers = useCallback((drivers) => {
    const validDrivers = Array.isArray(drivers) ? drivers : [];
    updateApp({ drivers: validDrivers });
  }, [updateApp]);

  const setDayOrders = useCallback((date) => {
    updateApp({ dayOrders: String(date) });
  }, [updateApp]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize(width);
      setActiveMenu(width > 900);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [setScreenSize, setActiveMenu]);

  const value = useMemo(() => ({
    // UI State
    activeMenu: ui.activeMenu,
    screenSize: ui.screenSize,
    isClicked: {
      chat: ui.chat,
      cart: ui.cart,
      userProfile: ui.userProfile,
      notification: ui.notification
    },
    // UI Actions
    setActiveMenu,
    setScreenSize,
    handleClick,
    // Loading State
    loading,
    setLoading,
    // App State
    ...app,
    specialOrders: Array.isArray(app.specialOrders) ? app.specialOrders : [],
    ordersList: Array.isArray(app.ordersList) ? app.ordersList : [],
    biteDrivers: Array.isArray(app.biteDrivers) ? app.biteDrivers : [],
    drivers: Array.isArray(app.drivers) ? app.drivers : [],
    // App Actions
    setSpecialOrdersList,
    setOrdersList,
    setBiteDrivers,
    setDrivers,
    setDayOrders,
  }), [
    ui,
    app,
    loading,
    setActiveMenu,
    setScreenSize,
    handleClick,
    setOrdersList,
    setBiteDrivers,
    setDrivers,
    setDayOrders,
    app.specialOrders,
    setSpecialOrdersList
  ]);

  return (
    <ErrorBoundary>
      <StateContext.Provider value={value}>
        {children}
      </StateContext.Provider>
    </ErrorBoundary>
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