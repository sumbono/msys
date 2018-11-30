// ==============================================================================//
// INPUT MODULE //
// ==============================================================================//
var express     = require('express');
var bodyParser  = require('body-parser');
var path        = require('path');
// var jwt         = require('jsonwebtoken');

// import database
require('./api/db_config/database');

//import route
var sitelog             = require('./api/routes/sitelog.route');
var region              = require('./api/routes/region.route');
var province            = require('./api/routes/province.route');
var site                = require('./api/routes/site.route');
var device              = require('./api/routes/device.route');
var dev_cat             = require('./api/routes/device_category.route');
var protocol            = require('./api/routes/protocol.route');
var site_device         = require('./api/routes/site_device.route');
var user_web            = require('./api/routes/user_web.route');
var site_device_sensor  = require('./api/routes/site_device_sensor.route');

//Active Devices
var activeDevice    = require( './api/dashboard_collections/activeDevice.controller' );

//Alarm Devices
var alarmDevice     = require('./api/dashboard_collections/alarmDevice.controller');

//Sensor Values
var sensorValue     = require('./api/report_collection/sensorValueNow');

//Dashboard Graph
var graphDash       = require('./api/dashboard_collections/graphData.controller');
var graphDashRx     = require('./api/dashboard_collections/graphDataRx.controller');

//List Camera
var listCamera      = require('./api/report_collection/listCamera');
var showCamera      = require('./api/report_collection/showCamera');

//Parsing Battery
var parseBatt       = require('./api/report_collection/parsingBatt');

//AVG Battery
var avgBatt         = require('./api/report_collection/avgBatt');

//Site Status
var siteStatus      = require('./api/dashboard_collections/siteStatus.controller');

//Site Status Device
var siteStatusDevice = require('./api/dashboard_collections/siteStatusDevice.controller');

// ==============================================================================//

// ==============================================================================//
// API //
// ==============================================================================//
var app         = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use( bodyParser.urlencoded( { extended: true } ) );

// parse requests of content-type - application/json
app.use(bodyParser.json());

app.use('/api/sitelog', sitelog);
app.use('/api/region', region);
app.use('/api/province', province);
app.use('/api/site', site);
app.use('/api/device', device);
app.use('/api/device_category', dev_cat);
app.use('/api/protocol', protocol);
app.use('/api/site_device', site_device);
app.use('/api/user_web', user_web);
app.use('/api/site_device_sensor', site_device_sensor );

//Set Active Device
activeDevice.getActiveDev();

//Set Alarm Device
alarmDevice.alarmDev();

//Set Sensor Value
sensorValue.getSensorValue();

//Set Graph Dashboard Values
graphDash.getGraphData();
graphDashRx.getGraphDataRx();

//Get List Camera Images
listCamera.getListCamera();
showCamera.getShowCamera();

//Parsing Battery
parseBatt.getParseBatt();

//AVG Battery
avgBatt.getAvgBatt();

//Site Status
siteStatus.getsiteStatus();

//Site Status Device
siteStatusDevice.getsiteStatusDevice();

// Routing To Public Folder For Any Static Context
// app.use(express.static(__dirname + '/public'));

// var currentDir = path.join(`/var/www/nms2/nms_v2/fe/public/`, `/camera/`);
// app.use('/camera',express.static( path.join(`/var/www/nms2/nms_v2/fe/public/`, `/camera/`) ));

var APIPort = process.env.PORT || 3030;
// app.listen(APIPort);
console.log(`Listening on port ${APIPort}...`);
// ==============================================================================//

// ==============================================================================//
// SOCKET //
// ==============================================================================//
// Listening socket on Port
var io = require('socket.io')(app.listen(APIPort));

// Import socket function
var sitelogSocket = require('./api/sockets/sitelog.socket');
var regionSocket = require('./api/sockets/region.socket');
var provinceSocket = require('./api/sockets/province.socket');
var siteSocket = require('./api/sockets/site.socket');
var deviceCategorySocket = require('./api/sockets/device_category.socket');
var deviceSocket = require('./api/sockets/device.socket');
var siteDeviceSocket = require('./api/sockets/site_device.socket');
var siteDeviceSensorSocket = require('./api/sockets/site_device_sensor.socket');

// call the Socket
sitelogSocket(io);
regionSocket(io);
provinceSocket(io);
siteSocket(io);
deviceCategorySocket(io);
deviceSocket(io);
siteDeviceSocket(io);
siteDeviceSensorSocket(io);
// ==============================================================================//