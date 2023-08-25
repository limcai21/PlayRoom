const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    game_id: Number,
    rating: Number,
    comment: String,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accounts"
    },
});

module.exports = mongoose.model('reviews', reviewSchema);