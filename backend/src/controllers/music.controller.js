const musicModel = require('../models/music.model');
const jwt = require('jsonwebtoken');
const { uploadFile } = require('../services/storage.service')
const albumModel = require('../models/album.model');
const mm = require('music-metadata');

async function createMusic(req, res) {
    try {
        const { title, albumId } = req.body;
        const files = req.files;

        console.log("[CreateMusic] Request body:", req.body);
        console.log("[CreateMusic] Files received:", files ? Object.keys(files) : "None");

        if (!files || !files.music || !files.image) {
            console.error("[CreateMusic] Missing files. Available fields:", files ? Object.keys(files) : "None");
            return res.status(400).json({ message: "Music and image files are required" });
        }

        // Extract metadata for duration
        let duration = 0;
        try {
            const metadata = await mm.parseBuffer(files.music[0].buffer, files.music[0].mimetype);
            duration = Math.round(metadata.format.duration || 0);
            console.log(`[CreateMusic] Extracted duration: ${duration}s for ${files.music[0].originalname}`);
        } catch (metadataError) {
            console.error("[CreateMusic] Metadata extraction failed:", metadataError.message);
        }

        const musicResult = await uploadFile(
            files.music[0].buffer, 
            "Music_" + Date.now() + "_" + files.music[0].originalname, 
            "SpotifyClone/music"
        );
        
        const imageResult = await uploadFile(
            files.image[0].buffer, 
            "Image_" + Date.now() + "_" + files.image[0].originalname, 
            "SpotifyClone/songimage"
        );

        const music = await musicModel.create({
            uri: musicResult.url,
            image: imageResult.url,
            title,
            duration,
            artist: req.user.id
        })

        if (albumId) {
            const album = await albumModel.findById(albumId);
            if (album && album.artist.toString() === req.user.id) {
                album.musics.push(music._id);
                await album.save();
            }
        }

        res.status(201).json({
            message: "Music Created Successfully",
            music: {
                id: music._id,
                uri: music.uri,
                image: music.image,
                title: music.title,
                duration: music.duration,
                artist: music.artist
            }
        })
    } catch (err) {
        console.error("[CreateMusic] error:", err);
        res.status(500).json({ message: "Failed to create music", error: err.message });
    }
}

async function createAlbum(req, res) {
    try {
        const { title, musics } = req.body;
        const file = req.file;

        console.log("[CreateAlbum] Request body:", req.body);
        console.log("[CreateAlbum] File received:", file ? file.originalname : "None");

        if (!file) {
            console.error("[CreateAlbum] No file found in req.file");
            return res.status(400).json({ message: "Album image is required" });
        }

        const imageResult = await uploadFile(
            file.buffer, 
            "Album_" + Date.now() + "_" + file.originalname, 
            "SpotifyClone/albumimage"
        );

        const album = await albumModel.create({
            title,
            image: imageResult.url,
            artist: req.user.id,
            musics: musics ? JSON.parse(musics) : []
        })

        res.status(201).json({
            message: "Album Created Successfully",
            album: {
                id: album._id,
                title: album.title,
                image: album.image,
                artist: album.artist,
                musics: album.musics
            }
        })
    } catch (err) {
        console.error("[CreateAlbum] error:", err);
        res.status(500).json({ message: "Failed to create album", error: err.message });
    }
}

async function deleteMusic(req, res) {
    try {
        const { musicId } = req.params;
        const music = await musicModel.findById(musicId);

        if (!music) return res.status(404).json({ message: "Music not found" });
        if (music.artist.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

        // Remove from all albums
        await albumModel.updateMany({ musics: musicId }, { $pull: { musics: musicId } });
        
        await musicModel.findByIdAndDelete(musicId);
        res.status(200).json({ message: "Music deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete music", error: err.message });
    }
}

async function updateAlbumImage(req, res) {
    try {
        const { albumId } = req.params;
        const file = req.file;
        const album = await albumModel.findById(albumId);

        if (!album) return res.status(404).json({ message: "Album not found" });
        if (album.artist.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

        const imageResult = await uploadFile(file.buffer, "Album_" + Date.now() + "_" + file.originalname, "SpotifyClone/albumimage");
        album.image = imageResult.url;
        await album.save();

        res.status(200).json({ message: "Album image updated", image: album.image });
    } catch (err) {
        res.status(500).json({ message: "Failed to update album image", error: err.message });
    }
}

async function updateMusicImage(req, res) {
    try {
        const { musicId } = req.params;
        const file = req.file;
        const music = await musicModel.findById(musicId);

        if (!music) return res.status(404).json({ message: "Music not found" });
        if (music.artist.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

        const imageResult = await uploadFile(file.buffer, "Image_" + Date.now() + "_" + file.originalname, "SpotifyClone/songimage");
        music.image = imageResult.url;
        await music.save();

        res.status(200).json({ message: "Song image updated", image: music.image });
    } catch (err) {
        res.status(500).json({ message: "Failed to update song image", error: err.message });
    }
}

async function getArtistContent(req, res) {
    try {
        const albums = await albumModel.find({ artist: req.user.id }).populate("musics");
        const musics = await musicModel.find({ artist: req.user.id });
        res.status(200).json({ albums, musics });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch content", error: err.message });
    }
}

async function getAllMusics(req, res) {
    try {
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
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

async function getAllAlbums(req, res) {
    try {
        const searchQuery = req.query.search;
        let filter = {};
        if (searchQuery) {
            filter.title = { $regex: searchQuery, $options: 'i' };
        }

        const albums = await albumModel.find(filter).select("title artist image").populate("artist")
        res.status(200).json({
            message: "Album Fetched Successfully",
            albums: albums
        })
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

async function getAlbumById(req, res) {
    try {
        const albumId = req.params.albumId;
        const album = await albumModel.findById(albumId)
            .populate("artist")
            .populate({
                path: "musics",
                populate: { path: "artist" }
            })

        return res.status(200).json({
            message: "Album Fetched Successfully",
            album: album
        })
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
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
    deleteMusic,
    updateAlbumImage,
    updateMusicImage,
    getArtistContent,
    getAllMusics,
    getAllAlbums,
    getAlbumById,
    toggleLikeSong,
    getLikedSongs,
    toggleSaveAlbum,
    getSavedAlbums
}