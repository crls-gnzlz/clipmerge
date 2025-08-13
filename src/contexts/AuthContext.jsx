import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../lib/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          apiService.setToken(token);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid data
        apiService.clearAuth();
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 AuthContext: Starting login process...');
      const response = await apiService.login(credentials);
      console.log('🔐 AuthContext: API response received:', response);
      
      if (response.success) {
        const { user, token } = response.data;
        console.log('🔐 AuthContext: Login successful, storing token and user data');
        
        // Store token and user data
        apiService.setToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        console.log('🔐 AuthContext: Login failed with response:', response);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('🔐 AuthContext: Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token and user data
        apiService.setToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if user is authenticated
      if (isAuthenticated) {
        await apiService.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state regardless of API call success
      apiService.clearAuth();
      localStorage.removeItem('user');
      localStorage.removeItem('authToken'); // Ensure authToken is also removed
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
