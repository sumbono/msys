// var url     = require('url');
var {Province}  = require('../models/master_province');

/* Simple version, without validation or sanitation */
exports.province_test = async function (req, res) {
    res.send('Greetings from the "Province" test controller!');
};

/* POST province data */
/* the example of body format: name = JAKARTA */
exports.province_create = async function (req, res) {

    // const { error } = validate(req.body); 
    // if (error) return res.status(400).send(error.details[0].message);

    // check if the province name was inserted or not
    // let province_in = await Province.find({ name: req.body.name });
    // if (province_in) {
    
    //     return res.status(400).send('The province exist.');
    
    // }
    // else {
     
        let province = new Province({ name: req.body.name });
        province = await province.save();
        
        res.send(province);
        console.log(`Province name: ${province.name} saved.`);
    
    // }

};

/* GET all province */
exports.province_all = async function (req, res) {

    let province = await Province.find();
    if (!province) return res.status(404).send('The province was not created.');
    
    res.send(province);

};

/* GET province by name */
exports.province_name = async function (req, res) {

    let provincename = req.query.name || req.body.name ;

    let province = await Province.find({ name: provincename });
    if (!province) return res.status(404).send('The province was not created.');
    
    res.send(province);

};