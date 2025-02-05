const Vehicle = require('../models/vehicle');
const Renting = require('../models/rent');
const mongoose = require('mongoose');

const allVehicles = [];
const allRents = [];

// returns all distinct permutations of an array
function allPermutations(array){
    let result = [];
    if(array.length === 0) return [];
    if(array.length === 1) return array;

    for(let i=0; i<array.length; i++){
        const currentElement = array[i];
        const remainingElements = array.slice(0, i).concat(array.slice(i+1));
        const remainingElementsPermuted = allPermutations(remainingElements);

        for(let j=0; j<remainingElementsPermuted.length; j++){
            const permutedArray = [currentElement].concat(remainingElementsPermuted[j]);

            result.push(permutedArray);
        }
    }

    return result;
}

// populate allVehicles with data
function getAllVehicles(){
    allVehicles.splice(0, allVehicles.length);

    Vehicle.find()
    .select('passengerCapacity range fuel available _id')
    .exec()
    .then(docs => {
        docs.map(doc => allVehicles.push(doc));
    })
    .catch(e => {
        console.log(e);
    });
}

// populate allRents with data
function getAllRents() {
    allRents.splice(0, allRents.length);

    Renting.find()
    .select('passengers travelDistance completed _id')
    .exec()
    .then(docs => {
        docs.map(doc => allRents.push(doc));
    })
    .catch(e => {
        console.log(e);
    }); 
}

// returns all permutations of available vehicles
function allVehiclePermutations(vehicles){
    let allAvailableVehicles = vehicles.filter(vehicle => vehicle.available).sort((x, y) => x.range - y.range).sort((x, y) => y.passengerCapacity - x.passengerCapacity);
    const permutations = allPermutations(allAvailableVehicles);
    return permutations;
}

// returns rents ordered by passengers and distance
function allRentsOrdered(rents){
    let sortedByPassengers = rents.filter(rent => !rent.completed).sort((x, y) => x.passengers - y.passengers).reverse();
    return sortedByPassengers.sort((x, y) => x.travelDistance - y.travelDistance).reverse();
}

// compute profit of a single journey
function computeProfit(vehicle, rent){
    let journeyTime = 0;
    if(rent.travelDistance > 50){
        journeyTime = rent.travelDistance;
    } else {
        journeyTime = 2*rent.travelDistance;
    }
    let travelFee = rent.passengers*((2*rent.travelDistance) + 2*(1 + (journeyTime-(journeyTime%30))/30));

    let refueling = 0;
    if(vehicle.fuel === "gasoline"){
        refueling = rent.travelDistance*2;
    } else if (vehicle.fuel === "electric"){
        refueling = rent.travelDistance;
    } else if (vehicle.fuel === "hybrid"){
        if(rent.travelDistance > 50){
            refueling = 1.5*rent.travelDistance
        } else {
            refueling = 0.75*rent.travelDistance
        }
    }
    return travelFee - refueling;
}

// assigning passengers to one permutation of vehicles and calculating the assumed profit
function assignVehicles(onePermutation, rentsOrdered){
    const successfulAssignment = [];
    let tempRents = rentsOrdered;
    for(let i=0; i<onePermutation.length; i++){
        for(let j=tempRents.length-1; j>=0; j--){
            if(tempRents[j].passengers <= onePermutation[i].passengerCapacity &&
                tempRents[j].travelDistance <= onePermutation[i].range){
                    successfulAssignment.push({
                        vehicle: onePermutation[i],
                        rent: tempRents[j]
                    });
                    tempRents = tempRents.slice(0,j).concat(tempRents.slice(j+1));
                    break;
            }
        }
    }

    let assumedProfit = 0;
    for(let i=0; i<successfulAssignment.length; i++){
        assumedProfit += computeProfit(successfulAssignment[i].vehicle, successfulAssignment[i].rent);
        console.log(computeProfit(successfulAssignment[i].vehicle, successfulAssignment[i].rent));
    }
    console.log(assumedProfit);
}

// for router.GET (currently used for testing purposes)
exports.rent_get_all_data = (req, res, next) => {

    getAllRents();
    getAllVehicles();
    function stat() {
        assignVehicles(allVehiclePermutations(allVehicles)[0], allRents);
        res.status(200).json(allRents);
    }
    setTimeout(stat, 100);
}

// for router.POST
exports.rent_new = (req, res, next) => {
    let rent;
    if(req.body.completed){
        rent = new Renting({
            _id: new mongoose.Types.ObjectId(),
            passengers: req.body.passengers,
            travelDistance: req.body.travelDistance,
            completed: req.body.completed
        });
    } else {
        rent = new Renting({
            _id: new mongoose.Types.ObjectId(),
            passengers: req.body.passengers,
            travelDistance: req.body.travelDistance
        });
    }
    
    rent
    .save()
    .then(result => {
        res.status(201).json({
            message: 'created renting order',
            newRent: {
                passengers: result.passengers,
                travelDistance: result.travelDistance,
                _id: result._id,
                request: {
                    type: 'POST',
                    url: req.protocol + '://' + req.get('host') + '/renting/' + result._id
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

// for router.GET/:id
exports.rent_get_by_id = (req, res, next) => {
    const id = req.params.rentId;
    Renting.findById(id)
    .select('passengers travelDistance completed _id')
    .exec()
    .then(doc => {
        if(doc){
            res.status(200).json({
                renting: doc._id + ", passengers: " + doc.passengers + ", distance: " + doc.travelDistance + ", completed: " + doc.completed,
                request: {
                    type: 'GET',
                    url: req.protocol + '://' + req.get('host') + '/renting'
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
    });
}

// for router.DELETE/:id
exports.rent_remove = (req, res, next) => {
    const id = req.params.rentId;
    Renting.deleteOne({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'deleted renting',
            request: {
                type: 'POST',
                url: req.protocol + '://' + req.get('host') + '/renting',
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