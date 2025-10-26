import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

import api from '../config/axios';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

const handleLogout = async () => {
  try {
    await api.post('api/dj-rest-auth/logout/', {}, { withCredentials: true });
    logout();
    navigate('/login');
  } catch (err) {
    console.error('Logout error:', err);
  }
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