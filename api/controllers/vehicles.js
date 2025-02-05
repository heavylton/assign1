const Vehicle = require('../models/vehicle');
const mongoose = require('mongoose');

exports.vehicles_get_all = (req, res, next) => {
    Vehicle.find()
    .select('passengerCapacity range fuel available _id')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    passengerCapacity: doc.passengerCapacity,
                    range: doc.range,
                    fuel: doc.fuel,
                    available: doc.available,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') + '/vehicles/' + doc._id
                    }
                }
            })
        }
        res.status(200).json(response);
    })
    .catch(e => {
        console.log(e);
        res.status(500).json({
            error: e
        });
    });
}

exports.vehicle_create = (req, res, next) => {
    const vehicle = new Vehicle({
        _id: new mongoose.Types.ObjectId(),
        passengerCapacity: req.body.passengerCapacity,
        range: req.body.range,
        fuel: req.body.fuel
    });
    vehicle
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: "POST yay!",
            createdVehicle: {
                passengerCapacity: result.passengerCapacity,
                range: result.range,
                fuel: result.fuel,
                available: result.available,
                _id: result._id,
                request: {
                    type: 'POST',
                    url: req.protocol + '://' + req.get('host') + '/vehicles/' + result._id
                }
            }
        });
    })
    .catch(e => {
        console.log(e);
        res.status(500).json({
            error: e
        });
    });
}

exports.vehicle_get_by_id = (req, res, next) => {
    const id = req.params.vehicleId;
    if(id === "yay"){
        res.status(200).json({
            message: "YAAAY"
        });
    }else{
    Vehicle.findById(id)
    .select('passengerCapacity range fuel available _id')
    .exec()
    .then(doc => {
        console.log("from db", doc);
        if(doc){
            res.status(200).json({
                vehicle: doc,
                request: {
                    type: 'GET',
                    url: req.protocol + '://' + req.get('host') + '/vehicles'
                }
            });
        }else{
            res.status(404).json({
                message: "no valid entry for id"
            });
        }
    })
    .catch(e => {
        console.log(e);
        res.status(500).json({error: e});
    });}
}

exports.vehicle_delete = (req, res, next) => {
    const id = req.params.vehicleId;
    Vehicle.deleteOne({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'deleted vehicle',
            request: {
                type: 'POST',
                url: req.protocol + '://' + req.get('host') + '/vehicles',
                body: {passengerCapacity: 'Number', range: 'Number', fuel: 'String', available: 'Boolean'}
            }
        });
    })
    .catch(e => {
        console.log(e);
        res.status(500).json({
            error: e
        });
    });
}

/*
(req, res, next) => {
    const id = req.params.vehicleId;
    const changedAttrs = {};
    for(const attrs of req.body){
        changedAttrs[attrs.propName] = attrs.value;
    }
    Vehicle.updateOne({_id: id}, { $set: changedAttrs})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'updated vehicle',
            request: {
                type: 'GET',
                url: req.protocol + '://' + req.get('host') + '/vehicles/' + id
            }
        });
    })
    .catch(e => {
        console.log(e);
        res.status(500).json({
            error: e
        });
    });    
}
*/