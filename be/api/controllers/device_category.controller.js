// var url     = require('url');
var { DeviceCategory }  = require('../models/master_device_category');

/* Simple version, without validation or sanitation */
exports.device_category_test = async function (req, res) {
    res.send('Greetings from the "Device Category" test controller!');
};

/* POST device_category data */
/* the example of body format: name = JAKARTA */
exports.device_category_create = async function (req, res) {

    // const { error } = validate(req.body); 
    // if (error) return res.status(400).send(error.details[0].message);

    // check if the province name was inserted or not
    // let province_in = await Province.find({ name: req.body.name });
    // if (province_in) {
    
    //     return res.status(400).send('The province exist.');
    
    // }
    // else {
     
        let device_category = new DeviceCategory({ name: req.body.name });
        device_category = await device_category.save();
        
        res.send(device_category);
        console.log(`Device category name: ${device_category.name} saved.`);
    
    // }

};

/* GET all device_category */
exports.device_category_all = async function (req, res) {

    let device_category = await DeviceCategory.find();
    if (!device_category) return res.status(404).send('The device category was not created.');
    
    res.send(device_category);

};

/* GET a device_category */
exports.device_category_name = async function (req, res) {

    let name = req.query.name || req.body.name ;

    let device_category = await DeviceCategory.find({ name: name });
    if (!device_category) return res.status(404).send('The device category was not created.');
    
    res.send(device_category);

};