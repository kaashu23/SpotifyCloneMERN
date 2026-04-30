import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Play, Clock, Heart } from 'lucide-react';

const Home = ({ currentUser, setCurrentUser, playSong, currentSong, likedSongs, toggleLike }) => {
  const [musics, setMusics] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
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
    if (loading || !hasMore) return;
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
      if (scrollHeight - scrollTop <= clientHeight + 50) {
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

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar currentUser={currentUser} />
      
      <div 
        id="scroll-container" 
        className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-y-auto pb-32 md:pb-32"
      >
        <div className="p-4 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{getGreeting()}</h2>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                setCurrentUser(null);
                navigate('/login');
              }}
              className="bg-black/50 hover:bg-black/80 text-white rounded-full py-2 px-6 border border-gray-600 text-sm font-bold transition-all whitespace-nowrap"
            >
              Logout
            </button>
          </div>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-white mb-6">Popular Albums</h3>
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
              {albums.length === 0 && <p className="text-gray-400 text-sm col-span-full">No albums found.</p>}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-6">All Songs</h3>
            
            <div className="text-gray-400 text-xs font-bold border-b border-gray-800 pb-2 mb-4 grid grid-cols-[16px_minmax(0,1fr)_40px_100px] sm:grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-2 sm:gap-4 px-2 sm:px-4 uppercase">
               <div>#</div>
               <div>Title</div>
               <div></div>
               <div className="flex justify-end"><Clock size={16} /></div>
            </div>

            <div className="flex flex-col gap-1">
              {musics.map((music, index) => {
                const isLiked = likedSongs?.includes(music._id);
                return (
                  <div 
                    key={music._id} 
                    className={`group flex items-center grid grid-cols-[16px_minmax(0,1fr)_40px_100px] sm:grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-2 sm:gap-4 px-2 sm:px-4 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer ${currentSong?._id === music._id ? 'bg-white/10' : ''}`}
                    onDoubleClick={() => playSong(music, musics)}
                  >
                    <div className="text-gray-400 flex items-center justify-center w-4 h-4" onClick={() => playSong(music, musics)}>
                      <span className="group-hover:hidden">{currentSong?._id === music._id ? <Play size={14} className="text-green-500" fill="currentColor" /> : index + 1}</span>
                      <Play size={14} className={`hidden group-hover:block ${currentSong?._id === music._id ? 'text-green-500' : 'text-white'}`} fill="currentColor" />
                    </div>
                    
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-gray-700 flex-shrink-0 flex items-center justify-center">
                          <span className="text-xs text-gray-400">Art</span>
                      </div>
                      <div className="flex flex-col truncate">
                        <span className={`truncate font-medium ${currentSong?._id === music._id ? 'text-green-500' : 'text-white'}`}>
                          {music.title}
                        </span>
                        <span className="text-sm text-gray-400 truncate">
                          {music.artist?.username || 'Unknown Artist'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleLike(music._id); }} 
                        className={`focus:outline-none transition-opacity ${isLiked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      >
                        <Heart size={18} className={isLiked ? "text-green-500" : "text-gray-400 hover:text-white"} fill={isLiked ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div className="text-sm text-gray-400 flex justify-end items-center">
                       {music.duration 
                         ? `${Math.floor(music.duration / 60)}:${(music.duration % 60).toString().padStart(2, '0')}` 
                         : `3:${(music.title.length + 15).toString().padStart(2, '0').substring(0,2)}`}
                    </div>
                  </div>
                );
              })}
              
              {!hasMore && musics.length > 0 && <div className="text-center py-4 text-gray-400 text-sm">You've reached the end!</div>}
              {musics.length === 0 && !loading && <div className="text-center py-4 text-gray-400">No songs found.</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
