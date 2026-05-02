import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, UploadCloud, Settings, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ currentUser }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children, active }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-4 transition-all duration-300 cursor-pointer py-2 px-3 rounded-lg ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
      <Icon size={24} />
      <span className="font-bold hidden lg:inline">{children}</span>
    </Link>
  );

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
          <p className="hover:text-white cursor-pointer truncate transition-colors">Chill Vibes</p>
          <p className="hover:text-white cursor-pointer truncate transition-colors">Focus</p>
          <p className="hover:text-white cursor-pointer truncate transition-colors">Workout Mix</p>
          <p className="hover:text-white cursor-pointer truncate transition-colors">Discover Weekly</p>
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
    </>
  );
};

export default Sidebar;
