const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    passengerCapacity: {type: Number, required: true},
    range: {type: Number, required: true},
    fuel: {type: String, required: true},
    available: {type: Boolean, default: true}
});

module.exports = mongoose.model('Vehicle', vehicleSchema);