import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Search from './pages/Search';
import AlbumDetails from './pages/AlbumDetails';
import Upload from './pages/Upload';
import CreateAlbum from './pages/CreateAlbum';
import Library from './pages/Library';
import LikedSongs from './pages/LikedSongs';
import Player from './components/Player';
import Sidebar from './components/Sidebar';

axios.defaults.baseURL = 'https://spotifyclonemern.onrender.com';
//axios.defaults.baseURL = 'http://localhost:3000';
// Request interceptor to add the JWT token to headers
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Move Protected outside to prevent remounting/blinking
const Protected = ({ children, loading, currentUser }) => {
  if (loading && !currentUser) return null;
  if (!loading && !currentUser) return <Navigate to="/login" />;
  return children;
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [likedSongs, setLikedSongs] = useState([]);
  const [savedAlbums, setSavedAlbums] = useState([]);
  const [songsQueue, setSongsQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.user) {
          setCurrentUser(res.data.user);
          if (res.data.user.likedSongs) setLikedSongs(res.data.user.likedSongs);
          if (res.data.user.savedAlbums) setSavedAlbums(res.data.user.savedAlbums);
        }
      } catch (err) {
        console.log("Initial auth check: Not logged in");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const toggleLike = async (musicId) => {
    try {
      const res = await axios.post(`/api/music/like/${musicId}`);
      setLikedSongs(res.data.likedSongs);
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const toggleSaveAlbum = async (albumId) => {
    try {
      const res = await axios.post(`/api/music/album/save/${albumId}`);
      setSavedAlbums(res.data.savedAlbums);
    } catch (err) {
      console.error("Failed to save album", err);
    }
  };

  const playSong = (song, queue = []) => {
    setCurrentSong(song);
    if (queue.length > 0) {
      setSongsQueue(queue);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
      <div className="flex-1 overflow-y-auto relative">
        <Routes>
          <Route path="/login" element={<Auth setCurrentUser={setCurrentUser} />} />
          <Route path="/" element={<Protected loading={loading} currentUser={currentUser}><Home currentUser={currentUser} setCurrentUser={setCurrentUser} playSong={playSong} currentSong={currentSong} likedSongs={likedSongs} toggleLike={toggleLike} /></Protected>} />
          <Route path="/search" element={<Protected loading={loading} currentUser={currentUser}><Search currentUser={currentUser} setCurrentUser={setCurrentUser} playSong={playSong} currentSong={currentSong} likedSongs={likedSongs} toggleLike={toggleLike} /></Protected>} />
          <Route path="/album/:albumId" element={<Protected loading={loading} currentUser={currentUser}><AlbumDetails currentUser={currentUser} setCurrentUser={setCurrentUser} playSong={playSong} currentSong={currentSong} likedSongs={likedSongs} toggleLike={toggleLike} savedAlbums={savedAlbums} toggleSaveAlbum={toggleSaveAlbum} /></Protected>} />
          <Route path="/upload" element={<Protected loading={loading} currentUser={currentUser}><Upload currentUser={currentUser} /></Protected>} />
          <Route path="/create-album" element={<Protected loading={loading} currentUser={currentUser}><CreateAlbum currentUser={currentUser} /></Protected>} />
          <Route path="/library" element={<Protected loading={loading} currentUser={currentUser}><Library currentUser={currentUser} /></Protected>} />
          <Route path="/liked" element={<Protected loading={loading} currentUser={currentUser}><LikedSongs currentUser={currentUser} playSong={playSong} currentSong={currentSong} likedSongs={likedSongs} toggleLike={toggleLike} /></Protected>} />
        </Routes>
      </div>
      {location.pathname !== '/login' && (
        <Player currentSong={currentSong} songsQueue={songsQueue} playSong={playSong} />
      )}
    </div>
  );
}

export default App;
