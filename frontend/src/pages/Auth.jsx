import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = ({ setCurrentUser }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        const res = await axios.post('/api/auth/register', { username, email, password, role });
        setCurrentUser(res.data.user);
        setMessage('Registered successfully! You are now logged in.');
        navigate('/');
      } else {
        const res = await axios.post('/api/auth/login', { email, password });
        setCurrentUser(res.data.user);
        setMessage('Logged in successfully!');
        navigate('/');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#121212] p-6 sm:p-8 rounded-lg shadow-2xl">
        <h1 className="text-2xl font-bold text-white text-center mb-6 flex justify-center items-center gap-2">
          <img src="/spotify.svg" className="w-8 h-8" alt="Spotify Logo" />
          Spotify Clone
        </h1>
        
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isRegistering ? 'Sign up to start' : 'Log in to Spotify'}
        </h2>

        {message && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-center text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {isRegistering && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white">Username</label>
                <input 
                  className="bg-[#121212] md:bg-[#242424] border border-gray-600 rounded p-3 text-white focus:border-white focus:outline-none transition-colors hover:border-gray-400"
                  type="text" 
                  placeholder="Username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required={isRegistering} 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white">Role</label>
                <select 
                  className="bg-[#121212] md:bg-[#242424] border border-gray-600 rounded p-3 text-white focus:border-white focus:outline-none transition-colors hover:border-gray-400"
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="artist">Artist</option>
                </select>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white">Email address</label>
            <input 
              className="bg-[#121212] md:bg-[#242424] border border-gray-600 rounded p-3 text-white focus:border-white focus:outline-none transition-colors hover:border-gray-400"
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white">Password</label>
            <input 
              className="bg-[#121212] md:bg-[#242424] border border-gray-600 rounded p-3 text-white focus:border-white focus:outline-none transition-colors hover:border-gray-400"
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button 
            type="submit"
            className="mt-2 bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 transition-all text-black font-bold py-3 rounded-full text-base"
          >
            {isRegistering ? 'Sign up' : 'Log In'}
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 font-bold text-sm">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="mt-4 w-full bg-transparent border border-gray-500 hover:border-white text-white font-bold py-3 rounded-full transition-colors text-sm"
          >
            {isRegistering ? 'Log in here' : 'Sign up for Spotify'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
