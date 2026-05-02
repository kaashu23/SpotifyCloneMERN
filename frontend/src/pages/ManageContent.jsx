import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Music, Disc, Loader2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const ManageContent = ({ currentUser }) => {
  const [content, setContent] = useState({ albums: [], musics: [] });
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: '', data: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchContent = async () => {
    try {
      const endpoint = currentUser.role === 'admin' ? '/api/music/admin/all' : '/api/music/artist/all';
      const res = await axios.get(endpoint);
      setContent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchContent();
    }
  }, [currentUser]);

  const handleDeleteMusic = async (musicId) => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/music/${musicId}`);
      fetchContent();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/music/album/${albumId}`);
      fetchContent();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#121212]">
      <div className="w-12 h-12 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-8 bg-[#121212] min-h-screen text-white pb-32">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tight">Manage Your Content</h1>
        <p className="text-gray-400 mt-2">View and manage the songs and albums you've uploaded.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Songs Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Music className="text-green-500" />
            <h2 className="text-2xl font-bold">Your Songs</h2>
          </div>
          <div className="space-y-3">
            {content.musics.map((music) => (
              <div key={music._id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-all border border-white/5">
                <div className="flex items-center gap-4 min-w-0">
                  <img src={music.image} alt={music.title} className="w-12 h-12 object-cover rounded shadow-lg" />
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">{music.title}</h3>
                    {currentUser.role === 'admin' && <p className="text-xs text-gray-400 truncate">Artist: {music.artist?.username}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors"><Edit size={18} /></button>
                  <button 
                    onClick={() => setDeleteModal({ isOpen: true, type: 'song', data: music })}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {content.musics.length === 0 && <p className="text-gray-500 italic">No songs found.</p>}
          </div>
        </section>

        {/* Albums Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Disc className="text-green-500" />
            <h2 className="text-2xl font-bold">Your Albums</h2>
          </div>
          <div className="space-y-3">
            {content.albums.map((album) => (
              <div key={album._id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-all border border-white/5">
                <div className="flex items-center gap-4 min-w-0">
                  <img src={album.image} alt={album.title} className="w-12 h-12 object-cover rounded shadow-lg" />
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">{album.title}</h3>
                    <p className="text-xs text-gray-400">{album.musics?.length || 0} songs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors"><Edit size={18} /></button>
                  <button 
                    onClick={() => setDeleteModal({ isOpen: true, type: 'album', data: album })}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {content.albums.length === 0 && <p className="text-gray-500 italic">No albums found.</p>}
          </div>
        </section>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        title={deleteModal.type === 'song' ? 'Delete Song' : 'Delete Album'}
        message={deleteModal.type === 'song' 
          ? `Are you sure you want to delete "${deleteModal.data?.title}"? This cannot be undone.` 
          : `Are you sure you want to delete "${deleteModal.data?.title}"? The songs inside will not be deleted.`}
        onConfirm={() => deleteModal.type === 'song' ? handleDeleteMusic(deleteModal.data?._id) : handleDeleteAlbum(deleteModal.data?._id)}
        onCancel={() => setDeleteModal({ isOpen: false, type: '', data: null })}
      />
    </div>
  );
};

export default ManageContent;
