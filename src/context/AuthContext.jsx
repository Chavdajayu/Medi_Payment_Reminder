import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import axios from 'axios';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (userData) => {
    const { email, password, business_name, owner_name, whatsapp_number } = userData;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Direct Firestore write from Frontend (Authenticated)
      // This ensures data is saved even if backend sync fails due to permission issues
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        businessName: business_name,
        ownerName: owner_name,
        whatsappNumber: whatsapp_number,
        createdAt: new Date().toISOString()
      }, { merge: true });

      // Sync with backend (Optional/Backup)
      try {
        await axios.post('/api/auth/sync-user', {
          uid: user.uid,
          email: user.email,
          businessName: business_name,
          ownerName: owner_name,
          whatsappNumber: whatsapp_number
        });
      } catch (apiError) {
        console.warn("Backend sync failed, but frontend write succeeded:", apiError);
        // Do not throw, as the primary goal (saving data) was achieved via frontend
      }
      
      return user;
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
