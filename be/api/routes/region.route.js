// ==============================================================================//
// IMPORT MODULE //
// ==============================================================================//
var express = require('express');
var router = express.Router();

//import controller
var region_ctrl = require( '../controllers/region.controller' );
// ==============================================================================//

// ==============================================================================//
// CREATE ROUTES //
// ==============================================================================//
/* TEST region route */
// example endpoint: /api/region/test ==> result will be all region.
router.get( '/test', region_ctrl.region_test );

/* POST a region */
// example endpoint: /api/region/ ==> result will input a region.
// router.post( '/', region_ctrl.region_create );

/* GET all region */
// example endpoint: /api/region/ ==> result will be all region.
router.get( '/', region_ctrl.region_all );

/* GET region by name */
// example endpoint: /api/region/ ==> result will be a region.
router.get( '/name', region_ctrl.region_name );

module.exports = router;
// ==============================================================================//
