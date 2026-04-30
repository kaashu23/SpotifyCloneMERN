import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SelectRole = ({ setCurrentUser }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelect = async (role) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/update-role', { role });
      setCurrentUser(res.data.user);
      navigate('/');
    } catch (err) {
      console.error("Failed to update role", err);
      alert("Failed to update role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121212] p-8 rounded-lg shadow-2xl text-center">
        <h1 className="text-3xl font-bold text-white mb-6">Choose your experience</h1>
        <p className="text-gray-400 mb-8 font-medium">Are you here to listen or to share your music with the world?</p>
        
        <div className="flex flex-col gap-4">
          <button 
            disabled={loading}
            onClick={() => handleSelect('user')}
            className="group relative overflow-hidden bg-[#242424] hover:bg-[#2a2a2a] border border-gray-700 p-6 rounded-xl transition-all hover:scale-[1.02]"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">🎧</span>
              <h2 className="text-xl font-bold text-white">Listener</h2>
              <p className="text-sm text-gray-500 mt-1">I want to listen to music and create playlists.</p>
            </div>
          </button>

          <button 
            disabled={loading}
            onClick={() => handleSelect('artist')}
            className="group relative overflow-hidden bg-[#242424] hover:bg-[#2a2a2a] border border-gray-700 p-6 rounded-xl transition-all hover:scale-[1.02]"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">🎙️</span>
              <h2 className="text-xl font-bold text-[#1ed760]">Artist</h2>
              <p className="text-sm text-gray-500 mt-1">I want to upload my music and reach fans.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
