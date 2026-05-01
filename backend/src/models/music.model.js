const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    uri: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        default: 0
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "user",
        required: true
    }
})

const musicModel = mongoose.model("music", musicSchema);

module.exports = musicModel;