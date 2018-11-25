// ==============================================================================//
// IMPORT MODULE //
// ==============================================================================//
var express = require('express');
var router = express.Router();

//import controller
var device_category_ctrl = require( '../controllers/device_category.controller' );
// ==============================================================================//

// ==============================================================================//
// CREATE ROUTES //
// ==============================================================================//
/* TEST province route */
// example endpoint: /api/province/test ==> result will be a test message.
router.get( '/test', device_category_ctrl.device_category_test );

/* POST a province */
// example endpoint: /api/province/ ==> result will input a province.
// router.post( '/', device_category_ctrl.device_category_create );

/* GET all province */
// example endpoint: /api/province/ ==> result will be all province.
router.get( '/', device_category_ctrl.device_category_all );

/* GET a province */
// example endpoint: /api/province/name ==> result will be a province.
router.get( '/name', device_category_ctrl.device_category_name );

module.exports = router;
// ==============================================================================//
