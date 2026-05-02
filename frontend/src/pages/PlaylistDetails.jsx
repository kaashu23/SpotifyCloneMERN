import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Heart, Clock, MoreHorizontal, Trash2, Globe, Lock, Edit2, Check, X, Loader2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const PlaylistDetails = ({ currentUser, playSong, currentSong, likedSongs, toggleLike, fetchPlaylists, updatePlaylistInState }) => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsOpenEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [removingSongId, setRemovingSongId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: '', data: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await axios.get(`/api/playlist/${playlistId}`);
        setPlaylist(res.data.playlist);
        setNewName(res.data.playlist.name);
      } catch (err) {
        console.error("Fetch playlist error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [playlistId]);

  const handleDeletePlaylist = async () => {
    try {
      await axios.delete(`/api/playlist/${playlistId}`);
      fetchPlaylists();
      navigate('/library');
    } catch (err) {
      console.error("Delete playlist error:", err);
    }
  };

  const removeSongFromPlaylist = async (musicId) => {
    try {
      setRemovingSongId(musicId);
      const res = await axios.delete(`/api/playlist/${playlistId}/songs/${musicId}`);
      setPlaylist(res.data.playlist);
      if (updatePlaylistInState) {
        updatePlaylistInState(res.data.playlist);
      }
    } catch (err) {
      console.error("Remove song error:", err);
    } finally {
      setRemovingSongId(null);
    }
  };

  const togglePrivacy = async () => {
    try {
      const res = await axios.put(`/api/playlist/${playlistId}`, { isPublic: !playlist.isPublic });
      setPlaylist(res.data.playlist);
      if (updatePlaylistInState) updatePlaylistInState(res.data.playlist);
    } catch (err) {
      console.error("Toggle privacy error:", err);
    }
  };

  const handleRename = async () => {
    if (!newName.trim()) return;
    try {
      const res = await axios.put(`/api/playlist/${playlistId}`, { name: newName });
      setPlaylist(res.data.playlist);
      setIsOpenEditing(false);
      if (updatePlaylistInState) updatePlaylistInState(res.data.playlist);
    } catch (err) {
      console.error("Rename playlist error:", err);
    }
  };

  if (loading) return (
    <div className="flex-1 flex h-full bg-[#121212] items-center justify-center min-h-[80vh]">
       <div className="w-12 h-12 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!playlist) return (
    <div className="flex-1 flex h-full bg-[#121212] flex-col items-center justify-center gap-4 min-h-[80vh]">
      <h2 className="text-2xl font-bold text-white">Playlist not found</h2>
      <button onClick={() => navigate('/')} className="text-green-500 font-bold hover:underline">Go back home</button>
    </div>
  );

  const currentUserId = currentUser?._id || currentUser?.id;
  const ownerId = playlist.owner?._id || playlist.owner;
  const isOwner = currentUserId && ownerId && currentUserId.toString() === ownerId.toString();

  return (
    <div className="flex-1 bg-gradient-to-b from-green-900/40 via-[#121212] to-[#121212] overflow-y-auto pb-48 md:pb-32">
      {/* Header Section */}
      <header className="p-4 md:p-8 pt-16 md:pt-20 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
        <div className="w-48 h-48 md:w-60 md:h-60 bg-gradient-to-br from-gray-700 to-gray-800 shadow-2xl flex items-center justify-center text-6xl font-black text-white/10 rounded-xl overflow-hidden shadow-black/50 border border-white/5 relative group shrink-0">
          {playlist.image ? (
            <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            playlist.name.substring(0, 2).toUpperCase()
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
        </div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 min-w-0 py-2">
          <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/70 mb-2 flex items-center gap-2">
            Playlist {playlist.isPublic ? <Globe size={14} /> : <Lock size={14} />}
          </p>
          
          {isEditing ? (
            <div className="flex items-center gap-4 mb-6 w-full max-w-2xl">
                <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-4xl md:text-7xl font-black text-white bg-white/5 border-b-2 border-green-500 focus:outline-none w-full py-2 leading-tight"
                    autoFocus
                />
                <div className="flex flex-col gap-2">
                    <button onClick={handleRename} className="p-2 bg-green-500 rounded-full text-black hover:scale-105 transition-all"><Check size={24} /></button>
                    <button onClick={() => { setIsOpenEditing(false); setNewName(playlist.name); }} className="p-2 bg-white/10 rounded-full text-white hover:scale-105 transition-all"><X size={24} /></button>
                </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 group/title mb-6 max-w-full">
                <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter truncate max-w-full leading-[1.1] py-1">{playlist.name}</h1>
                {isOwner && (
                    <button 
                        onClick={() => setIsOpenEditing(true)}
                        className="opacity-0 group-hover/title:opacity-100 transition-all p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white shrink-0"
                    >
                        <Edit2 size={24} />
                    </button>
                )}
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm md:text-base font-bold text-white/90">
            <span className="hover:underline cursor-pointer">{playlist.owner?.username || 'User'}</span>
            <span className="text-white/40">•</span>
            <span>{playlist.songs?.length || 0} songs</span>
            {playlist.description && (
                <>
                    <span className="text-white/40">•</span>
                    <span className="text-white/60 font-normal truncate max-w-md">{playlist.description}</span>
                </>
            )}
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="px-4 md:px-8 py-6 md:py-8 flex items-center justify-between sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-md transition-all duration-300">
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={() => playlist.songs?.length > 0 && playSong(playlist.songs[0], playlist.songs)}
            className="w-14 h-14 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl text-black hover:bg-green-400"
          >
            <Play size={32} fill="black" stroke="black" className="ml-1" />
          </button>
          
          {isOwner && (
            <>
              <button 
                onClick={togglePrivacy}
                className="focus:outline-none hover:scale-110 active:scale-90 transition-all p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white"
                title={playlist.isPublic ? "Make Private" : "Make Public"}
              >
                {playlist.isPublic ? <Globe size={32} /> : <Lock size={32} />}
              </button>
              <button 
                  onClick={() => setDeleteModal({ isOpen: true, type: 'playlist', data: null })}
                  className="focus:outline-none hover:scale-110 active:scale-90 transition-all p-2 rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-500"
                  title="Delete Playlist"
              >
                  <Trash2 size={32} />
              </button>
            </>
          )}
          
          <button className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
            <MoreHorizontal size={32} />
          </button>
        </div>
      </div>

      {/* Song List */}
      <div className="px-2 md:px-8 mt-4">
        <div className="text-gray-500 text-[10px] md:text-xs font-black border-b border-white/5 pb-2 mb-4 grid grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-4 px-4 uppercase tracking-widest">
          <div className="flex justify-center">#</div>
          <div>Title</div>
          <div></div>
          <div className="flex justify-end"><Clock size={16} /></div>
        </div>

        <div className="flex flex-col gap-1">
          {playlist.songs?.map((music, index) => {
            const isLiked = likedSongs.includes(music._id);
            const isActive = currentSong?._id === music._id;
            const isRemoving = removingSongId === music._id;

            return (
              <div 
                key={music._id} 
                className={`group flex items-center grid grid-cols-[16px_minmax(0,1fr)_40px_120px] gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${isActive ? 'bg-white/10' : ''} ${isRemoving ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                onClick={() => playSong(music, playlist.songs)}
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
                  
                  {isOwner && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, type: 'song', data: music }); }}
                        className="opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90 text-gray-400 hover:text-red-500 p-1"
                        title="Remove from playlist"
                    >
                        {isRemoving ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-400 font-medium flex justify-end items-center w-20">
                  {music.duration > 0 
                    ? `${Math.floor(music.duration / 60)}:${(music.duration % 60).toString().padStart(2, '0')}` 
                    : "--:--"}
                </div>
              </div>
            );
          })}
          {(!playlist.songs || playlist.songs.length === 0) && (
            <div className="text-center py-20 text-gray-500 italic">This playlist is empty. Add some songs!</div>
          )}
        </div>
      </div>

      {/* Confirm Modals */}
      <ConfirmModal 
        isOpen={deleteModal.isOpen && deleteModal.type === 'playlist'}
        title="Delete Playlist"
        message={`Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeletePlaylist}
        onCancel={() => setDeleteModal({ isOpen: false, type: '', data: null })}
      />

      <ConfirmModal 
        isOpen={deleteModal.isOpen && deleteModal.type === 'song'}
        title="Remove from Playlist"
        message={`Remove "${deleteModal.data?.title}" from this playlist?`}
        confirmText="Remove"
        onConfirm={() => removeSongFromPlaylist(deleteModal.data?._id)}
        onCancel={() => setDeleteModal({ isOpen: false, type: '', data: null })}
      />
    </div>
  );
};

export default PlaylistDetails;
