// var url     = require('url');
var { Protocol }  = require('../models/master_protocol');

// Import Region & Province Models
var { Device } = require('../models/master_device');

/* Simple version, without validation or sanitation */
exports.protocol_test = async function (req, res) {
    res.send('Greetings from the "Protocol" test controller!');
};

/* POST protocol data */
/* the example of body format: ... */
exports.protocol_create = async function (req, res) {

    let last_updated = await new Date(Date.now()).toLocaleString();
    
    let device_name = req.body.device;

    // GET device_id from Device:
    Device.find({ name: device_name }, async (err, device) => {

        if(err){ 
            console.log("not connected to Device collection.");
        }else {
            let dev_id = device[0];
            if (!dev_id) {
                res.status(404).send(`The ${device_name} was not found on Device collection. Register this Device first!`);
            } else {
                console.log(`get data ${device_name} from Device collection.`);
                console.log(device[0]._id );

                let protocol = new Protocol({ 
                    device_id: device[0],
                    sensor: req.body.sensor,
                    protocol: req.body.protocol,
                    last_updated: last_updated, 
                });
                protocol = await protocol.save();
                res.send(protocol);
                console.log(`Protocol name: ${protocol.protocol} saved.`);

            }

        }
    
    });

};

/* GET all protocol */
exports.protocol_all = async function (req, res) {

    let protocol = await Protocol.find();
    if (!protocol) return res.status(404).send('The protocol was not created.');
    
    res.send(protocol);

};

/* GET a protocol */
exports.protocol_name = async function (req, res) {

    let name = req.query.name || req.body.name ;

    let protocol = await Protocol.find({ protocol: name });
    if (!protocol) return res.status(404).send('The protocol was not created.');
    
    res.send(protocol);

};