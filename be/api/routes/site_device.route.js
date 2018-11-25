// ==============================================================================//
// IMPORT MODULE //
// ==============================================================================//
var express = require('express');
var router = express.Router();

//import controller
var site_device_ctrl = require( '../controllers/site_device.controller' );
// ==============================================================================//

// ==============================================================================//
// CREATE ROUTES //
// ==============================================================================//
/* TEST site_device route */
// example endpoint: /api/site_device/test ==> result will be a test message.
router.get( '/test', site_device_ctrl.site_device_test );

/* POST a site_device */
// example endpoint: /api/site_device/ ==> result will input a site_device.
// router.post( '/', site_device_ctrl.site_device_create );

/* GET all site_device */
// example endpoint: /api/site_device/ ==> result will be all site_device.
router.get( '/', site_device_ctrl.site_device_all );

/* GET a site_device */
// example endpoint: /api/site_device/name ==> result will be site_device(s).
router.get( '/name', site_device_ctrl.site_device_name );

module.exports = router;
// ==============================================================================//
