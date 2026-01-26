import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    login: 'Login',
    signup: 'Sign Up',
    dashboard: 'Dashboard',
    upload: 'Upload Data',
    retailers: 'Retailers',
    invoices: 'Invoices',
    settings: 'Settings',
    logs: 'Logs',
    logout: 'Logout',
    totalRetailers: 'Total Retailers',
    totalOutstanding: 'Total Outstanding',
    totalPaid: 'Total Paid',
    totalUnpaid: 'Total Unpaid',
    totalOverdue: 'Total Overdue',
    sendNow: 'Send Now',
    sendAll: 'Send All',
    search: 'Search',
    email: 'Email',
    password: 'Password',
    businessName: 'Business Name',
    ownerName: 'Owner Name',
    whatsappNumber: 'WhatsApp Number',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account'
  },
  hi: {
    login: 'लॉग इन',
    signup: 'साइन अप',
    dashboard: 'डैशबोर्ड',
    upload: 'डेटा अपलोड',
    retailers: 'रिटेलर्स',
    invoices: 'चालान',
    settings: 'सेटिंग्स',
    logs: 'लॉग्स',
    logout: 'लॉग आउट',
    totalRetailers: 'कुल रिटेलर्स',
    totalOutstanding: 'कुल बकाया',
    totalPaid: 'कुल भुगतान',
    totalUnpaid: 'कुल अवैतनिक',
    totalOverdue: 'कुल अतिदेय',
    sendNow: 'अभी भेजें',
    sendAll: 'सभी भेजें',
    search: 'खोजें',
    email: 'ईमेल',
    password: 'पासवर्ड',
    businessName: 'व्यवसाय का नाम',
    ownerName: 'मालिक का नाम',
    whatsappNumber: 'व्हाट्सएप नंबर',
    welcomeBack: 'वापसी पर स्वागत है',
    createAccount: 'खाता बनाएँ'
  },
  gu: {
    login: 'લોગિન',
    signup: 'સાઇન અપ',
    dashboard: 'ડેશબોર્ડ',
    upload: 'ડેટા અપલોડ',
    retailers: 'રિટેલર્સ',
    invoices: 'ઇન્વોઇસ',
    settings: 'સેટિંગ્સ',
    logs: 'લોગ્સ',
    logout: 'લોગઆઉટ',
    totalRetailers: 'કુલ રિટેલર્સ',
    totalOutstanding: 'કુલ બાકી',
    totalPaid: 'કુલ ચૂકવણી',
    totalUnpaid: 'કુલ અવેતન',
    totalOverdue: 'કુલ મુદત પાર',
    sendNow: 'હમણાં મોકલો',
    sendAll: 'બધા મોકલો',
    search: 'શોધો',
    email: 'ઇમેઇલ',
    password: 'પાસવર્ડ',
    businessName: 'વ્યવસાયનું નામ',
    ownerName: 'માલિકનું નામ',
    whatsappNumber: 'વોટ્સએપ નંબર',
    welcomeBack: 'પાછા સ્વાગત છે',
    createAccount: 'ખાતું બનાવો'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
