// ==============================================================================//
// IMPORT MODULE //
// ==============================================================================//
var express = require('express');
var router = express.Router();

//import controller
var site_ctrl = require( '../controllers/site.controller' );
// ==============================================================================//

// ==============================================================================//
// CREATE ROUTES //
// ==============================================================================//
/* TEST site route */
// example endpoint: /api/site/test ==> result will be a test message.
router.get( '/test', site_ctrl.site_test );

/* POST a site */
// example endpoint: /api/site/ ==> result will input a site.
// router.post( '/', site_ctrl.site_create );

/* GET all site */
// example endpoint: /api/site/ ==> result will be all site.
router.get( '/', site_ctrl.site_all );

/* GET site name */
// example endpoint: /api/site/name?name=Jalan Panjang ==> result will be a site with query name.
router.get( '/name', site_ctrl.site_name );

module.exports = router;
// ==============================================================================//
