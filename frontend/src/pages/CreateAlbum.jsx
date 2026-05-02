import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusSquare, Music, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';

const CreateAlbum = ({ currentUser }) => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [musics, setMusics] = useState([]);
  const [selectedMusics, setSelectedMusics] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available musics so the artist can select them for the album
    const fetchMusics = async () => {
      try {
        const res = await axios.get('/api/music?limit=100');
        // Only show musics that belong to the current artist
        const myId = currentUser.id || currentUser._id;
        const myMusics = res.data.musics.filter(m => 
          m.artist?._id === myId || m.artist === myId
        );
        setMusics(myMusics || []);
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
      <div className="flex-1 flex flex-col items-center justify-center text-white bg-[#121212] p-8 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} className="text-red-500" />
        </div>
        <h2 className="text-3xl font-black mb-4 tracking-tight">Access Denied</h2>
        <p className="text-gray-400 max-w-md">Only artists can create albums. If you're an artist, please ensure you're logged into the correct account.</p>
        <button onClick={() => navigate('/')} className="mt-8 bg-white text-black font-black py-3 px-8 rounded-full hover:scale-105 transition-all">Go Home</button>
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
    if (!title || !image) {
      setMessage('Please provide an album title and a cover image.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', image);
    formData.append('musics', JSON.stringify(selectedMusics));

    try {
      setLoading(true);
      setMessage('Creating album...');
      const token = localStorage.getItem('token');
      await axios.post('/api/music/album', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('Album created successfully!');
      setTitle('');
      setImage(null);
      setSelectedMusics([]);
      setTimeout(() => navigate('/library'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create album');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-purple-900/20 via-[#121212] to-[#121212] overflow-y-auto pb-48 md:pb-32">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Artist Dashboard</h2>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
              window.location.reload();
            }}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full py-2 px-6 sm:py-2.5 sm:px-8 border border-white/10 text-sm font-bold transition-all active:scale-95 shadow-lg"
          >
            Logout
          </button>
        </header>

        <div className="bg-white/5 backdrop-blur-xl p-6 md:p-10 rounded-2xl shadow-2xl border border-white/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <PlusSquare size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">Create Album</h3>
              <p className="text-gray-400">Curate your music into a cohesive collection.</p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-8 text-sm font-bold backdrop-blur-md border animate-in fade-in slide-in-from-top-4 duration-300 ${message.includes('successfully') ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleCreateAlbum} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-black text-white/70 uppercase tracking-widest ml-1">Album Title</label>
                <input 
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 focus:bg-white/10 focus:outline-none transition-all placeholder:text-gray-600"
                  type="text" 
                  placeholder="e.g. My Greatest Hits" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-black text-white/70 uppercase tracking-widest ml-1">Album Cover</label>
                <div className="relative group">
                  <input 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])} 
                    required 
                  />
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white flex items-center gap-3 group-hover:bg-white/10 transition-all">
                    <ImageIcon size={20} className="text-purple-500" />
                    <span className="text-sm truncate">{image ? image.name : 'Select Cover Image'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="text-sm font-black text-white/70 uppercase tracking-widest ml-1">Select Songs ({selectedMusics.length})</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {musics.length === 0 ? (
                  <div className="col-span-full py-10 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-gray-500 italic">No songs found. Upload some music first!</p>
                  </div>
                ) : (
                  musics.map((music) => {
                    const isSelected = selectedMusics.includes(music._id);
                    return (
                      <div 
                        key={music._id} 
                        onClick={() => toggleMusicSelection(music._id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 group ${isSelected ? 'bg-purple-500/20 border-purple-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}
                      >
                        <div className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-purple-500 border-purple-500' : 'bg-transparent border-white/20 group-hover:border-white/40'}`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>{music.title}</p>
                          <p className="text-xs text-gray-500 truncate">Song</p>
                        </div>
                        <Music size={16} className={isSelected ? 'text-purple-400' : 'text-gray-600'} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || !title || !image}
              className="mt-4 bg-purple-500 hover:bg-purple-400 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed text-white font-black py-3 sm:py-4 rounded-full transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20 active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Collection...</span>
                </>
              ) : (
                <>
                  <PlusSquare size={20} />
                  <span>Create Album</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAlbum;
