import React, { useState } from 'react';
import { Home, Search, Library, PlusSquare, Heart, UploadCloud, Settings, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';

const Sidebar = ({ currentUser, playlists, fetchPlaylists }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, playlistId: null, playlistName: '' });

  const NavLink = ({ to, icon: Icon, children, active }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-4 transition-all duration-300 cursor-pointer py-2 px-3 rounded-lg ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
      <Icon size={24} />
      <span className="font-bold hidden lg:inline">{children}</span>
    </Link>
  );

  const createPlaylist = async () => {
    try {
      const name = `My Playlist #${(playlists?.length || 0) + 1}`;
      const res = await axios.post('/api/playlist', { name });
      fetchPlaylists();
      navigate(`/playlist/${res.data.playlist._id}`);
    } catch (err) {
      console.error("Failed to create playlist", err);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!deleteModal.playlistId) return;
    try {
      await axios.delete(`/api/playlist/${deleteModal.playlistId}`);
      fetchPlaylists();
      if (location.pathname === `/playlist/${deleteModal.playlistId}`) {
        navigate('/library');
      }
    } catch (err) {
      console.error("Failed to delete playlist", err);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-20 lg:w-64 bg-black/40 backdrop-blur-xl h-full flex flex-col p-4 lg:p-6 text-gray-300 hidden md:flex border-r border-white/5">
        <div className="mb-8 lg:px-2">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/spotify.svg" className="w-8 h-8" alt="Spotify Logo" />
            <h1 className="text-xl font-bold text-white hidden lg:inline tracking-tight">Spotify Clone</h1>
          </Link>
        </div>
        
        <nav className="space-y-2 mb-8 lg:px-2">
          <NavLink to="/" icon={Home} active={isActive('/')}>Home</NavLink>
          <NavLink to="/search" icon={Search} active={isActive('/search')}>Search</NavLink>
          <NavLink to="/library" icon={Library} active={isActive('/library')}>Your Library</NavLink>
        </nav>

        <div className="space-y-2 mb-8 border-t border-white/5 pt-6 lg:px-2">
          <button 
            onClick={createPlaylist}
            className="flex items-center gap-4 transition-all duration-300 cursor-pointer py-2 px-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 w-full text-left"
          >
            <div className="bg-gray-400/20 p-1 rounded-sm group-hover:bg-white/10 transition-colors">
                <Plus size={20} />
            </div>
            <span className="font-bold hidden lg:inline">Create Playlist</span>
          </button>

          {currentUser?.role === 'artist' && (
            <NavLink to="/create-album" icon={PlusSquare} active={isActive('/create-album')}>Create Album</NavLink>
          )}
          <NavLink to="/liked" icon={Heart} active={isActive('/liked')}>Liked Songs</NavLink>
          
          {currentUser?.role === 'admin' && (
            <NavLink to="/manage-content" icon={ShieldCheck} active={isActive('/manage-content')}>Admin Panel</NavLink>
          )}

          {currentUser?.role === 'artist' && (
            <>
              <NavLink to="/upload" icon={UploadCloud} active={isActive('/upload')}>Upload Song</NavLink>
              <NavLink to="/manage-content" icon={Settings} active={isActive('/manage-content')}>Manage Content</NavLink>
            </>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 text-sm lg:px-2 hidden lg:block scrollbar-hide">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Playlists</p>
          <div className="flex flex-col gap-2">
            {playlists?.map((playlist) => (
              <div key={playlist._id} className="group relative flex items-center min-w-0">
                <Link 
                    to={`/playlist/${playlist._id}`}
                    className={`flex-1 hover:text-white cursor-pointer truncate transition-colors py-1.5 min-w-0 pr-2 ${isActive(`/playlist/${playlist._id}`) ? 'text-white font-bold' : 'text-gray-400'}`}
                >
                    {playlist.name}
                </Link>
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteModal({ isOpen: true, playlistId: playlist._id, playlistName: playlist.name });
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 transition-all shrink-0"
                    title="Delete Playlist"
                >
                    <Trash2 size={14} />
                </button>
              </div>
            ))}
            {(!playlists || playlists.length === 0) && (
              <p className="text-xs text-gray-500 italic py-2">No playlists yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Enhanced UI */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-gradient-to-t from-black via-black/95 to-black/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center z-[100] px-4 pb-safe">
        <Link to="/" className={`flex flex-col items-center justify-center gap-1.5 w-16 transition-all duration-300 ${isActive('/') ? 'text-white' : 'text-gray-500'}`}>
          <div className={`p-1 rounded-full transition-all ${isActive('/') ? 'scale-110' : ''}`}>
            <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-bold tracking-tight ${isActive('/') ? 'opacity-100' : 'opacity-60'}`}>Home</span>
        </Link>
        
        <Link to="/search" className={`flex flex-col items-center justify-center gap-1.5 w-16 transition-all duration-300 ${isActive('/search') ? 'text-white' : 'text-gray-500'}`}>
          <div className={`p-1 rounded-full transition-all ${isActive('/search') ? 'scale-110' : ''}`}>
            <Search size={24} strokeWidth={isActive('/search') ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-bold tracking-tight ${isActive('/search') ? 'opacity-100' : 'opacity-60'}`}>Search</span>
        </Link>
        
        <Link to="/library" className={`flex flex-col items-center justify-center gap-1.5 w-16 transition-all duration-300 ${isActive('/library') ? 'text-white' : 'text-gray-500'}`}>
          <div className={`p-1 rounded-full transition-all ${isActive('/library') ? 'scale-110' : ''}`}>
            <Library size={24} strokeWidth={isActive('/library') ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-bold tracking-tight ${isActive('/library') ? 'opacity-100' : 'opacity-60'}`}>Library</span>
        </Link>
        
        <Link to="/liked" className={`flex flex-col items-center justify-center gap-1.5 w-16 transition-all duration-300 ${isActive('/liked') ? 'text-white' : 'text-gray-500'}`}>
          <div className={`p-1 rounded-full transition-all ${isActive('/liked') ? 'scale-110' : ''}`}>
            <Heart size={24} strokeWidth={isActive('/liked') ? 2.5 : 2} fill={isActive('/liked') ? 'currentColor' : 'none'} />
          </div>
          <span className={`text-[10px] font-bold tracking-tight ${isActive('/liked') ? 'opacity-100' : 'opacity-60'}`}>Liked</span>
        </Link>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        title="Delete Playlist"
        message={`Delete "${deleteModal.playlistName}"? This action cannot be undone.`}
        onConfirm={handleDeletePlaylist}
        onCancel={() => setDeleteModal({ isOpen: false, playlistId: null, playlistName: '' })}
      />
    </>
  );
};

export default Sidebar;
