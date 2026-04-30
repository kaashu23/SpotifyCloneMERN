import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
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

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar currentUser={currentUser} />
      
      <div className="flex-1 bg-gradient-to-b from-indigo-900 via-[#121212] to-[#121212] overflow-y-auto pb-32">
        {/* Header */}
        <div className="p-8 flex items-end gap-6 pt-24">
          <div className="w-52 h-52 bg-gradient-to-br from-indigo-600 to-purple-400 shadow-2xl flex items-center justify-center text-white rounded flex-shrink-0">
            <Heart size={80} fill="white" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase mb-2">Playlist</p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Liked Songs</h1>
            <div className="flex items-center gap-2 text-sm font-bold">
              <span>{currentUser?.username || 'User'}</span>
              <span className="text-gray-400">• {musics.length} songs</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-8 bg-black/20 flex items-center gap-6">
          <button 
            onClick={() => musics.length > 0 && playSong(musics[0], musics)}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg disabled:opacity-50"
            disabled={musics.length === 0}
          >
            <Play size={28} fill="black" stroke="black" className="ml-1" />
          </button>
        </div>

        {/* Song List */}
        <div className="px-8 mt-4">
          <div className="text-gray-400 text-sm font-bold border-b border-gray-800 pb-2 mb-4 grid grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-4 px-4">
            <div>#</div>
            <div>Title</div>
            <div></div> {/* Heart column */}
            <div className="flex justify-end"><Clock size={16} /></div>
          </div>

          <div className="flex flex-col gap-2">
            {musics.length > 0 ? (
              musics.map((music, index) => {
                const isLiked = likedSongs?.includes(music._id);
                return (
                  <div 
                    key={music._id} 
                    className={`group flex items-center grid grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer ${currentSong?._id === music._id ? 'bg-white/10' : ''}`}
                    onDoubleClick={() => playSong(music, musics)}
                  >
                    <div className="text-gray-400 flex items-center justify-center w-4 h-4" onClick={() => playSong(music, musics)}>
                      <span className="group-hover:hidden">{currentSong?._id === music._id ? <Play size={14} className="text-green-500" fill="currentColor" /> : index + 1}</span>
                      <Play size={14} className={`hidden group-hover:block ${currentSong?._id === music._id ? 'text-green-500' : 'text-white'}`} fill="currentColor" />
                    </div>
                    
                    <div className="flex items-center gap-3 overflow-hidden">
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
                        : `3:${(music.title.length + 20).toString().padStart(2, '0').substring(0,2)}`}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <Heart size={48} className="text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Songs you like will appear here</h3>
                <p className="text-gray-400">Save songs by tapping the heart icon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikedSongs;
