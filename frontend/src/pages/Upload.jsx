import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Music, AlertCircle } from 'lucide-react';

const Upload = ({ currentUser }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [albumId, setAlbumId] = useState('');
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtistAlbums = async () => {
      if (currentUser?.role === 'artist') {
        try {
          const res = await axios.get('/api/music/albums');
          // Filter down to only albums created by this artist
          const myId = currentUser.id || currentUser._id;
          const myAlbums = res.data.albums.filter(a => 
            a.artist?._id === myId || a.artist === myId
          );
          setArtistAlbums(myAlbums);
        } catch (err) {
          console.error('Failed to fetch albums', err);
        }
      }
    };
    fetchArtistAlbums();
  }, [currentUser]);

  // Redirect non-artists
  if (currentUser && currentUser.role !== 'artist') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white bg-[#121212] p-8 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} className="text-red-500" />
        </div>
        <h2 className="text-3xl font-black mb-4 tracking-tight">Access Denied</h2>
        <p className="text-gray-400 max-w-md">Only artists can upload music. If you're an artist, please ensure you're logged into the correct account.</p>
        <button onClick={() => navigate('/')} className="mt-8 bg-white text-black font-black py-3 px-8 rounded-full hover:scale-105 transition-all">Go Home</button>
      </div>
    );
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setMessage('Please provide both a title and an audio file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('music', file);
    if (albumId) {
      formData.append('albumId', albumId);
    }

    try {
      setLoading(true);
      setMessage('Uploading... This might take a moment.');
      await axios.post('/api/music/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (albumId) {
        navigate(`/album/${albumId}`);
      } else {
        setMessage('Song uploaded successfully!');
        setTitle('');
        setFile(null);
        setAlbumId('');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to upload song');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-orange-900/20 via-[#121212] to-[#121212] overflow-y-auto pb-48 md:pb-32">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Artist Dashboard</h2>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
              window.location.reload();
            }}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full py-2.5 px-8 border border-white/10 text-sm font-bold transition-all active:scale-95 shadow-lg"
          >
            Logout
          </button>
        </header>

        <div className="bg-white/5 backdrop-blur-xl p-6 md:p-10 rounded-2xl shadow-2xl border border-white/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <UploadCloud size={32} className="text-black" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">Upload a Song</h3>
              <p className="text-gray-400">Share your latest masterpiece with the world.</p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-8 text-sm font-bold backdrop-blur-md border animate-in fade-in slide-in-from-top-4 duration-300 ${message.includes('successfully') ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpload} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-black text-white/70 uppercase tracking-widest ml-1">Song Title</label>
                <input 
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 focus:bg-white/10 focus:outline-none transition-all placeholder:text-gray-600"
                  type="text" 
                  placeholder="e.g. Moonlight Sonata" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-black text-white/70 uppercase tracking-widest ml-1">Add to Album</label>
                <select 
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 focus:bg-white/10 focus:outline-none transition-all appearance-none"
                  value={albumId}
                  onChange={(e) => setAlbumId(e.target.value)}
                >
                  <option value="" className="bg-[#121212]">Single (No Album)</option>
                  {artistAlbums.map(album => (
                    <option key={album._id} value={album._id} className="bg-[#121212]">
                      {album.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="text-sm font-black text-white/70 uppercase tracking-widest ml-1">Audio File</label>
              <div className="relative group">
                <input 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  type="file" 
                  accept="audio/*"
                  onChange={(e) => setFile(e.target.files[0])} 
                  required 
                />
                <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 group-hover:bg-white/10 group-hover:border-green-500/50 transition-all duration-300">
                  <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-gray-400 group-hover:text-green-500 group-hover:scale-110 transition-all duration-300">
                    <Music size={28} />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">{file ? file.name : 'Click to select or drag and drop'}</p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black">MP3, WAV, AAC (Max 50MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="mt-4 bg-green-500 hover:bg-green-400 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed text-black font-black py-4 rounded-full transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>Uploading to Servers...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={20} />
                  <span>Publish Song</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
