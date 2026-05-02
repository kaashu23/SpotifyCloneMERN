import React, { useState } from 'react';
import { Plus, Check, Music, Loader2 } from 'lucide-react';
import axios from 'axios';

const PlaylistMenu = ({ musicId, playlists, updatePlaylistInState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingPlaylistId, setLoadingPlaylistId] = useState(null);

  const addToPlaylist = async (playlistId) => {
    try {
      setLoadingPlaylistId(playlistId);
      const res = await axios.post(`/api/playlist/${playlistId}/songs/${musicId}`);
      
      if (updatePlaylistInState) {
        updatePlaylistInState(res.data.playlist);
      }
      
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to add song to playlist", err);
      alert(err.response?.data?.message || "Failed to add song");
    } finally {
      setLoadingPlaylistId(null);
    }
  };

  // Check if song is in ANY of the user's playlists for the main icon state
  const isInAnyPlaylist = playlists?.some(playlist => 
    playlist.songs?.some(s => {
        const id = typeof s === 'string' ? s : s._id;
        return id === musicId;
    })
  );

  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`transition-all p-1 rounded-full hover:bg-white/10 ${isOpen ? 'opacity-100 bg-white/10 text-white' : 'opacity-0 group-hover:opacity-100'} ${isInAnyPlaylist ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
        title={isInAnyPlaylist ? "In Playlists" : "Add to Playlist"}
      >
        {isInAnyPlaylist ? <Check size={18} strokeWidth={3} /> : <Plus size={18} />}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          ></div>
          <div 
            className="absolute bottom-full right-0 mb-2 w-56 bg-[#282828] border border-white/10 rounded shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/5">Add to Playlist</p>
            <div className="max-h-60 overflow-y-auto">
              {playlists?.map((playlist) => {
                const isAlreadyIn = playlist.songs?.some(s => {
                    const id = typeof s === 'string' ? s : s._id;
                    return id === musicId;
                });
                const isLoading = loadingPlaylistId === playlist._id;

                return (
                  <button
                    key={playlist._id}
                    disabled={isAlreadyIn || isLoading}
                    onClick={() => addToPlaylist(playlist._id)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 flex items-center justify-between group/item transition-colors ${isAlreadyIn ? 'text-gray-500 cursor-default' : 'text-gray-200'}`}
                  >
                    <span className="truncate pr-2">{playlist.name}</span>
                    {isLoading ? (
                        <Loader2 size={14} className="animate-spin text-green-500" />
                    ) : isAlreadyIn ? (
                        <Check size={14} className="text-green-500" />
                    ) : (
                        <Plus size={14} className="opacity-0 group-hover/item:opacity-100 text-gray-400" />
                    )}
                  </button>
                );
              })}
              {(!playlists || playlists.length === 0) && (
                <div className="px-4 py-6 text-center">
                    <Music size={24} className="mx-auto mb-2 text-gray-600 opacity-20" />
                    <p className="text-xs text-gray-500 italic">No playlists found</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlaylistMenu;
