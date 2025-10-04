import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clear tokens and update auth state
    navigate('/login'); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center p-4 text-[#e0e0e0] hover:bg-[#383838] hover:text-white transition rounded mb-2 text-left w-full hover:cursor-pointer"
    >
      <i className="fas fa-sign-out-alt text-[#fa7532] mr-4 text-xl"></i>
      Logga ut
    </button>
  );
}

export default Logout;