import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Clock, Heart, Trash2 } from 'lucide-react';
import PlaylistMenu from '../components/PlaylistMenu';

const LikedSongs = ({ currentUser, playSong, currentSong, likedSongs, toggleLike, playlists, updatePlaylistInState }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const res = await axios.get('/api/music/liked');
        setSongs(res.data.likedSongs || []);
      } catch (err) {
        console.error("Fetch liked songs error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedSongs();
  }, [likedSongs]); // Refresh when likedSongs IDs change

  if (loading && songs.length === 0) return (
    <div className="flex-1 flex h-full bg-[#121212] items-center justify-center min-h-[80vh]">
       <div className="w-12 h-12 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 bg-gradient-to-b from-purple-900/40 via-[#121212] to-[#121212] overflow-y-auto pb-48 md:pb-32">
      <header className="p-4 md:p-8 pt-16 md:pt-20 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
        <div className="w-48 h-48 md:w-60 md:h-60 bg-gradient-to-br from-indigo-600 to-purple-700 shadow-2xl flex items-center justify-center text-6xl font-black text-white rounded-xl overflow-hidden shadow-black/50 border border-white/5">
          <Heart size={80} fill="white" />
        </div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 min-w-0">
          <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/70 mb-2">Playlist</p>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter truncate w-full">Liked Songs</h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm md:text-base font-bold text-white/90">
            <span className="hover:underline cursor-pointer">{currentUser?.username}</span>
            <span className="text-white/40">•</span>
            <span>{songs.length} songs</span>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-8 py-8">
        <button 
          onClick={() => songs.length > 0 && playSong(songs[0], songs)}
          className="w-14 h-14 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl text-black hover:bg-green-400 mb-8"
        >
          <Play size={32} fill="black" stroke="black" className="ml-1" />
        </button>

        <div className="text-gray-500 text-[10px] md:text-xs font-black border-b border-white/5 pb-2 mb-4 grid grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-4 px-4 uppercase tracking-widest">
          <div className="flex justify-center">#</div>
          <div>Title</div>
          <div></div>
          <div className="flex justify-end"><Clock size={16} /></div>
        </div>

        <div className="flex flex-col gap-1">
          {songs.map((music, index) => {
            const isActive = currentSong?._id === music._id;
            return (
              <div 
                key={music._id} 
                className={`group flex items-center grid grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${isActive ? 'bg-white/10' : ''}`}
                onClick={() => playSong(music, songs)}
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
                
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-white/5 rounded flex-shrink-0 flex items-center justify-center border border-white/5 overflow-hidden">
                    <img src={music.image} alt={music.title} className="w-full h-full object-cover" />
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
                    className="focus:outline-none transition-all hover:scale-110 active:scale-90"
                  >
                    <Heart size={18} className="text-green-500" fill="currentColor" />
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
          {songs.length === 0 && (
            <div className="text-center py-20 text-gray-500 italic">Songs you like will appear here.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikedSongs;
