// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

// src/hooks/useAuth.js - Update the login function
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('finance-tracker-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simple validation - in real app, this would be an API call
    if (!email || !password) {
      throw new Error('Please enter both email and password');
    }
    
    // Accept any password for demo
    const user = { 
      email, 
      name: email.split('@')[0],
      id: Date.now().toString()
    };
    
    localStorage.setItem('finance-tracker-user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const signup = async (email, password, name) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!email || !password || !name) {
      throw new Error('Please fill all fields');
    }
    
    const user = { email, name, id: Date.now().toString() };
    localStorage.setItem('finance-tracker-user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('finance-tracker-user');
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
};

export default useAuth;