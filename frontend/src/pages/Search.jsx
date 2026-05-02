import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Search as SearchIcon, Play, Clock, Heart } from 'lucide-react';
import PlaylistMenu from '../components/PlaylistMenu';

const Search = ({ currentUser, setCurrentUser, playSong, currentSong, likedSongs, toggleLike, playlists, updatePlaylistInState }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [albums, setAlbums] = useState([]);
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchResults = async (query = '') => {
    try {
      setLoading(true);
      const [albumsRes, musicsRes] = await Promise.all([
        axios.get(`/api/music/albums?search=${encodeURIComponent(query)}`),
        axios.get(`/api/music?search=${encodeURIComponent(query)}&limit=10`)
      ]);
      setAlbums(albumsRes.data.albums || []);
      setMusics(musicsRes.data.musics || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResults(searchQuery);
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

        {searchQuery && musics.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Songs</h3>
            <div className="flex flex-col gap-1">
              {musics.map((music, index) => {
                const isLiked = likedSongs?.includes(music._id);
                const isActive = currentSong?._id === music._id;
                return (
                  <div 
                    key={music._id} 
                    className={`group flex items-center grid grid-cols-[16px_minmax(0,1fr)_80px_120px] gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${isActive ? 'bg-white/10' : ''}`}
                    onClick={() => playSong(music, musics)}
                  >
                    <div className="text-gray-500 flex items-center justify-center w-4 h-4 text-sm font-medium">
                      {!isActive ? (
                        <>
                          <span className="group-hover:hidden">{index + 1}</span>
                          <Play size={14} className="hidden group-hover:block text-white" fill="currentColor" />
                        </>
                      ) : (
                        <div className="flex items-end gap-0.5 h-3">
                          <div className="w-0.5 h-full bg-green-500 animate-[music-bar_0.6s_ease-in-out_infinite]" />
                          <div className="w-0.5 h-2/3 bg-green-500 animate-[music-bar_0.8s_ease-in-out_infinite]" />
                          <div className="w-0.5 h-1/2 bg-green-500 animate-[music-bar_0.5s_ease-in-out_infinite]" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 bg-white/5 rounded flex-shrink-0 flex items-center justify-center border border-white/5 overflow-hidden">
                          {music.image ? (
                            <img src={music.image} alt={music.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-gray-500">SONG</span>
                          )}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className={`truncate font-bold text-sm sm:text-base ${isActive ? 'text-green-500' : 'text-white'}`}>
                          {music.title}
                        </span>
                        <span className="text-xs text-gray-400 truncate group-hover:text-white transition-colors">
                          {music.artist?.username || 'Unknown Artist'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleLike(music._id); }} 
                        className={`focus:outline-none transition-all hover:scale-110 active:scale-90 ${isLiked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      >
                        <Heart size={18} className={isLiked ? "text-green-500" : "text-gray-400 hover:text-white"} fill={isLiked ? "currentColor" : "none"} />
                      </button>
                      <PlaylistMenu musicId={music._id} playlists={playlists} updatePlaylistInState={updatePlaylistInState} />
                    </div>

                    <div className="text-sm text-gray-400 font-medium flex justify-end items-center w-20">
                       {music.duration > 0 
                         ? `${Math.floor(music.duration / 60)}:${(music.duration % 60).toString().padStart(2, '0')}` 
                         : "--:--"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mb-10">
          <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">
            {searchQuery ? `Albums` : 'Browse All Albums'}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {albums.map((album) => (
                <Link 
                  to={`/album/${album._id}`} 
                  key={album._id} 
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-sm p-4 rounded-xl transition-all duration-300 cursor-pointer group border border-white/5 hover:border-white/10 shadow-xl"
                >
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 shadow-2xl flex items-center justify-center overflow-hidden relative">
                      {album.image ? (
                        <img src={album.image} alt={album.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="text-gray-400 font-black text-2xl opacity-20 group-hover:scale-110 transition-transform">{album.title.substring(0,2).toUpperCase()}</span>
                      )}
                      <div className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full shadow-2xl flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <Play size={20} fill="black" className="text-black ml-1" />
                      </div>
                  </div>
                  <h4 className="font-bold text-white truncate mb-1">{album.title}</h4>
                  <p className="text-xs text-gray-400 truncate">{album.artist?.username || 'Unknown Artist'}</p>
                </Link>
              ))}
              {albums.length === 0 && musics.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-400 text-lg font-medium italic">No results found matching your search.</p>
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
