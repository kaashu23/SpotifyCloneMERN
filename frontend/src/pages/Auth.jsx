import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = ({ setCurrentUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { username, email, password, role };
      const res = await axios.post(endpoint, payload);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      setCurrentUser(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#121212] p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md my-4">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <img src="/spotify.svg" className="w-10 h-10 sm:w-12 sm:h-12 mb-4" alt="Spotify Logo" />
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
            {isLogin ? 'Log in to Spotify' : 'Sign up to start listening'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1 sm:mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded p-2.5 sm:p-3 text-white focus:border-white outline-none transition-all text-sm"
                placeholder="Username"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1 sm:mb-2">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded p-2.5 sm:p-3 text-white focus:border-white outline-none transition-all text-sm"
              placeholder="Email address"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1 sm:mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded p-2.5 sm:p-3 text-white focus:border-white outline-none transition-all text-sm"
              placeholder="Password"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1 sm:mb-2">I want to be an</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded p-2.5 sm:p-3 text-white focus:border-white outline-none transition-all text-sm"
              >
                <option value="user">Listener</option>
                <option value="artist">Artist</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#1ed760] text-black font-bold py-2.5 sm:py-3 rounded-full hover:scale-[1.02] transition-transform mt-2 sm:mt-4 text-sm"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-800 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white hover:underline ml-1 sm:ml-2 font-bold"
            >
              {isLogin ? 'Sign up for Spotify' : 'Log in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
