import { createContext, useContext, useState, useEffect } from 'react';

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

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // Simulate API call - replace with actual authentication logic
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            user: {
              id: '1',
              username: credentials.username,
              email: credentials.email || 'user@example.com',
              name: credentials.username
            },
            token: 'mock-jwt-token'
          });
        }, 1000);
      });

      if (response.success) {
        const authData = {
          user: response.user,
          token: response.token,
          timestamp: Date.now()
        };
        
        localStorage.setItem('resuzo_auth', JSON.stringify(authData));
        setIsLoggedIn(true);
        setUser(response.user);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('resuzo_auth');
    setIsLoggedIn(false);
    setUser(null);
  };

  const signup = async (userData) => {
    try {
      setIsLoading(true);
      
      // Simulate API call - replace with actual signup logic
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            user: {
              id: '1',
              username: userData.username,
              email: userData.email,
              name: userData.username
            },
            token: 'mock-jwt-token'
          });
        }, 1000);
      });

      if (response.success) {
        const authData = {
          user: response.user,
          token: response.token,
          timestamp: Date.now()
        };
        
        localStorage.setItem('resuzo_auth', JSON.stringify(authData));
        setIsLoggedIn(true);
        setUser(response.user);
        return { success: true };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoggedIn,
    user,
    isLoading,
    login,
    logout,
    signup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
