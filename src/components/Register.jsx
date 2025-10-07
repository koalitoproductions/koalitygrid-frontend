import { useState } from 'react';
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
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isPasswordsMatch, setIsPasswordsMatch] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_@+.-]{4,30}$/;
    return usernameRegex.test(username);
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value.trim();
    setUsername(newUsername);
    setIsUsernameValid(validateUsername(newUsername));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value.trim();
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
  };

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    return password.length >= minLength && hasLetter && hasDigit;
  };

  // Handle input changes with validation
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value.trim();
    setPassword(newPassword);
    setIsPasswordValid(validatePassword(newPassword));
    setIsPasswordsMatch(newPassword === confirmPassword && validatePassword(newPassword));
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value.trim();
    setConfirmPassword(newConfirmPassword);
    setIsPasswordsMatch(password === newConfirmPassword && validatePassword(password));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!isPasswordsMatch) {
      setError('Lösenorden matchar inte eller uppfyller inte kraven.');
      return;
    }
    if (!isEmailValid) {
      setError('Du har inte angett en giltig e-postadress.');
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
          <label className="block text-[#e0e0e0] mb-2" htmlFor="username">Användarnamn</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            className={`w-full p-2 bg-[#383838] text-[#e0e0e0] rounded ${!isUsernameValid && username ? 'border-red-500' : ''}`}
            aria-label="Användarnamn"
          />
          {!isUsernameValid && username && (
            <p className="text-red-500 text-sm mt-1">
              Användarnamnet måste vara 4-30 tecken och får endast innehålla bokstäver, siffror, _, @, +, . eller -.
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-[#e0e0e0] mb-2" htmlFor="email">E-post</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`w-full p-2 bg-[#383838] text-[#e0e0e0] rounded ${!isEmailValid && email ? 'border-red-500' : ''}`}
            aria-label="E-post"
          />
          {!isEmailValid && email && (
            <p className="text-red-500 text-sm mt-1">Ogiltig e-postadress.</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-[#e0e0e0] mb-2" htmlFor="password">Lösenord</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className={`w-full p-2 bg-[#383838] text-[#e0e0e0] rounded ${!isPasswordValid && password ? 'border-red-500' : ''}`}
            aria-label="Lösenord"
          />
          {!isPasswordValid && password && (
            <p className="text-red-500 text-sm mt-1">
              Lösenordet måste vara minst 8 tecken långt och innehålla minst en bokstav och en siffra.
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-[#e0e0e0] mb-2" htmlFor="confirm-password">Bekräfta lösenord</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={`w-full p-2 bg-[#383838] text-[#e0e0e0] rounded ${!isPasswordsMatch && confirmPassword ? 'border-red-500' : ''}`}
            aria-label="Bekräfta Lösenord"
          />
          {!isPasswordsMatch && confirmPassword && (
            <p className="text-red-500 text-sm mt-1">Lösenorden matchar inte.</p>
          )}
        </div>
        <button 
          type="submit" 
          disabled={!isPasswordsMatch || !username || !email || !isEmailValid || !isUsernameValid}
          className="w-full bg-[#fa7532] text-[#1c1c1c] py-2 rounded hover:bg-[#fb8c4f] transition disabled:bg-gray-500 disabled:cursor-not-allowed hover:cursor-pointer"
        >
          Registrera
        </button>
      </form>
    </div>
  );
}

export default Register;