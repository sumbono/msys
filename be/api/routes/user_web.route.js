// ==============================================================================//
// IMPORT MODULE //
// ==============================================================================//
var express = require('express');
var router = express.Router();

//import controller
var user_web_ctrl = require( '../controllers/user_web.controller' );
// ==============================================================================//

// ==============================================================================//
// CREATE ROUTES //
// ==============================================================================//
/* TEST user_web route */
// example endpoint: /api/user_web/test ==> result will be a test page.
router.get( '/test', user_web_ctrl.user_web_test );

/* POST a user_web */
// example endpoint: /api/user_web/ ==> result will input a user_web.
// router.post( '/', user_web_ctrl.user_web_create );

/* GET user_web by name */
// example endpoint: /api/user_web?name=cudonms ==> result will be a user_web.
// router.get( '/', user_web_ctrl.user_web_name );

/* AUTH user_web by name */
// example endpoint: /api/user_web?name=cudonms&password=cudonms ==> result will be a user_web and validation.
router.get( '/', user_web_ctrl.user_web_auth );

module.exports = router;
// ==============================================================================//
