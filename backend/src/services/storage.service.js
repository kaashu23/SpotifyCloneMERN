const ImageKit = require('@imagekit/nodejs');

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function uploadFile(file) {
    const result = await imagekit.files.upload({
        file: file, // base64 string
        fileName: "Music_" + Date.now() + ".mp3",
        folder: "SpotifyClone/music"
    });

    return result;
}

module.exports = {
    uploadFile
};