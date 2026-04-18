import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    // Safety timeout - if Firebase fails, unblock the app after 3s
    const safetyTimer = setTimeout(() => setLoading(false), 3000);

    try {
      unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          clearTimeout(safetyTimer);
          setCurrentUser(firebaseUser);
          if (firebaseUser) {
            try {
              const res = await api.post('/auth/sync');
              setDbUser(res.data.user);
            } catch (err) {
              console.warn('Backend sync failed (expected if backend not running):', err.message);
              setDbUser(null);
            }
          } else {
            setDbUser(null);
          }
          setLoading(false);
        },
        (error) => {
          clearTimeout(safetyTimer);
          console.warn('Firebase auth error (configure Firebase keys):', error.message);
          setLoading(false);
        }
      );
    } catch (err) {
      clearTimeout(safetyTimer);
      console.warn('Firebase setup error:', err.message);
      setLoading(false);
    }
    return () => { clearTimeout(safetyTimer); unsubscribe(); };
  }, []);

  const isAdmin = dbUser?.role === 'admin';
  const isWorker = dbUser?.role === 'worker';

  return (
    <AuthContext.Provider value={{ currentUser, dbUser, isAdmin, isWorker, loading, setDbUser }}>
      {children}
    </AuthContext.Provider>
  );
};
