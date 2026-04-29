import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Play, Heart, Clock } from 'lucide-react';

const AlbumDetails = ({ currentUser, playSong, currentSong, likedSongs, toggleLike, savedAlbums, toggleSaveAlbum }) => {
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
        if (err.response?.status === 401) {
          navigate('/login');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [albumId, navigate]);

  if (loading) return <div className="flex h-full bg-black text-white items-center justify-center">Loading...</div>;
  if (!album) return <div className="flex h-full bg-black text-white items-center justify-center">Album not found</div>;

  const isAlbumSaved = savedAlbums?.includes(album._id);

  return (
    <div className="flex h-full w-full">
      <Sidebar currentUser={currentUser} />
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-indigo-900 via-[#121212] to-[#121212] pb-32">
        {/* Header */}
        <div className="p-8 flex items-end gap-6 pt-24">
          <div className="w-52 h-52 bg-gray-800 shadow-2xl flex items-center justify-center text-4xl font-bold text-gray-500 rounded flex-shrink-0">
            {album.title.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold uppercase mb-2">Album</p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">{album.title}</h1>
            <div className="flex items-center gap-2 text-sm font-bold">
              <span>{album.artist?.username || 'Unknown Artist'}</span>
              <span className="text-gray-400">• {album.musics?.length || 0} songs</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-8 bg-black/20 flex items-center gap-6">
          <button 
            onClick={async () => {
              await axios.post('/api/auth/logout');
              navigate('/login');
            }}
            className="bg-black/50 hover:bg-black/80 text-white rounded-full py-2 px-4 border border-gray-600 text-sm font-bold transition-colors"
          >
            Logout
          </button>
          <button 
            onClick={() => album.musics?.length > 0 && playSong(album.musics[0], album.musics)}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg"
          >
            <Play size={28} fill="black" stroke="black" className="ml-1" />
          </button>
          
          <button 
            onClick={() => toggleSaveAlbum(album._id)}
            className="focus:outline-none hover:scale-105 transition-all"
            title={isAlbumSaved ? "Remove from Library" : "Save to Library"}
          >
            <Heart size={36} className={isAlbumSaved ? "text-green-500" : "text-gray-400 hover:text-white"} fill={isAlbumSaved ? "currentColor" : "none"} />
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
            {album.musics?.map((music, index) => {
              const isLiked = likedSongs.includes(music._id);
              return (
                <div 
                  key={music._id} 
                  className={`group flex items-center grid grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer ${currentSong?._id === music._id ? 'bg-white/10' : ''}`}
                  onDoubleClick={() => playSong(music, album.musics)}
                >
                  <div className="text-gray-400 flex items-center justify-center w-4 h-4" onClick={() => playSong(music, album.musics)}>
                    <span className="group-hover:hidden">{currentSong?._id === music._id ? <Play size={14} className="text-green-500" fill="currentColor" /> : index + 1}</span>
                    <Play size={14} className={`hidden group-hover:block ${currentSong?._id === music._id ? 'text-green-500' : 'text-white'}`} fill="currentColor" />
                  </div>
                  
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex flex-col truncate">
                      <span className={`truncate font-medium ${currentSong?._id === music._id ? 'text-green-500' : 'text-white'}`}>
                        {music.title}
                      </span>
                      <span className="text-sm text-gray-400 truncate">
                        {album.artist?.username || 'Unknown Artist'}
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
                    3:00
                  </div>
                </div>
              );
            })}
            {(!album.musics || album.musics.length === 0) && (
              <div className="text-center py-4 text-gray-400">No songs in this album.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetails;
