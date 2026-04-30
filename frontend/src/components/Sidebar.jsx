import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, UploadCloud } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ currentUser }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children, active }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-4 transition-colors cursor-pointer ${active ? 'text-white' : 'text-gray-400 hover:text-white'}`}
    >
      <Icon size={24} />
      <span className="font-bold hidden lg:inline">{children}</span>
    </Link>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-20 lg:w-64 bg-black h-full flex flex-col p-4 lg:p-6 text-gray-300 hidden md:flex border-r border-gray-800">
        <div className="mb-8 lg:px-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/spotify.svg" className="w-8 h-8" alt="Spotify Logo" />
            <h1 className="text-xl font-bold text-white hidden lg:inline">Spotify Clone</h1>
          </Link>
        </div>
        
        <nav className="space-y-6 mb-8 lg:px-2">
          <NavLink to="/" icon={Home} active={isActive('/')}>Home</NavLink>
          <NavLink to="/search" icon={Search} active={isActive('/search')}>Search</NavLink>
          <NavLink to="/library" icon={Library} active={isActive('/library')}>Your Library</NavLink>
        </nav>

        <div className="space-y-6 mb-8 border-t border-gray-800 pt-6 lg:px-2">
          {currentUser?.role === 'artist' && (
            <NavLink to="/create-album" icon={PlusSquare} active={isActive('/create-album')}>Create Album</NavLink>
          )}
          <NavLink to="/liked" icon={Heart} active={isActive('/liked')}>Liked Songs</NavLink>
          {currentUser?.role === 'artist' && (
            <NavLink to="/upload" icon={UploadCloud} active={isActive('/upload')}>Upload Song</NavLink>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 text-sm lg:px-2 hidden lg:block">
          <p className="hover:text-white cursor-pointer truncate">Chill Vibes</p>
          <p className="hover:text-white cursor-pointer truncate">Focus</p>
          <p className="hover:text-white cursor-pointer truncate">Workout Mix</p>
          <p className="hover:text-white cursor-pointer truncate">Discover Weekly</p>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-gray-800 flex justify-around items-center py-3 z-50 px-2">
        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-white' : 'text-gray-400'}`}>
          <Home size={22} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/search" className={`flex flex-col items-center gap-1 ${isActive('/search') ? 'text-white' : 'text-gray-400'}`}>
          <Search size={22} />
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        <Link to="/library" className={`flex flex-col items-center gap-1 ${isActive('/library') ? 'text-white' : 'text-gray-400'}`}>
          <Library size={22} />
          <span className="text-[10px] font-medium">Library</span>
        </Link>
        <Link to="/liked" className={`flex flex-col items-center gap-1 ${isActive('/liked') ? 'text-white' : 'text-gray-400'}`}>
          <Heart size={22} />
          <span className="text-[10px] font-medium">Liked</span>
        </Link>
      </div>
    </>
  );
};

export default Sidebar;
