import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Play, Heart, Clock } from 'lucide-react';

const LikedSongs = ({ currentUser, playSong, currentSong, likedSongs, toggleLike }) => {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/music/liked');
        // The backend populates the likedSongs array with full music objects and their artists
        setMusics(res.data.likedSongs || []);
      } catch (err) {
        console.error('Failed to fetch liked songs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedSongs();
  }, [navigate, likedSongs.length]); // Refresh if liked songs length changes

  if (loading) return (
    <div className="flex-1 flex h-full bg-[#121212] items-center justify-center min-h-[80vh]">
       <div className="w-12 h-12 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 bg-gradient-to-b from-purple-900/40 via-[#121212] to-[#121212] overflow-y-auto pb-48 md:pb-32">
      {/* Header Section */}
      <header className="p-4 md:p-8 pt-16 md:pt-20 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
        <div className="w-48 h-48 md:w-60 md:h-60 bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 shadow-2xl flex items-center justify-center text-white rounded-xl overflow-hidden shadow-black/50 border border-white/5">
          <Heart size={80} fill="white" className="drop-shadow-2xl" />
        </div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 min-w-0">
          <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/70 mb-2">Playlist</p>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter truncate w-full">Liked Songs</h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm md:text-base font-bold text-white/90">
            <span className="hover:underline cursor-pointer">{currentUser?.username || 'User'}</span>
            <span className="text-white/40">•</span>
            <span>{musics.length} songs</span>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="px-4 md:px-8 py-6 md:py-8 flex items-center gap-6 sticky top-0 z-10 bg-transparent">
        <button 
          onClick={() => musics.length > 0 && playSong(musics[0], musics)}
          className="w-14 h-14 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl text-black hover:bg-green-400 disabled:opacity-50"
          disabled={musics.length === 0}
        >
          <Play size={32} fill="black" stroke="black" className="ml-1" />
        </button>
      </div>

      {/* Song List */}
      <div className="px-2 md:px-8 mt-4">
        {musics.length > 0 ? (
          <>
            <div className="text-gray-500 text-[10px] md:text-xs font-black border-b border-white/5 pb-2 mb-4 grid grid-cols-[16px_minmax(0,1fr)_40px_80px] sm:grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-4 px-4 uppercase tracking-widest">
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
                        : `3:${(music.title.length + 20).toString().padStart(2, '0').substring(0,2)}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Heart size={48} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Songs you like will appear here</h3>
            <p className="text-gray-400 max-w-xs">Save songs by tapping the heart icon in the player or on the track list.</p>
            <button onClick={() => navigate('/')} className="mt-8 bg-white text-black font-black py-3 px-8 rounded-full hover:scale-105 active:scale-95 transition-all">Find songs</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongs;
