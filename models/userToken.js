const mongoose = require('mongoose');

const userTokenSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    token: { type: String, required: true },
    type: { type: Number, required: true, default: 1 },
    expireAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('userTokens', userTokenSchema);