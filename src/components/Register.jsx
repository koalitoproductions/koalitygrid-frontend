import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Validation state
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isPasswordsMatch, setIsPasswordsMatch] = useState(false);

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    return password.length >= minLength && hasLetter && hasDigit;
  };

  // Handle input changes with validation
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setIsPasswordValid(validatePassword(newPassword));
    setIsPasswordsMatch(newPassword === confirmPassword && validatePassword(newPassword));
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setIsPasswordsMatch(password === newConfirmPassword && validatePassword(password));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!isPasswordsMatch) {
      setError('Lösenorden matchar inte eller uppfyller inte kraven');
      return;
    }
    try {
      const response = await api.post('auth/register/', {
        username,
        email,
        password,
        confirm_password: confirmPassword,
      });
      console.log('Register response:', response.data);
      if (response.status === 201) {
        navigate('/login'); // Redirect to login after successful registration
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registrering misslyckades');
      console.error('Register error:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1c1c1c]">
      <form onSubmit={handleRegister} className="bg-[#282828] p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl text-[#e0e0e0] mb-4">Registrera</h2>
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
          <label className="block text-[#e0e0e0] mb-2">E-post</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 bg-[#383838] text-[#e0e0e0] rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-[#e0e0e0] mb-2">Lösenord</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className={`w-full p-2 bg-[#383838] text-[#e0e0e0] rounded ${!isPasswordValid && password ? 'border-red-500' : ''}`}
          />
          {!isPasswordValid && password && (
            <p className="text-red-500 text-sm mt-1">
              Lösenordet måste vara minst 8 tecken långt och innehålla minst en bokstav och en siffra.
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-[#e0e0e0] mb-2">Bekräfta lösenord</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={`w-full p-2 bg-[#383838] text-[#e0e0e0] rounded ${!isPasswordsMatch && confirmPassword ? 'border-red-500' : ''}`}
          />
          {!isPasswordsMatch && confirmPassword && (
            <p className="text-red-500 text-sm mt-1">Lösenorden matchar inte.</p>
          )}
        </div>
        <button 
          type="submit" 
          disabled={!isPasswordsMatch || !username || !email}
          className="w-full bg-[#fa7532] text-[#1c1c1c] py-2 rounded hover:bg-[#fb8c4f] transition disabled:bg-gray-500 disabled:cursor-not-allowed hover:cursor-pointer"
        >
          Registrera
        </button>
      </form>
    </div>
  );
}

export default Register;