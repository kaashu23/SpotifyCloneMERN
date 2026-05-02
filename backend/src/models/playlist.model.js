const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'music'
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=1000'
    }
}, { timestamps: true });

const playlistModel = mongoose.model('playlist', playlistSchema);

module.exports = playlistModel;
