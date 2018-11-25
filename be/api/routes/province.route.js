// ==============================================================================//
// IMPORT MODULE //
// ==============================================================================//
var express = require('express');
var router = express.Router();

//import controller
var province_ctrl = require( '../controllers/province.controller' );
// ==============================================================================//

// ==============================================================================//
// CREATE ROUTES //
// ==============================================================================//
/* TEST province route */
// example endpoint: /api/province/test ==> result will be a test message.
router.get( '/test', province_ctrl.province_test );

/* POST a province */
// example endpoint: /api/province/ ==> result will input a province.
// router.post( '/', province_ctrl.province_create );

/* GET all province */
// example endpoint: /api/province/ ==> result will be all province.
router.get( '/', province_ctrl.province_all );

/* GET province by name */
// example endpoint: /api/province/name ==> result will be a province.
router.get( '/name', province_ctrl.province_name );

module.exports = router;
// ==============================================================================//
