const express = require('express');
const router = express.Router();
const { authUser } = require('../middlewaares/auth.middleware');
const {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    getPublicPlaylists
} = require('../controllers/playlist.controller');

router.post('/', authUser, createPlaylist);
router.get('/user', authUser, getUserPlaylists);
router.get('/public', getPublicPlaylists);
router.get('/:playlistId', authUser, getPlaylistById);
router.put('/:playlistId', authUser, updatePlaylist);
router.delete('/:playlistId', authUser, deletePlaylist);
router.post('/:playlistId/songs/:musicId', authUser, addSongToPlaylist);
router.delete('/:playlistId/songs/:musicId', authUser, removeSongFromPlaylist);

module.exports = router;
