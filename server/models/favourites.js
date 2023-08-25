const mongoose = require('mongoose');

const favouriteSchema = mongoose.Schema({
    user_id: String,
    game_id: Number,
    tier: String
});

module.exports = mongoose.model('favourites', favouriteSchema);