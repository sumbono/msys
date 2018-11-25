// Import Models
var { SiteDeviceSensor }  = require('../models/site_device_sensor');
// var { Site }  = require('../models/site');
// var { DeviceCategory } = require('../models/master_device_category');
var { SiteDevice } = require('../models/site_device');
var { Protocol } = require('../models/master_protocol');

/* Simple version, without validation or sanitation */
exports.site_device_sensor_test = async function (req, res) {
    res.send('Greetings from the "Site Device Sensor" test controller!');
};

/* POST site_device_sensor data */
/* the example of body format: ... */
exports.site_device_sensor_create = async function (req, res) {

    let last_updated = new Date(Date.now()).toLocaleString();

    // GET others _id from:
    // let site_name = req.body.site;
    // let device_category_name = req.body.device_category;
    let device_name = req.body.device;
    // let sensor_name = req.body.sensor;
    let protocol_name = req.body.protocol;

    // GET device_id:
    SiteDevice.find({ device_id: { name: device_name } }, async (err, device) => {
        if(err){
            console.log("not connected to Device collection.");
        }else {
            let dev_id = device[0];
            if (!dev_id) {
                res.status(404).send(`The ${ device_name } was not found on Device collection. Register this Device first!`);
            } else {
                console.log(`get data ${ device_name } with dev_id ${ device[0].dev_id } from Device collection.`);
                console.log( 'device_id:' , device[0].dev_id );


                    // GET protocol_id:
                    Protocol.find({ protocol: protocol_name }, async (err, protocol) => {
                        if(err){
                            console.log("not connected to Protocol collection.");
                        }else {
                            let prtcl_id = protocol[0];
                            if (!prtcl_id) {
                                res.status(404).send(`The ${ protocol_name } was not found on Protocol collection. Register this Protocol first!`);
                            } else {
                                console.log(`get data ${ protocol_name } from Protocol collection.`);
                                console.log( 'protocol_id:' , protocol[0]._id );

                                

                                            let site_device = new SiteDeviceSensor({ 
                                                
                                                dev_id: device[0].dev_id,
                                                protocol_id: protocol[0],
                                                detail: req.body.detail ,
                                                ipaddress: req.body.ipaddress ,
                                                mac_address: req.body.mac_address ,
                                                description: req.body.description ,
                                                icon_major: req.body.icon_major,
                                                icon_critical: req.body.icon_critical,
                                                icon_normal: req.body.icon_normal,

                                            });
                                            site_device = await site_device.save();
                                            res.send( site_device );
                                            console.log(`Site_Device unit: ${ req.body.unit } for ${ protocol[0].sensor } in ${ device[0].name } in ${ site[0].name } created.`);

                            }

                        }

                    });

            }

        }

    });


};

/* GET all site_device */
exports.site_device_sensor_all = async function (req, res) {

    let site_device_sensor = await SiteDeviceSensor.find();
    if (!site_device_sensor) return res.status(404).send('The site_device_sensor was not created.');
    
    res.send(site_device_sensor);

};

/* GET a site_device */
exports.site_device_sensor_name = async function (req, res) {

    let name = req.query.name || req.body.name ;

    let site_device_sensor = await SiteDeviceSensor.find({ device_id: {name: name} });
    if (!site_device_sensor) return res.status(404).send('The site_device was not created.');
    
    res.send(site_device);

};