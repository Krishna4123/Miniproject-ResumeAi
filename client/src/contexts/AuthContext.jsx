import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

  // Check for existing login state on component mount
  useEffect(() => {
    const checkAuthState = () => {
      try {
        // Check localStorage for existing auth state
        const savedAuth = localStorage.getItem('resuzo_auth');
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          setIsLoggedIn(true);
          setUser(authData.user);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  // Set up axios interceptor for auth token
  useEffect(() => {
    const token = localStorage.getItem('resuzo_auth');
    if (token) {
      const authData = JSON.parse(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
    }
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: credentials.email || credentials.username,
        password: credentials.password
      });

      if (response.data.token) {
        const authData = {
          user: response.data.user,
          token: response.data.token,
          timestamp: Date.now()
        };
        
        localStorage.setItem('resuzo_auth', JSON.stringify(authData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setIsLoggedIn(true);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: userData.username,
        email: userData.email,
        password: userData.password
      });

      if (response.data.token) {
        const authData = {
          user: response.data.user,
          token: response.data.token,
          timestamp: Date.now()
        };
        
        localStorage.setItem('resuzo_auth', JSON.stringify(authData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setIsLoggedIn(true);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (googleToken) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        token: googleToken
      });

      if (response.data.token) {
        const authData = {
          user: response.data.user,
          token: response.data.token,
          timestamp: Date.now()
        };
        
        localStorage.setItem('resuzo_auth', JSON.stringify(authData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setIsLoggedIn(true);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('resuzo_auth');
    delete axios.defaults.headers.common['Authorization'];
    setIsLoggedIn(false);
    setUser(null);
  };

  const value = {
    isLoggedIn,
    user,
    isLoading,
    login,
    logout,
    signup,
    googleLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

