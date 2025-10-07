import { createContext, useState, useContext, useEffect } from 'react';

import api from '../config/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (username) => {
    localStorage.setItem('username', username);
    setIsLoggedIn(true);
  };
  const logout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
  };

  const checkAuth = async () => {
    try {
      await api.get('/api/dj-rest-auth/user/', { withCredentials: true });
      setIsLoggedIn(true);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          await api.post('/api/dj-rest-auth/token/refresh/', {}, { withCredentials: true });
          await api.get('/api/dj-rest-auth/user/', { withCredentials: true });
          setIsLoggedIn(true);
        } catch (refreshErr) {
          console.error('checkAuth refresh error:', refreshErr.response?.data);
          setIsLoggedIn(false);
        }
      } else {
        console.error('checkAuth error:', err.response?.data, err.response?.status);
        setIsLoggedIn(false);
      }
    }
  };
  useEffect(() => { checkAuth(); }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);