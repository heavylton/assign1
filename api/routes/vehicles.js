const express = require('express');
const router = express.Router();

const VehiclesController = require('../controllers/vehicles');

router.get('/', VehiclesController.vehicles_get_all);

router.post('/', VehiclesController.vehicle_create);

router.get('/:vehicleId', VehiclesController.vehicle_get_by_id);

/*router.patch('/:vehicleId', );*/

router.delete('/:vehicleId', VehiclesController.vehicle_delete);

module.exports = router;