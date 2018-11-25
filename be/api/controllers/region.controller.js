// var url     = require('url');
var { Region }  = require('../models/master_region');

/* Simple version, without validation or sanitation */
exports.region_test = async function (req, res) {
    res.send('Greetings from the "Region" test controller!');
};

/* POST region data */
/* the example of body format: name = NETWORK1 */
exports.region_create = async function (req, res) {

    // const { error } =  (req.body); 
    // if (error) return res.status(400).send(error.details[0].message);

    // check if the region name was inserted or not
    // let region_in = await Region.find({ name: req.body.name });
    // if (region_in) return res.status(400).send('The region exist.');
    
    let region = new Region({ 
        name: req.body.name, 
    });
    region = await region.save();
    
    res.send(region);
    console.log(`Region name: ${region.name} with ID: ${region._id} saved.`);

};

/* GET all region */
exports.region_all = async function (req, res) {

    // let region = await Region.find({}).toArray();
    // let region = await Region.find({ name: "NETWORK 2" });
    let region = await Region.find({ });
    if (!region) return res.status(404).send('The region was not created.');
    
    res.send(region);
    console.log(`Send all Region name & IDs.`); 

};

/* GET region by name */
exports.region_name = async function (req, res) {

    // let region = await Region.find({}).toArray();
    let region = await Region.find({ name: req.query.name });
    if (!region) return res.status(404).send('The region was not created.');
    
    res.send(region); 

};