const mongoose = require('mongoose');

const circleSchema = new mongoose.Schema({
    user: { type: String, required: true },
    circleUser: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: Number, required: true, default: 0 },
})

module.exports = mongoose.model('circles', circleSchema);