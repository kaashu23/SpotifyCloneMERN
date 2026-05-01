import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Music } from 'lucide-react';

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
          // For artists, we might want to filter or show all if the backend doesn't have a specific "my-albums" endpoint
          // But here we'll assume we filter by artist id
          const myId = currentUser.id || currentUser._id;
          const myAlbums = res.data.albums.filter(a => 
            a.artist?._id === myId || a.artist === myId
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

  if (loading && albums.length === 0) {
    return (
      <div className="flex-1 flex h-full bg-[#121212] items-center justify-center min-h-[80vh]">
         <div className="w-12 h-12 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-emerald-900/20 via-[#121212] to-[#121212] overflow-y-auto pb-48 md:pb-32">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Your Library</h2>
          <button 
            onClick={async () => {
              localStorage.removeItem('token');
              navigate('/login');
              window.location.reload();
            }}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full py-2.5 px-8 border border-white/10 text-sm font-bold transition-all active:scale-95 shadow-lg"
          >
            Logout
          </button>
        </header>

        <section className="mb-10">
          <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">
            {currentUser?.role === 'artist' ? "Albums You've Created" : "Saved Albums"}
          </h3>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {albums.map((album) => (
                <Link 
                  to={`/album/${album._id}`} 
                  key={album._id} 
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-sm p-4 rounded-xl transition-all duration-300 cursor-pointer group border border-white/5 hover:border-white/10 shadow-xl"
                >
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 shadow-2xl flex items-center justify-center overflow-hidden relative">
                      <span className="text-gray-400 font-black text-2xl opacity-20 group-hover:scale-110 transition-transform">{album.title.substring(0,2).toUpperCase()}</span>
                      <div className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full shadow-2xl flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <Play size={20} fill="black" className="text-black ml-1" />
                      </div>
                  </div>
                  <h4 className="font-bold text-white truncate mb-1">{album.title}</h4>
                  <p className="text-xs text-gray-400 truncate">{album.artist?.username || 'Unknown Artist'}</p>
                </Link>
              ))}
              {albums.length === 0 && (
                <div className="col-span-full py-20 text-center px-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Music size={40} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-lg font-medium italic">
                    {currentUser?.role === 'artist' ? "You haven't created any albums yet." : "You haven't saved any albums yet."}
                  </p>
                  <button onClick={() => navigate('/')} className="mt-8 bg-white text-black font-black py-3 px-8 rounded-full hover:scale-105 active:scale-95 transition-all">Explore music</button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Library;
