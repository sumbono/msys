// ==============================================================================//
// IMPORT MODULE //
// ==============================================================================//
var express = require('express');
var router = express.Router();

//import controller
var protocol_ctrl = require( '../controllers/protocol.controller' );
// ==============================================================================//

// ==============================================================================//
// CREATE ROUTES //
// ==============================================================================//
/* TEST protocol route */
// example endpoint: /api/protocol/test ==> result will be a test message.
router.get( '/test', protocol_ctrl.protocol_test );

/* POST a protocol */
// example endpoint: /api/protocol/ ==> result will input a protocol.
// router.post( '/', protocol_ctrl.protocol_create );

/* GET all protocol */
// example endpoint: /api/protocol/ ==> result will be all protocol.
router.get( '/', protocol_ctrl.protocol_all );

/* GET a protocol */
// example endpoint: /api/protocol/name ==> result will be a protocol.
router.get( '/name', protocol_ctrl.protocol_name );

module.exports = router;
// ==============================================================================//
