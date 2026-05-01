import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, UploadCloud, Settings } from 'lucide-react';
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-lg border-t border-white/5 flex justify-around items-center py-3 z-50 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
        <Link to="/" className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive('/') ? 'text-white scale-110' : 'text-gray-400 hover:text-white'}`}>
          <Home size={22} fill={isActive('/') ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/search" className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive('/search') ? 'text-white scale-110' : 'text-gray-400 hover:text-white'}`}>
          <Search size={22} strokeWidth={isActive('/search') ? 3 : 2} />
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        <Link to="/library" className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive('/library') ? 'text-white scale-110' : 'text-gray-400 hover:text-white'}`}>
          <Library size={22} fill={isActive('/library') ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-medium">Library</span>
        </Link>
        <Link to="/liked" className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive('/liked') ? 'text-white scale-110' : 'text-gray-400 hover:text-white'}`}>
          <Heart size={22} fill={isActive('/liked') ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-medium">Liked</span>
        </Link>
      </div>
    </>
  );
};

export default Sidebar;
