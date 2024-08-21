import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../utils/firebaseconfig';
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const unSub = () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  };

  const logOut = () => {
    signOut(auth);
    setCurrentUser(null);
  };


  useEffect(() => {
    const cleanupFunction = unSub();

    return () => {
      cleanupFunction();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, logOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
