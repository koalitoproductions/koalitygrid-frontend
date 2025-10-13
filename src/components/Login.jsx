import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

import api from '../config/axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();

  // Redirect to start page if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/berakningar'); // Redirect to the start page
    }
  }, [isLoggedIn, navigate]); // Dependencies to re-run on state change

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post(
        'api/dj-rest-auth/login/', 
        { username, password, }, 
        { withCredentials: true }
      );
      if (response.status === 200) {
        login(username);
        navigate('/berakningar');
      }
    } catch (err) {
      setError('Inloggning misslyckades. Säker på att du använde rätt uppgifter?');
    } finally {
      setLoading(false);
    }
  };

  // Only render the form if not logged in
  if (isLoggedIn) {
    return null; // Or a loading spinner/message if needed
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1c1c1c]">
      <form onSubmit={handleLogin} className="bg-[#282828] p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl text-[#e0e0e0] mb-4">Logga in</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block text-[#e0e0e0] mb-2">Användarnamn</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 bg-[#383838] text-[#e0e0e0] rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-[#e0e0e0] mb-2">Lösenord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-[#383838] text-[#e0e0e0] rounded"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#fa7532] text-[#1c1c1c] py-2 rounded hover:bg-[#fb8c4f] transition disabled:bg-gray-500 disabled:cursor-not-allowed hover:cursor-pointer"
        >
          {loading ? 'Loggar in...' : 'Logga in'} {/* Conditional text */}
        </button>
        <p className="text-[#e0e0e0] mt-4 text-center">
          Inget konto?{' '}
          <Link to="/register" className="text-[#fa7532] hover:underline">
            Registrera dig här
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;