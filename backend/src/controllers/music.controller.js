const musicModel = require('../models/music.model');
const jwt = require('jsonwebtoken');
const { uploadFile } = require('../services/storage.service')
const albumModel = require('../models/album.model');

async function createMusic(req, res) {

    const { title, albumId } = req.body;
    const file = req.file;

    const result = await uploadFile(file.buffer.toString('base64'))


    const music = await musicModel.create({
        uri: result.url,
        title,
        artist: req.user.id
    })

    if (albumId) {
        const album = await albumModel.findById(albumId);
        // Verify the album belongs to the current artist before modifying
        if (album && album.artist.toString() === req.user.id) {
            album.musics.push(music._id);
            await album.save();
        }
    }

    res.status(201).json({
        message: "Music Created Succesfully",
        music: {
            id: music._id,
            uri: music.uri,
            title: music.title,
            artist: music.artist
        }
    })


}


async function createAlbum(req, res) {

    const { title, musics } = req.body;

    const album = await albumModel.create({
        title,
        artist: req.user.id,
        musics: musics

    })


    res.status(201).json({
        message: "Album Created Successfully",
        album: {
            id: album._id,
            title: album.title,
            artist: album.artist,
            musics: album.musics
        }
    })

}


async function getAllMusics(req, res) {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const musics = await musicModel
    .find()
    .skip(skip)
    .limit(limit)
    .populate("artist");

    res.status(200).json({
        message: "Musics Fetched Successfully",
        musics: musics
    })

}

async function getAllAlbums(req, res) {
    const searchQuery = req.query.search;
    let filter = {};
    if (searchQuery) {
        filter.title = { $regex: searchQuery, $options: 'i' };
    }

    const albums = await albumModel.find(filter).select("title artist").populate("artist")
    res.status(200).json({
        message: "Album Fetched Successfully",
        albums: albums
    })
}

async function getAlbumById(req, res) {
    const albumId = req.params.albumId;

    const album = await albumModel.findById(albumId).populate("artist").populate("musics")

    return res.status(200).json({
        message: "Album Fetched Successfully",
        album: album
    })
}

const userModel = require('../models/user.model');

async function toggleLikeSong(req, res) {
    const musicId = req.params.musicId;
    const userId = req.user.id;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isLiked = user.likedSongs.some(id => id.toString() === musicId.toString());
        if (isLiked) {
            user.likedSongs = user.likedSongs.filter(id => id.toString() !== musicId.toString());
        } else {
            user.likedSongs.push(musicId);
        }

        await user.save();

        res.status(200).json({
            message: isLiked ? "Song unliked" : "Song liked",
            likedSongs: user.likedSongs
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

async function getLikedSongs(req, res) {
    const userId = req.user.id;
    try {
        const user = await userModel.findById(userId).populate({
            path: 'likedSongs',
            populate: { path: 'artist' }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "Liked songs fetched",
            likedSongs: user.likedSongs
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

async function toggleSaveAlbum(req, res) {
    const albumId = req.params.albumId;
    const userId = req.user.id;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isSaved = user.savedAlbums.some(id => id.toString() === albumId.toString());
        if (isSaved) {
            user.savedAlbums = user.savedAlbums.filter(id => id.toString() !== albumId.toString());
        } else {
            user.savedAlbums.push(albumId);
        }

        await user.save();

        res.status(200).json({
            message: isSaved ? "Album removed from library" : "Album saved to library",
            savedAlbums: user.savedAlbums
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

async function getSavedAlbums(req, res) {
    const userId = req.user.id;
    try {
        const user = await userModel.findById(userId).populate({
            path: 'savedAlbums',
            populate: { path: 'artist' }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "Saved albums fetched",
            savedAlbums: user.savedAlbums
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

module.exports = {
    createMusic,
    createAlbum,
    getAllMusics,
    getAllAlbums,
    getAlbumById,
    toggleLikeSong,
    getLikedSongs,
    toggleSaveAlbum,
    getSavedAlbums
}