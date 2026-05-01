const express = require('express');
const musicController = require('../controllers/music.controller')
const router = express.Router();
const multer = require('multer')
const authMiddleware = require('../middlewaares/auth.middleware')

const upload = multer({
    storage: multer.memoryStorage()
})
router.post("/upload", authMiddleware.authArtist, upload.fields([
    { name: 'music', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), musicController.createMusic)

router.post("/album", authMiddleware.authArtist, upload.single('image'), musicController.createAlbum)

// Management routes
router.get("/artist/content", authMiddleware.authArtist, musicController.getArtistContent)
router.delete("/song/:musicId", authMiddleware.authArtist, musicController.deleteMusic)
router.put("/album/image/:albumId", authMiddleware.authArtist, upload.single('image'), musicController.updateAlbumImage)
router.put("/song/image/:musicId", authMiddleware.authArtist, upload.single('image'), musicController.updateMusicImage)

router.get("/", authMiddleware.authUser, musicController.getAllMusics)

router.get("/albums", authMiddleware.authUser, musicController.getAllAlbums)

router.get("/albums/saved", authMiddleware.authUser, musicController.getSavedAlbums)

router.get("/albums/:albumId", authMiddleware.authUser, musicController.getAlbumById)

router.post("/like/:musicId", authMiddleware.authUser, musicController.toggleLikeSong)

router.get("/liked", authMiddleware.authUser, musicController.getLikedSongs)

router.post("/album/save/:albumId", authMiddleware.authUser, musicController.toggleSaveAlbum)



module.exports = router; 