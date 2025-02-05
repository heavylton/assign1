const express = require('express');
const router = express.Router();

const RentController = require('../controllers/renting');

// all routers for rents
router.get('/', RentController.rent_get_all_data);
router.post('/', RentController.rent_new);
router.get('/:rentId', RentController.rent_get_by_id);
router.delete('/:rentId', RentController.rent_remove);

module.exports = router;