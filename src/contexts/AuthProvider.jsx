import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../utils/firebaseconfig';
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idleTimeout, setIdleTimeout] = useState(null);

  const unSub = () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      resetIdleTimer(); // Reset the idle timer on user activity
    });

    return unsubscribe;
  };

  const logOut = () => {
    signOut(auth);
    setCurrentUser(null);
  };

  const resetIdleTimer = () => {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }
    // setIdleTimeout(setTimeout(logOut, 30 * 60 * 1000)); // Set a new idle timeout for 30 minutes
  };

  useEffect(() => {
    const cleanupFunction = unSub();

    const resetTimerOnActivity = () => {
      resetIdleTimer();
    };

    window.addEventListener('mousemove', resetTimerOnActivity);
    window.addEventListener('keydown', resetTimerOnActivity);

    return () => {
      cleanupFunction();
      window.removeEventListener('mousemove', resetTimerOnActivity);
      window.removeEventListener('keydown', resetTimerOnActivity);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, logOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
