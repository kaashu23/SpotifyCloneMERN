const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'artist', 'admin'],
        default: 'user'
    },
    likedSongs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'music'
    }],
    savedAlbums: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }]
})

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;