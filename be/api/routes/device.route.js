// ==============================================================================//
// IMPORT MODULE //
// ==============================================================================//
var express = require('express');
var router = express.Router();

//import controller
var device_ctrl = require( '../controllers/device.controller' );
// ==============================================================================//

// ==============================================================================//
// CREATE ROUTES //
// ==============================================================================//
/* TEST device route */
// example endpoint: /api/device/test ==> result will be a test message.
router.get( '/test', device_ctrl.device_test );

/* POST a device */
// example endpoint: /api/device/ ==> result will input a device.
// router.post( '/', device_ctrl.device_create );

/* GET all device */
// example endpoint: /api/device/ ==> result will be all device.
router.get( '/', device_ctrl.device_all );

/* GET a device */
// example endpoint: /api/device/name ==> result will be a device.
router.get( '/name', device_ctrl.device_name );

module.exports = router;
// ==============================================================================//
