import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({ currentUser }) => {
  return (
    <div className="w-64 bg-black h-full flex flex-col p-6 text-gray-300 hidden md:flex">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <img src="/spotify.svg" className="w-8 h-8" alt="Spotify Logo" />
          Spotify Clone
        </h1>
      </div>
      
      <nav className="space-y-4 mb-8">
        <Link to="/" className="flex items-center gap-4 text-white hover:text-white transition-colors cursor-pointer">
          <Home size={24} />
          <span className="font-bold">Home</span>
        </Link>
        <Link to="/search" className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors cursor-pointer">
          <Search size={24} />
          <span className="font-bold">Search</span>
        </Link>
        <Link to="/library" className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors cursor-pointer">
          <Library size={24} />
          <span className="font-bold">Your Library</span>
        </Link>
      </nav>

      <div className="space-y-4 mb-8 border-b border-gray-800 pb-4">
        {currentUser?.role === 'artist' && (
          <Link to="/create-album" className="flex items-center gap-4 hover:text-white transition-colors cursor-pointer">
            <div className="bg-gray-300 text-black p-1 rounded-sm">
              <PlusSquare size={20} />
            </div>
            <span className="font-bold">Create Album</span>
          </Link>
        )}
        <Link to="/liked" className="flex items-center gap-4 hover:text-white transition-colors cursor-pointer">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-400 text-white p-1 rounded-sm">
            <Heart size={20} />
          </div>
          <span className="font-bold">Liked Songs</span>
        </Link>
        {currentUser?.role === 'artist' && (
          <Link to="/upload" className="flex items-center gap-4 hover:text-white transition-colors cursor-pointer">
            <div className="bg-green-500 text-black p-1 rounded-sm">
              <UploadCloud size={20} />
            </div>
            <span className="font-bold">Upload Song</span>
          </Link>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 text-sm">
        <p className="hover:text-white cursor-pointer">Chill Vibes</p>
        <p className="hover:text-white cursor-pointer">Focus</p>
        <p className="hover:text-white cursor-pointer">Workout Mix</p>
        <p className="hover:text-white cursor-pointer">Top 50 - Global</p>
        <p className="hover:text-white cursor-pointer">Discover Weekly</p>
      </div>
    </div>
  );
};

export default Sidebar;
