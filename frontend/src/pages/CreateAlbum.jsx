import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const CreateAlbum = ({ currentUser }) => {
  const [title, setTitle] = useState('');
  const [musics, setMusics] = useState([]);
  const [selectedMusics, setSelectedMusics] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available musics so the artist can select them for the album
    const fetchMusics = async () => {
      try {
        const res = await axios.get('/api/music?limit=50'); // Fetch a large batch
        setMusics(res.data.musics || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (currentUser?.role === 'artist') {
      fetchMusics();
    }
  }, [currentUser]);

  // Redirect non-artists
  if (currentUser && currentUser.role !== 'artist') {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentUser={currentUser} />
        <div className="flex-1 flex items-center justify-center text-white">
          Access Denied. Only artists can create albums.
        </div>
      </div>
    );
  }

  const toggleMusicSelection = (musicId) => {
    if (selectedMusics.includes(musicId)) {
      setSelectedMusics(selectedMusics.filter(id => id !== musicId));
    } else {
      setSelectedMusics([...selectedMusics, musicId]);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!title) {
      setMessage('Please provide an album title.');
      return;
    }

    try {
      setLoading(true);
      setMessage('Creating album...');
      await axios.post('/api/music/album', {
        title,
        musics: selectedMusics
      });
      setMessage('Album created successfully!');
      setTitle('');
      setSelectedMusics([]);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create album');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar currentUser={currentUser} />
      
      <div className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Artist Dashboard</h2>
            <button 
              onClick={async () => {
                await axios.post('/api/auth/logout');
                navigate('/login');
              }}
              className="bg-black/50 hover:bg-black/80 text-white rounded-full py-2 px-4 border border-gray-600 text-sm font-bold transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="max-w-2xl bg-[#181818] p-8 rounded-lg shadow-xl">
            <h3 className="text-3xl font-bold text-white mb-2">Create New Album</h3>
            <p className="text-gray-400 mb-8">Group your songs into an album.</p>

            {message && (
              <div className={`p-4 rounded mb-6 text-sm font-bold ${message.includes('successfully') ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleCreateAlbum} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white">Album Title</label>
                <input 
                  className="bg-[#242424] border border-gray-600 rounded p-3 text-white focus:border-white focus:outline-none transition-colors"
                  type="text" 
                  placeholder="E.g. The Dark Side of the Moon" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white mb-2">Select Songs for Album</label>
                <div className="max-h-60 overflow-y-auto border border-gray-700 rounded p-4 bg-[#242424] flex flex-col gap-3">
                  {musics.length === 0 ? (
                    <p className="text-gray-400 text-sm">No songs available.</p>
                  ) : (
                    musics.map((music) => (
                      <label key={music._id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 accent-green-500 cursor-pointer"
                          checked={selectedMusics.includes(music._id)}
                          onChange={() => toggleMusicSelection(music._id)}
                        />
                        <span className="text-white group-hover:text-green-500 transition-colors">
                          {music.title} <span className="text-gray-500 text-sm">by {music.artist?.username || 'Unknown'}</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="mt-4 bg-green-500 hover:bg-green-600 disabled:bg-green-800 disabled:text-gray-400 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-full transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Creating...' : 'Create Album'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAlbum;
