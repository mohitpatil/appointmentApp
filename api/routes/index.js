var express = require('express');
var router = express.Router();

const appointmentController = require('../controllers/appointments');
const slotController = require('../controllers/slot');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/appointments', appointmentController.all);
router.get('/retrievSlots', slotController.all);
router.post('/appointmentCreate', appointmentController.create);


module.exports = router;
