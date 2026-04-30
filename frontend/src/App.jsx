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
axios.defaults.withCredentials = true;

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
        setLoading(true);
        const res = await axios.get('/api/auth/me');
        if (res.data.user) {
          setCurrentUser(res.data.user);
          if (res.data.user.likedSongs) {
            setLikedSongs(res.data.user.likedSongs);
          }
          if (res.data.user.savedAlbums) {
            setSavedAlbums(res.data.user.savedAlbums);
          }
        }
      } catch (err) {
        console.log("Not logged in or error fetching user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const Protected = ({ children }) => {
    if (loading) return <div className="h-screen bg-black flex items-center justify-center text-[#1ed760] font-bold">Spotify...</div>;
    if (!currentUser) return <Navigate to="/login" />;
    return children;
  };

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
          <Route path="/" element={<Protected><Home currentUser={currentUser} playSong={playSong} currentSong={currentSong} likedSongs={likedSongs} toggleLike={toggleLike} /></Protected>} />
          <Route path="/search" element={<Protected><Search currentUser={currentUser} playSong={playSong} currentSong={currentSong} likedSongs={likedSongs} toggleLike={toggleLike} /></Protected>} />
          <Route path="/album/:albumId" element={<Protected><AlbumDetails currentUser={currentUser} playSong={playSong} currentSong={currentSong} likedSongs={likedSongs} toggleLike={toggleLike} savedAlbums={savedAlbums} toggleSaveAlbum={toggleSaveAlbum} /></Protected>} />
          <Route path="/upload" element={<Protected><Upload currentUser={currentUser} /></Protected>} />
          <Route path="/create-album" element={<Protected><CreateAlbum currentUser={currentUser} /></Protected>} />
          <Route path="/library" element={<Protected><Library currentUser={currentUser} /></Protected>} />
          <Route path="/liked" element={<Protected><LikedSongs currentUser={currentUser} playSong={playSong} currentSong={currentSong} likedSongs={likedSongs} toggleLike={toggleLike} /></Protected>} />
        </Routes>
      </div>
      {location.pathname !== '/login' && (
        <Player currentSong={currentSong} songsQueue={songsQueue} playSong={playSong} />
      )}
    </div>
  );
}

export default App;
