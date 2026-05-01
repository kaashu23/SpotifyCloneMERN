import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Heart, Clock, MoreHorizontal } from 'lucide-react';

const AlbumDetails = ({ currentUser, setCurrentUser, playSong, currentSong, likedSongs, toggleLike, savedAlbums, toggleSaveAlbum }) => {
  const { albumId } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await axios.get(`/api/music/albums/${albumId}`);
        setAlbum(res.data.album);
      } catch (err) {
        console.error("Fetch album error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [albumId, navigate]);

  if (loading) return (
    <div className="flex-1 flex h-full bg-[#121212] items-center justify-center min-h-[80vh]">
       <div className="w-12 h-12 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!album) return (
    <div className="flex-1 flex h-full bg-[#121212] flex-col items-center justify-center gap-4 min-h-[80vh]">
      <h2 className="text-2xl font-bold text-white">Album not found</h2>
      <button onClick={() => navigate('/')} className="text-green-500 font-bold hover:underline">Go back home</button>
    </div>
  );

  const isAlbumSaved = savedAlbums?.includes(album._id);

  return (
    <div className="flex-1 bg-gradient-to-b from-indigo-800/40 via-[#121212] to-[#121212] overflow-y-auto pb-48 md:pb-32">
      {/* Header Section */}
      <header className="p-4 md:p-8 pt-16 md:pt-20 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
        <div className="w-48 h-48 md:w-60 md:h-60 bg-gradient-to-br from-gray-700 to-gray-800 shadow-2xl flex items-center justify-center text-6xl font-black text-white/10 rounded-xl overflow-hidden shadow-black/50 border border-white/5 relative group">
          {album.image ? (
            <img src={album.image} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            album.title.substring(0, 2).toUpperCase()
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
        </div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 min-w-0">
          <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/70 mb-2">Album</p>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter truncate w-full">{album.title}</h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm md:text-base font-bold text-white/90">
            <span className="hover:underline cursor-pointer">{album.artist?.username || 'Unknown Artist'}</span>
            <span className="text-white/40">•</span>
            <span>{album.musics?.length || 0} songs</span>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="px-4 md:px-8 py-6 md:py-8 flex items-center justify-between sticky top-0 z-10 bg-transparent transition-all duration-300" id="controls-bar">
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={() => album.musics?.length > 0 && playSong(album.musics[0], album.musics)}
            className="w-14 h-14 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl text-black hover:bg-green-400"
          >
            <Play size={32} fill="black" stroke="black" className="ml-1" />
          </button>
          
          <button 
            onClick={() => toggleSaveAlbum(album._id)}
            className="focus:outline-none hover:scale-110 active:scale-90 transition-all p-2 rounded-full hover:bg-white/5"
            title={isAlbumSaved ? "Remove from Library" : "Save to Library"}
          >
            <Heart size={32} className={isAlbumSaved ? "text-green-500" : "text-gray-400 hover:text-white"} fill={isAlbumSaved ? "currentColor" : "none"} />
          </button>
          
          <button className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
            <MoreHorizontal size={32} />
          </button>
        </div>

        <button 
          onClick={() => {
            localStorage.removeItem('token');
            setCurrentUser(null);
            navigate('/login');
          }}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full py-2 px-6 border border-white/10 text-xs md:text-sm font-bold transition-all active:scale-95 shadow-lg"
        >
          Logout
        </button>
      </div>

      {/* Song List */}
      <div className="px-2 md:px-8 mt-4">
        <div className="text-gray-500 text-[10px] md:text-xs font-black border-b border-white/5 pb-2 mb-4 grid grid-cols-[16px_minmax(0,1fr)_40px_80px] sm:grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-4 px-4 uppercase tracking-widest">
          <div className="flex justify-center">#</div>
          <div>Title</div>
          <div></div>
          <div className="flex justify-end"><Clock size={16} /></div>
        </div>

        <div className="flex flex-col gap-1">
          {album.musics?.map((music, index) => {
            const isLiked = likedSongs.includes(music._id);
            const isActive = currentSong?._id === music._id;
            return (
              <div 
                key={music._id} 
                className={`group flex items-center grid grid-cols-[16px_minmax(0,1fr)_40px_80px] sm:grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${isActive ? 'bg-white/10' : ''}`}
                onClick={() => playSong(music, album.musics)}
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
                      {album.artist?.username || 'Unknown Artist'}
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

                <div className="text-sm text-gray-400 font-medium flex justify-end items-center w-20">
                  {music.duration > 0 
                    ? `${Math.floor(music.duration / 60)}:${(music.duration % 60).toString().padStart(2, '0')}` 
                    : "--:--"}
                </div>
              </div>
            );
          })}
          {(!album.musics || album.musics.length === 0) && (
            <div className="text-center py-20 text-gray-500 italic">This album doesn't have any songs yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumDetails;
