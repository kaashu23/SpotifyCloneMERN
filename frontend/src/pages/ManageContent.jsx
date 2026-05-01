import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2, Image as ImageIcon, Music, Layout, AlertCircle, Check } from 'lucide-react';

const ManageContent = ({ currentUser }) => {
  const [content, setContent] = useState({ albums: [], musics: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/music/artist/content', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setContent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'artist') {
      fetchContent();
    } else if (currentUser) {
      navigate('/');
    }
  }, [currentUser]);

  const handleDeleteSong = async (id) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/music/song/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage('Song deleted successfully!');
      fetchContent();
    } catch (err) {
      setMessage('Failed to delete song');
    }
  };

  const handleUpdateAlbumImage = async (albumId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/music/album/image/${albumId}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Album image updated!');
      fetchContent();
    } catch (err) {
      setMessage('Failed to update album image');
    }
  };

  const handleUpdateSongImage = async (musicId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/music/song/image/${musicId}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Song image updated!');
      fetchContent();
    } catch (err) {
      setMessage('Failed to update song image');
    }
  };

  if (loading) return (
    <div className="flex-1 flex h-full bg-[#121212] items-center justify-center">
       <div className="w-12 h-12 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 via-[#121212] to-[#121212] overflow-y-auto pb-48 md:pb-32">
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <header className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Manage Your Content</h2>
          <p className="text-gray-400 mt-2">Update artwork or remove songs from your catalog.</p>
        </header>

        {message && (
          <div className="p-4 rounded-xl mb-8 bg-white/5 border border-white/10 text-green-500 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <Check size={20} />
            <span className="font-bold">{message}</span>
            <button onClick={() => setMessage('')} className="ml-auto text-gray-500 hover:text-white">✕</button>
          </div>
        )}

        <div className="space-y-16">
          {/* Albums Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Layout className="text-purple-500" size={28} />
              <h3 className="text-2xl font-black text-white">Your Albums</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.albums.map(album => (
                <div key={album._id} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-2xl">
                    <img src={album.image} alt={album.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-black font-bold py-2 px-4 rounded-full hover:scale-105 transition-all text-sm flex items-center gap-2">
                        <ImageIcon size={16} />
                        Change Cover
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpdateAlbumImage(album._id, e.target.files[0])} />
                      </label>
                    </div>
                  </div>
                  <h4 className="font-bold text-white text-lg truncate">{album.title}</h4>
                  <p className="text-gray-500 text-sm">{album.musics.length} songs</p>
                </div>
              ))}
              {content.albums.length === 0 && <p className="text-gray-500 italic">No albums created yet.</p>}
            </div>
          </section>

          {/* Songs Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Music className="text-green-500" size={28} />
              <h3 className="text-2xl font-black text-white">Your Songs</h3>
            </div>
            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                    <th className="p-5 font-black">#</th>
                    <th className="p-5 font-black">Song</th>
                    <th className="p-5 font-black">Artwork</th>
                    <th className="p-5 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {content.musics.map((music, idx) => (
                    <tr key={music._id} className="hover:bg-white/5 transition-all border-b border-white/5 last:border-0 group">
                      <td className="p-5 text-gray-500 text-sm">{idx + 1}</td>
                      <td className="p-5">
                        <p className="font-bold text-white text-sm">{music.title}</p>
                        <p className="text-gray-500 text-xs">Single</p>
                      </td>
                      <td className="p-5">
                        <div className="relative w-12 h-12 rounded overflow-hidden group-artwork">
                          <img src={music.image} alt="" className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                            <ImageIcon size={14} className="text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpdateSongImage(music._id, e.target.files[0])} />
                          </label>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => handleDeleteSong(music._id)}
                          className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all active:scale-90"
                          title="Delete Song"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {content.musics.length === 0 && <div className="p-10 text-center text-gray-500 italic">No songs uploaded yet.</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ManageContent;
