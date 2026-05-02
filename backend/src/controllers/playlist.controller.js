const playlistModel = require('../models/playlist.model');
const musicModel = require('../models/music.model');

async function createPlaylist(req, res) {
    try {
        const { name, description, isPublic } = req.body;
        const userId = req.user.id;

        const playlist = await playlistModel.create({
            name,
            description,
            isPublic: isPublic !== undefined ? isPublic : true,
            owner: userId,
            songs: []
        });

        res.status(201).json({
            message: "Playlist created successfully",
            playlist
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to create playlist", error: err.message });
    }
}

async function getUserPlaylists(req, res) {
    try {
        const userId = req.user.id;
        const playlists = await playlistModel.find({ owner: userId }).populate('songs');
        res.status(200).json({ playlists });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch playlists", error: err.message });
    }
}

async function getPlaylistById(req, res) {
    try {
        const { playlistId } = req.params;
        const playlist = await playlistModel.findById(playlistId)
            .populate('owner', 'username')
            .populate({
                path: 'songs',
                populate: { path: 'artist', select: 'username' }
            });

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        // Check if playlist is private and user is not the owner
        const userId = req.user?.id;
        if (!playlist.isPublic && playlist.owner?._id.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json({ playlist });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch playlist", error: err.message });
    }
}

async function updatePlaylist(req, res) {
    try {
        const { playlistId } = req.params;
        const { name, description, isPublic } = req.body;
        const userId = req.user.id;

        const playlist = await playlistModel.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.owner.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this playlist" });
        }

        playlist.name = name || playlist.name;
        playlist.description = description !== undefined ? description : playlist.description;
        playlist.isPublic = isPublic !== undefined ? isPublic : playlist.isPublic;

        await playlist.save();

        // Return fully populated for smooth state updates
        const updatedPlaylist = await playlistModel.findById(playlistId)
            .populate('owner', 'username')
            .populate({
                path: 'songs',
                populate: { path: 'artist', select: 'username' }
            });

        res.status(200).json({ message: "Playlist updated successfully", playlist: updatedPlaylist });
    } catch (err) {
        res.status(500).json({ message: "Failed to update playlist", error: err.message });
    }
}

async function deletePlaylist(req, res) {
    try {
        const { playlistId } = req.params;
        const userId = req.user.id;

        const playlist = await playlistModel.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.owner.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized to delete this playlist" });
        }

        await playlistModel.findByIdAndDelete(playlistId);
        res.status(200).json({ message: "Playlist deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete playlist", error: err.message });
    }
}

async function addSongToPlaylist(req, res) {
    try {
        const { playlistId, musicId } = req.params;
        const userId = req.user.id;

        const playlist = await playlistModel.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.owner.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Safer ID check
        const isSongInPlaylist = playlist.songs.some(id => id.toString() === musicId);
        if (isSongInPlaylist) {
            return res.status(400).json({ message: "Song already in playlist" });
        }

        playlist.songs.push(musicId);
        await playlist.save();

        // FULL POPULATION FIX: Populate nested artist for smooth UI
        const updatedPlaylist = await playlistModel.findById(playlistId)
            .populate('owner', 'username')
            .populate({
                path: 'songs',
                populate: { path: 'artist', select: 'username' }
            });

        res.status(200).json({ message: "Song added to playlist", playlist: updatedPlaylist });
    } catch (err) {
        res.status(500).json({ message: "Failed to add song", error: err.message });
    }
}

async function removeSongFromPlaylist(req, res) {
    try {
        const { playlistId, musicId } = req.params;
        const userId = req.user.id;

        const playlist = await playlistModel.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.owner.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        playlist.songs = playlist.songs.filter(id => id.toString() !== musicId);
        await playlist.save();

        // FULL POPULATION FIX: Ensure artist is populated
        const updatedPlaylist = await playlistModel.findById(playlistId)
            .populate('owner', 'username')
            .populate({
                path: 'songs',
                populate: { path: 'artist', select: 'username' }
            });

        res.status(200).json({ message: "Song removed from playlist", playlist: updatedPlaylist });
    } catch (err) {
        res.status(500).json({ message: "Failed to remove song", error: err.message });
    }
}

async function getPublicPlaylists(req, res) {
    try {
        const playlists = await playlistModel.find({ isPublic: true })
            .populate('owner', 'username')
            .limit(20);
        res.status(200).json({ playlists });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch public playlists", error: err.message });
    }
}

module.exports = {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    getPublicPlaylists
};
