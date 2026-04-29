import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

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
          // Filter down to only albums created by this artist, assuming the backend doesn't filter it for us.
          // Wait, the backend returns all albums. We need to filter where artist._id === currentUser.id
          // Actually res.data.albums populates artist, so album.artist._id
          const myAlbums = res.data.albums.filter(a => 
            a.artist?._id === currentUser.id || a.artist === currentUser.id
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
      <div className="flex h-screen bg-black">
        <Sidebar currentUser={currentUser} />
        <div className="flex-1 flex items-center justify-center text-white">
          Access Denied. Only artists can upload music.
        </div>
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
            <h3 className="text-3xl font-bold text-white mb-2">Upload a Song</h3>
            <p className="text-gray-400 mb-8">Share your music with the world.</p>

            {message && (
              <div className={`p-4 rounded mb-6 text-sm font-bold ${message.includes('successfully') ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleUpload} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white">Song Title</label>
                <input 
                  className="bg-[#242424] border border-gray-600 rounded p-3 text-white focus:border-white focus:outline-none transition-colors"
                  type="text" 
                  placeholder="E.g. Shape of You" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white">Audio File (MP3, WAV)</label>
                <input 
                  className="bg-[#242424] border border-gray-600 rounded p-3 text-white focus:border-white focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-black hover:file:bg-green-600 cursor-pointer"
                  type="file" 
                  accept="audio/*"
                  onChange={(e) => setFile(e.target.files[0])} 
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white">Add to Album (Optional)</label>
                <select 
                  className="bg-[#242424] border border-gray-600 rounded p-3 text-white focus:border-white focus:outline-none transition-colors"
                  value={albumId}
                  onChange={(e) => setAlbumId(e.target.value)}
                >
                  <option value="">-- Do not add to any album --</option>
                  {artistAlbums.map(album => (
                    <option key={album._id} value={album._id}>
                      {album.title}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="mt-4 bg-green-500 hover:bg-green-600 disabled:bg-green-800 disabled:text-gray-400 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-full transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Uploading...' : 'Upload to Spotify'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
