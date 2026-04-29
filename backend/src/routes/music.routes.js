const express = require('express');
const musicController = require('../controllers/music.controller')
const router = express.Router();
const multer = require('multer')
const authMiddleware = require('../middlewaares/auth.middleware')

const upload = multer({
    storage: multer.memoryStorage()
})
router.post("/upload", authMiddleware.authArtist, upload.single("music"), musicController.createMusic)

router.post("/album", authMiddleware.authArtist, musicController.createAlbum)

router.get("/", authMiddleware.authUser, musicController.getAllMusics)

router.get("/albums", authMiddleware.authUser, musicController.getAllAlbums)

router.get("/albums/saved", authMiddleware.authUser, musicController.getSavedAlbums)

router.get("/albums/:albumId", authMiddleware.authUser, musicController.getAlbumById)

router.post("/like/:musicId", authMiddleware.authUser, musicController.toggleLikeSong)

router.get("/liked", authMiddleware.authUser, musicController.getLikedSongs)

router.post("/album/save/:albumId", authMiddleware.authUser, musicController.toggleSaveAlbum)



module.exports = router; 