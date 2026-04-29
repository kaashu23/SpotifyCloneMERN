import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Library = ({ currentUser }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        if (currentUser?.role === 'artist') {
          const res = await axios.get('/api/music/albums');
          const myAlbums = res.data.albums.filter(a => 
            a.artist?._id === currentUser.id || a.artist === currentUser.id
          );
          setAlbums(myAlbums);
        } else if (currentUser?.role === 'user') {
          const res = await axios.get('/api/music/albums/saved');
          setAlbums(res.data.savedAlbums || []);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        }
        console.error('Failed to fetch albums', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchAlbums();
    }
  }, [currentUser, navigate]);

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar currentUser={currentUser} />
      
      <div className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Your Library</h2>
            <button 
              onClick={async () => {
                await axios.post('/api/auth/logout');
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="bg-black/50 hover:bg-black/80 text-white rounded-full py-2 px-4 border border-gray-600 text-sm font-bold transition-colors ml-4"
            >
              Logout
            </button>
          </div>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-white mb-6">
              {currentUser?.role === 'artist' ? "Albums You've Created" : "Saved Albums"}
            </h3>
            {loading ? (
              <div className="text-gray-400">Loading your albums...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {albums.map((album) => (
                  <Link to={`/album/${album._id}`} key={album._id} className="bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-all cursor-pointer group block">
                    <div className="w-full aspect-square bg-gray-700 rounded-md mb-4 shadow-lg flex items-center justify-center">
                        <span className="text-gray-400 font-bold">{album.title.substring(0,2).toUpperCase()}</span>
                    </div>
                    <h4 className="font-bold text-white truncate">{album.title}</h4>
                    <p className="text-sm text-gray-400 truncate">{album.artist?.username || 'Unknown Artist'}</p>
                  </Link>
                ))}
                {albums.length === 0 && (
                  <p className="text-gray-400 text-sm col-span-full">
                    {currentUser?.role === 'artist' ? "You haven't created any albums yet." : "You haven't saved any albums yet."}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Library;
