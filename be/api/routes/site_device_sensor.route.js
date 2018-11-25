// ==============================================================================//
// IMPORT MODULE //
// ==============================================================================//
var express = require('express');
var router = express.Router();

//import controller
var site_device_sensor_ctrl = require( '../controllers/site_device_sensor.controller' );
// ==============================================================================//

// ==============================================================================//
// CREATE ROUTES //
// ==============================================================================//
/* TEST site_device route */
// example endpoint: /api/site_device/test ==> result will be a test message.
router.get( '/test', site_device_sensor_ctrl.site_device_sensor_test );

/* POST a site_device */
// example endpoint: /api/site_device/ ==> result will input a site_device.
// router.post( '/site_device_sensor', site_device_sensor_ctrl.site_device_sensor_create );

/* GET all site_device */
// example endpoint: /api/site_device/ ==> result will be all site_device.
router.get( '/', site_device_sensor_ctrl.site_device_sensor_all );

/* GET a site_device */
// example endpoint: /api/site_device/name ==> result will be site_device(s).
router.get( '/name', site_device_sensor_ctrl.site_device_sensor_name );

module.exports = router;
// ==============================================================================//
