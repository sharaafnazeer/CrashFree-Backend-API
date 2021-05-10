const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    vehicleNo: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    type : { type: String, default: 'Car' },
    status: { type: Number, required: true, default: 0 },
    user: { type: String, required: true },
})

module.exports = mongoose.model('vehicles', vehicleSchema);