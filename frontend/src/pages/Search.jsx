import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Search as SearchIcon, Play } from 'lucide-react';

const Search = ({ currentUser, setCurrentUser, playSong, currentSong, likedSongs, toggleLike }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchAlbums = async (query = '') => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/music/albums?search=${encodeURIComponent(query)}`);
      setAlbums(res.data.albums || []);
    } catch (err) {
      console.error("Fetch albums search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAlbums(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="flex-1 bg-gradient-to-b from-blue-900/20 via-[#121212] to-[#121212] overflow-y-auto pb-48 md:pb-32">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3.5 border border-white/5 rounded-full leading-5 bg-white/5 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-white/20 sm:text-sm transition-all shadow-2xl"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              setCurrentUser(null);
              navigate('/login');
            }}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full py-2 px-8 border border-white/10 text-sm font-bold transition-all active:scale-95 shadow-lg whitespace-nowrap"
          >
            Logout
          </button>
        </header>

        <section className="mb-10">
          <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse All Albums'}
          </h3>
          
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
              {albums.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-400 text-lg font-medium italic">No albums found matching your search.</p>
                </div>
              )}
              {loading && (
                <div className="col-span-full flex justify-center py-20">
                  <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
        </section>
      </div>
    </div>
  );
};

export default Search;
