import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Clock, Heart } from 'lucide-react';

const Home = ({ currentUser, setCurrentUser, playSong, currentSong, likedSongs, toggleLike }) => {
  const [musics, setMusics] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const fetchMusics = async (pageNum = 1) => {
    if (loading || (!hasMore && pageNum !== 1)) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/music?page=${pageNum}&limit=5`);
      const newMusics = res.data.musics || [];
      
      if (newMusics.length === 0) {
        setHasMore(false);
      } else {
        if (pageNum === 1) {
          setMusics(newMusics);
        } else {
          setMusics((prev) => {
            const existingIds = new Set(prev.map(m => m._id));
            const unique = newMusics.filter(m => !existingIds.has(m._id));
            return [...prev, ...unique];
          });
        }
        setPage(pageNum);
      }
    } catch (err) {
      console.error("Fetch musics error:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const res = await axios.get('/api/music/albums');
      setAlbums(res.data.albums || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMusics(1);
    fetchAlbums();
  }, []);

  useEffect(() => {
    const handleScroll = (e) => {
      const { scrollTop, clientHeight, scrollHeight } = e.target;
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        if (hasMore && !loading && musics.length > 0) {
          fetchMusics(page + 1);
        }
      }
    };
    
    const scrollContainer = document.getElementById('scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [page, hasMore, loading, musics.length]);

  if (initialLoading && musics.length === 0) {
    return (
      <div className="flex-1 flex h-full bg-[#121212] items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div id="scroll-container" className="flex-1 bg-gradient-to-b from-indigo-900/20 via-[#121212] to-[#121212] overflow-y-auto pb-48 md:pb-32">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{getGreeting()}</h2>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              setCurrentUser(null);
              navigate('/login');
            }}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full py-2.5 px-8 border border-white/10 text-sm font-bold transition-all active:scale-95 shadow-lg"
          >
            Logout
          </button>
        </header>

        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-2xl font-bold text-white tracking-tight">Popular Albums</h3>
            <span className="text-sm font-bold text-gray-400 hover:underline cursor-pointer">Show all</span>
          </div>
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
            {albums.length === 0 && !initialLoading && <p className="text-gray-400 text-sm col-span-full italic">No albums found.</p>}
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">All Songs</h3>
          
          <div className="text-gray-500 text-[10px] font-black border-b border-white/5 pb-2 mb-4 grid grid-cols-[16px_minmax(0,1fr)_40px_80px] sm:grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-4 px-4 uppercase tracking-widest">
             <div className="flex justify-center">#</div>
             <div>Title</div>
             <div></div>
             <div className="flex justify-end"><Clock size={16} /></div>
          </div>

          <div className="flex flex-col gap-1">
            {musics.map((music, index) => {
              const isLiked = likedSongs?.includes(music._id);
              const isActive = currentSong?._id === music._id;
              return (
                <div 
                  key={music._id} 
                  className={`group flex items-center grid grid-cols-[16px_minmax(0,1fr)_40px_80px] sm:grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${isActive ? 'bg-white/10' : ''}`}
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
                    <div className="w-10 h-10 bg-white/5 rounded flex-shrink-0 flex items-center justify-center border border-white/5">
                        <span className="text-[10px] font-bold text-gray-500">SONG</span>
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

                  <div className="flex items-center justify-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(music._id); }} 
                      className={`focus:outline-none transition-all hover:scale-110 active:scale-90 ${isLiked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <Heart size={18} className={isLiked ? "text-green-500" : "text-gray-400 hover:text-white"} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="text-sm text-gray-400 font-medium flex justify-end items-center">
                     {music.duration 
                       ? `${Math.floor(music.duration / 60)}:${(music.duration % 60).toString().padStart(2, '0')}` 
                       : `3:${(music.title.length + 15).toString().padStart(2, '0').substring(0,2)}`}
                  </div>
                </div>
              );
            })}
            
            {!hasMore && musics.length > 0 && <div className="text-center py-10 text-gray-500 text-sm font-medium tracking-tighter">You've reached the end of the collection</div>}
            {musics.length === 0 && !loading && !initialLoading && <div className="text-center py-20 text-gray-500 italic">No songs found. Start uploading!</div>}
            {loading && (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
