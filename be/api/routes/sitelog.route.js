// ==============================================================================//
// IMPORT MODULE //
// ==============================================================================//
var express 	= require('express');
var router 	= express.Router();
var cache  	= require('express-redis-cache')();

//import controller
var sitelog_cache = require( '../controllers/sitelog.controller' );
// ==============================================================================//

// ==============================================================================//
// CREATE ROUTES //
// ==============================================================================//
/* GET All data */
// example endpoint: /api/sitelog/ ==> result will be all data.
// router.get( '/', cache.route(), sitelog_cache.getAll );
router.get( '/', sitelog_cache.getAll );

/* GET data using Device ID */
// example endpoint: /api/sitelog/device?D=18 ==> result will be all data with D = 18.
// router.get( '/device', cache.route(), sitelog_cache.getDev );
router.get( '/device', sitelog_cache.getDev );

/* GET data using Device Protocol */
// example endpoint: /api/sitelog/protocol?key=H1 ==> result will be all data with H1.
// router.get( '/protocol', cache.route(), sitelog_cache.getPro );
router.get( '/protocol', sitelog_cache.getPro );

/* GET data using Device ID & Protocol */
// example endpoint: /api/sitelog/devpro?D=18&key=H1 ==> result will be all data with D=18 and H1.
// router.get( '/devpro', cache.route(), sitelog_cache.getDevPro );
router.get( '/devpro', sitelog_cache.getDevPro );

/* GET the last data inserted */
// example endpoint: /api/sitelog/lastone ==> result will be the last data inserted.
router.get( '/lastone', cache.route('lastone', 1), sitelog_cache.getLast );
//router.get( '/lastone', sitelog_cache.getLast );

/* GET the last data inserted by device ID */
// example endpoint: /api/sitelog/last_device?D=18 ==> result will be the last data inserted by device ID = 18.
// router.get( '/last_device', cache.route('last_device', 2), sitelog_cache.getLastDev );
router.get( '/last_device', sitelog_cache.getLastDev );

module.exports = router;
// ==============================================================================//
