import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from '../config/axios';

function EditAccount() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout, isLoggedIn } = useAuth();

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
  const handleNewPasswordChange = (e) => {
    const newPw = e.target.value;
    setNewPassword(newPw);
    setIsPasswordValid(validatePassword(newPw));
    setIsPasswordsMatch(newPw === confirmNewPassword && validatePassword(newPw));
  };

  const handleConfirmNewPasswordChange = (e) => {
    const newConfirmPw = e.target.value;
    setConfirmNewPassword(newConfirmPw);
    setIsPasswordsMatch(newPassword === newConfirmPw && validatePassword(newPassword));
  };

// Fetch current profile photo on mount
  useEffect(() => {
    if (isLoggedIn) {
      api.get('auth/user-profile/') // Adjust endpoint if needed
        .then(response => {
          const photoUrl = response.data.profile_photo;
          setPreviewUrl(photoUrl);
        })
        .catch(err => {
          console.error('Error fetching profile photo:', err);
          setPreviewUrl('/media/profile_photos/default.png');
        });
    }
  }, [isLoggedIn]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      console.log('Password change response:', response.data);
      if (response.status === 200) {
        // Optionally log out to force re-authentication with new password
        logout();
        navigate('/login'); // Redirect to login after logout
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Kunde inte ändra lösenordet');
      console.error('Password change error:', err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file)); // Preview the uploaded image
      const formData = new FormData();
      formData.append('profile_photo', file);
      try {
        const response = await api.post('auth/upload-profile-photo/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Photo upload response:', response.data);
        setPreviewUrl(response.data.photo_url);
      } catch (err) {
        setError('Kunde inte ladda upp profilbilden');
        console.error('Photo upload error:', err.response ? err.response.data : err.message);
      }
    }
  };

  const handlePhotoDelete = async () => {
    try {
      const response = await api.delete('auth/upload-profile-photo/');
      console.log('Photo delete response:', response.data);
      setPreviewUrl(response.data.photo_url); // Revert to default
    } catch (err) {
      setError('Kunde inte ta bort profilbilden');
      console.error('Photo delete error:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1c1c1c]">
      <form onSubmit={handlePasswordChange} className="bg-[#282828] p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl text-[#e0e0e0] mb-4">Mitt konto</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-4 text-center">
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto object-cover border-2 border-[#fa7532]"
            />
            {previewUrl !== 'http://localhost:8000/media/profile_photos/default.png' && (
              <button
                type="button"
                onClick={handlePhotoDelete}
                className="absolute top-0 right-0 mt-[-10px] mr-[-10px] w-6 h-6 rounded-full bg-[#fa7532] text-[#1c1c1c] flex items-center justify-center hover:bg-[#fb8c4f] transition hover:cursor-pointer"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <label className="block mt-2 text-[#e0e0e0] cursor-pointer bg-[#fa7532] py-1 px-3 rounded hover:bg-[#fb8c4f] transition">
            Välj foto
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-[#e0e0e0] mb-2">Gammalt lösenord</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-2 bg-[#383838] text-[#e0e0e0] rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-[#e0e0e0] mb-2">Nytt lösenord</label>
          <input
            type="password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            className={`w-full p-2 bg-[#383838] text-[#e0e0e0] rounded ${!isPasswordValid && newPassword ? 'border-red-500' : ''}`}
          />
          {!isPasswordValid && newPassword && (
            <p className="text-red-500 text-sm mt-1">
              Lösenordet måste vara minst 8 tecken långt och innehålla minst en bokstav och en siffra.
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-[#e0e0e0] mb-2">Bekräfta nytt lösenord</label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={handleConfirmNewPasswordChange}
            className={`w-full p-2 bg-[#383838] text-[#e0e0e0] rounded ${!isPasswordsMatch && confirmNewPassword ? 'border-red-500' : ''}`}
          />
          {!isPasswordsMatch && confirmNewPassword && (
            <p className="text-red-500 text-sm mt-1">Nya lösenorden matchar inte.</p>
          )}
        </div>
        <button 
          type="submit" 
          disabled={!isPasswordsMatch || !oldPassword || !newPassword || loading}
          className="w-full bg-[#fa7532] text-[#e0e0e0] py-2 rounded hover:bg-[#fb8c4f] transition disabled:bg-gray-500 disabled:cursor-not-allowed">
          {loading ? 'Ändrar lösenord...' : 'Ändra lösenord'} {/* Conditional text */}
        </button>
      </form>
    </div>
  );
}

export default EditAccount;