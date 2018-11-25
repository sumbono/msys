// Import Models
var { SiteDevice }  = require('../models/site_device');
var { Site }  = require('../models/site');
var { DeviceCategory } = require('../models/master_device_category');
var { Device } = require('../models/master_device');
var { Protocol } = require('../models/master_protocol');

/* Simple version, without validation or sanitation */
exports.site_device_test = async function (req, res) {
    res.send('Greetings from the "Site Device" test controller!');
};

/* POST site_device data */
/* the example of body format: ... */
exports.site_device_create = async function (req, res) {

    let last_updated = new Date(Date.now()).toLocaleString();

    // GET others _id from:
    let dev_ID = parseInt(req.body.dev_id);
    let site_name = req.body.site;
    let device_category_name = req.body.device_category;
    let device_name = req.body.device;
    let protocol_name = req.body.protocol;
    // let protocol_name = req.body.sensor;

    // GET site_id:
    Site.find({ name: site_name }, async (err, site) => {

        if(err){
            console.log("not connected to Site collection.");
          }else {
            let st_id = site[0];
            if (!st_id) {
                res.status(404).send(`The ${site_name} was not found on Site collection. Register this Site first!`);
            } else {
                console.log(`get data ${site_name} from Site collection.`);
                console.log('site_id:', site[0]._id );

                // GET device_category_id:
                DeviceCategory.find({ name: device_category_name }, async (err, device_category) => {
                    if(err){
                        console.log("not connected to Device Category collection.");
                    }else {
                        let devcat_id = device_category[0];
                        if (!devcat_id) {
                            res.status(404).send(`The ${ device_category_name } was not found on Device Category collection. Register this Device Category first!`);
                        } else {
                            console.log(`get data ${ device_category_name } from Device Category collection.`);
                            console.log( 'device_category_id:' , device_category[0]._id );

                                // GET device_id:
                                Device.find({ name: device_name }, async (err, device) => {
                                    if(err){
                                        console.log("not connected to Device collection.");
                                    }else {
                                        let dev_id = device[0];
                                        if (!dev_id) {
                                            res.status(404).send(`The ${ device_name } was not found on Device collection. Register this Device first!`);
                                        } else {
                                            console.log(`get data ${ device_name } from Device collection.`);
                                            console.log( 'device_id:' , device[0]._id );


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

                                                            

                                                                        let site_device = new SiteDevice({ 
                                                                            dev_id: dev_ID,
                                                                            site_id: site[0],
                                                                            device_category_id: device_category[0],
                                                                            device_id: device[0],
                                                                            protocol_id: protocol[0],
                                                                            unit: req.body.unit,
									    icon_major: req.body.icon_major,
									    icon_critical: req.body.icon_critical,
									    icon_normal: req.body.icon_normal,
                                                                            last_updated: last_updated

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

                        }

                    }

                });
            }

          }
    });

};

/* GET all site_device */
exports.site_device_all = async function (req, res) {

    let site_device = await SiteDevice.find();
    if (!site_device) return res.status(404).send('The site_device was not created.');
    
    res.send(site_device);

};

/* GET a site_device */
exports.site_device_name = async function (req, res) {

    let name = req.query.name || req.body.name ;

    let site_device = await SiteDevice.find({ device_id: {name: name} });
    if (!site_device) return res.status(404).send('The site_device was not created.');
    
    res.send(site_device);

};
