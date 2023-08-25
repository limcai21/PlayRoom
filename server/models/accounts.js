const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    token: String
});

module.exports = mongoose.model('accounts', accountSchema);