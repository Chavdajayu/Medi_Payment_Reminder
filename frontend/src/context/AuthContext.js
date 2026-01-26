import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../lib/storage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(storage.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const storedUser = storage.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    // In local mode, we just check if user exists or create a session
    // For simplicity, we'll allow any login if we have a user stored, or just save this user
    let storedUser = storage.getUser();
    
    if (!storedUser) {
      // Auto-signup if no user exists locally
      storedUser = { email, business_name: 'Local User', id: 'local-user' };
      storage.saveUser(storedUser);
    } else if (storedUser.email !== email) {
      // Update user if email changed
      storedUser = { ...storedUser, email };
      storage.saveUser(storedUser);
    }
    
    setToken(storage.getToken());
    setUser(storedUser);
    return { access_token: storage.getToken() };
  };

  const signup = async (userData) => {
    const newUser = { ...userData, id: 'local-user' };
    storage.saveUser(newUser);
    setToken(storage.getToken());
    setUser(newUser);
    return { access_token: storage.getToken() };
  };

  const logout = () => {
    storage.removeUser();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
