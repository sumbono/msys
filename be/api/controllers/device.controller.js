// var url     = require('url');
var {Device}  = require('../models/master_device');

/* Simple version, without validation or sanitation */
exports.device_test = async function (req, res) {
    res.send('Greetings from the "Device" test controller!');
};

/* POST device data */
/* the example of body format: name = SQUASH */
exports.device_create = async function (req, res) {

    let last_updated = await new Date(Date.now()).toLocaleString();

    // const { error } = validate(req.body); 
    // if (error) return res.status(400).send(error.details[0].message);
    
    let device = new Device({ 
        name: req.body.name,
        icon_major: req.body.icon_major,
        icon_critical: req.body.icon_critical,
        icon_normal: req.body.icon_normal,
        last_updated: last_updated 
    });
    device = await device.save();
    
    res.send(device);
    console.log(`device ${req.body.name} was inserted.`);

};

/* GET all device */
exports.device_all = async function (req, res) {

    let device = await Device.find({});
    if (!device) return res.status(404).send('The device was not created.');
    
    res.send(device);

};

/* GET a device */
exports.device_name = async function (req, res) {

    let name = req.query.name || req.body.name ;

    let device = await Device.find({ name: name });
    if (!device) return res.status(404).send('The device was not created.');
    
    res.send(device);

};