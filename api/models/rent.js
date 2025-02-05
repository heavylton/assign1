const mongoose = require('mongoose');

const rentSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    passengers: {type: Number, required: true},
    travelDistance: {type: Number, required: true},
    completed: {type: Boolean, default: false}
});

module.exports = mongoose.model('Rent', rentSchema);