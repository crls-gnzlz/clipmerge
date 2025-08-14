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
        
        console.log('🔐 AuthContext: Checking auth status...');
        console.log('🔐 AuthContext: Token in localStorage:', token ? 'Presente' : 'Ausente');
        console.log('🔐 AuthContext: User in localStorage:', storedUser ? 'Presente' : 'Ausente');
        
        if (token && storedUser) {
          // Set token in apiService first
          apiService.setToken(token);
          console.log('🔐 AuthContext: Token set in apiService from localStorage');
          
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
            console.log('🔐 AuthContext: User restored from localStorage:', userData);
            console.log('🔐 AuthContext: Final verification - apiService.token:', apiService.token ? 'Presente' : 'Ausente');
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
            // Clear invalid data
            apiService.clearAuth();
            try {
              localStorage.removeItem('user');
              localStorage.removeItem('authToken');
            } catch (localStorageError) {
              console.warn('Could not access localStorage:', localStorageError);
            }
          }
        } else {
          console.log('🔐 AuthContext: No stored auth data found');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid data
        apiService.clearAuth();
        try {
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        } catch (localStorageError) {
          console.warn('Could not access localStorage:', localStorageError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 AuthContext: Starting login process...');
      console.log('🔐 AuthContext: Credentials received:', { 
        username: credentials.username, 
        hasPassword: !!credentials.password 
      });
      
      const response = await apiService.login(credentials);
      console.log('🔐 AuthContext: API response received:', response);
      
      if (response.success) {
        const { user, token } = response.data;
        console.log('🔐 AuthContext: Login successful, storing token and user data');
        console.log('🔐 AuthContext: Token received:', token ? 'Presente' : 'Ausente');
        console.log('🔐 AuthContext: User data received:', user);
        
        // Store token and user data
        apiService.setToken(token);
        console.log('🔐 AuthContext: Token set in apiService');
        
        try {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('authToken', token);
          console.log('🔐 AuthContext: Data stored in localStorage');
          
          // Verify data was actually stored
          const storedUser = localStorage.getItem('user');
          const storedToken = localStorage.getItem('authToken');
          console.log('🔐 AuthContext: Verification - storedUser:', storedUser ? 'Presente' : 'Ausente');
          console.log('🔐 AuthContext: Verification - storedToken:', storedToken ? 'Presente' : 'Ausente');
          
        } catch (localStorageError) {
          console.warn('Could not access localStorage:', localStorageError);
        }
        
        // Update state and wait for it to complete
        setUser(user);
        setIsAuthenticated(true);
        
        // Verify token is set correctly
        console.log('🔐 AuthContext: Final verification - apiService.token:', apiService.token ? 'Presente' : 'Ausente');
        
        // Return success with user data
        return { success: true, user: user };
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
      console.log('📝 AuthContext: Starting registration process...');
      console.log('📝 AuthContext: User data received:', { 
        username: userData.username, 
        email: userData.email,
        hasPassword: !!userData.password,
        displayName: userData.displayName
      });
      
      const response = await apiService.register(userData);
      console.log('📝 AuthContext: API response received:', response);
      
      if (response.success) {
        const { user, token } = response.data;
        console.log('📝 AuthContext: Registration successful, storing token and user data');
        
        // Store token and user data
        apiService.setToken(token);
        try {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('authToken', token);
          console.log('📝 AuthContext: Data stored in localStorage');
        } catch (localStorageError) {
          console.warn('Could not access localStorage:', localStorageError);
        }
        
        setUser(user);
        setIsAuthenticated(true);
        
        console.log('📝 AuthContext: Registration complete, user authenticated');
        return { success: true, user: user };
      } else {
        console.log('📝 AuthContext: Registration failed with response:', response);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('📝 AuthContext: Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log('🔐 AuthContext: Starting logout process...');
      
      // Call logout endpoint if user is authenticated
      if (isAuthenticated) {
        try {
          await apiService.logout();
          console.log('🔐 AuthContext: Backend logout successful');
        } catch (error) {
          console.warn('🔐 AuthContext: Backend logout failed, continuing with local cleanup:', error.message);
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state regardless of API call success
      console.log('🔐 AuthContext: Clearing local authentication data...');
      
      // Clear apiService
      apiService.clearAuth();
      
      // Clear localStorage completely
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        console.log('🔐 AuthContext: localStorage cleared');
      } catch (localStorageError) {
        console.warn('Could not access localStorage:', localStorageError);
      }
      
      // Clear React state
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('🔐 AuthContext: Logout complete - all data cleared');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    try {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (localStorageError) {
      console.warn('Could not access localStorage:', localStorageError);
    }
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

  // Debug log for context value changes
  useEffect(() => {
    console.log('🔐 AuthContext: Context value updated:', {
      user: user ? { username: user.username, email: user.email } : null,
      isAuthenticated,
      isLoading
    });
  }, [user, isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
