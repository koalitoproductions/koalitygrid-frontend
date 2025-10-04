// src/hooks/useAuth.js
import { useEffect } from 'react';
import axios from 'axios';
import api from '../config/axios';

export function useAuth() {
  useEffect(() => {
    const refreshToken = async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await api.post('auth/token/refresh/', {
            refresh: refreshToken,
          });
          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        } catch (err) {
          console.error('Token refresh failed:', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    };

    const interval = setInterval(refreshToken, 14 * 60 * 1000); // Refresh every 14 minutes
    return () => clearInterval(interval);
  }, []);
}