// ============================================================================== //
// PART INPUT MODULE //
// ============================================================================== //
var MongoClient = require('mongodb').MongoClient;
var db_url  = 'mongodb://localhost:27017/nms_db';
var db_url2 = 'mongodb://localhost:3001/meteor';

// ============================================================================== //
// GET DATA //
// ============================================================================== //

/* <==================================$$$$$$$===============================> */
/* GET All data */
// example endpoint: /api/sitelog/ ==> result will be all data.
module.exports.getAll = (req, res) => {

    MongoClient.connect(db_url, function(err, db){
        if (err) {
            MongoClient.connect(db_url2, function(err, db){
                db.collection('nms_sitelog').find().sort({_id:-1}).limit(3600).toArray(function(err, devices) {
                  if(err){
                    console.log("not connected to meteor database");
                  }else {
                    console.log('send all data from meteor database.');
                    res.send(devices);
                  }
                });
            });
        } else {
            db.collection('nms_sitelog').find().sort({_id:-1}).limit(3600).toArray(function(err, devices) {
                if(err){
                    console.log("not connected to database");
                }else {
                    console.log('send all data from database.');
                    res.send(devices);
                }
            });            
        }
    });

};

/* <==================================$$$$$$$===============================> */
/* GET data using Device ID */
// example endpoint: /api/sitelog/device?D=18 ==> result will be all data with D = 18.
module.exports.getDev = (req, res) => {

    var devId = req.query.D;
    var deviceId = parseInt(devId);

    MongoClient.connect(db_url, function(err, db){

        if (err) {
            MongoClient.connect(db_url2, function(err, db){
                db.collection('nms_sitelog').find({dev_id : deviceId}).sort({_id:-1}).limit(3600).toArray(function(err, devices) {
                  if(err){
                    console.log("not connected to meteor database");
                  }else {
                    console.log(`send data by device ID ${deviceId} from meteor database.`);
                    res.send(devices);
                  }
                });
            });
        } else {
            db.collection('nms_sitelog').find({dev_id : deviceId}).sort({_id:-1}).limit(3600).toArray(function(err, devices) {
                if(err){
                    console.log("not connected to database");
                }else {
                    console.log(`send data by device ID ${deviceId} from database.`);
                    res.send(devices);
                }
            });
        }

    });

};

/* <==================================$$$$$$$===============================> */
/* GET data using Device Protocol */
// example endpoint: /api/sitelog/protocol?key=H1 ==> result will be all data with H1.
module.exports.getPro = (req, res) => {

    var devPro = req.query.key;
    var query = {};
    query["data" + "." + devPro] = {$exists: true};

    // console.log(query);

    MongoClient.connect(db_url, function(err, db){

        if (err) {
            MongoClient.connect(db_url2, function(err, db){
                db.collection('nms_sitelog').find(query).sort({_id:-1}).limit(3600).toArray(function(err, devices) {
                if(err){
                    console.log("not connected to meteor database");
                }else {
                    console.log(`send data by protocol ${devPro} from meteor database.`);
                    res.send(devices);
                }
              });
            });
        } else {
            db.collection('nms_sitelog').find(query).sort({_id:-1}).limit(3600).toArray(function(err, devices) {
                if(err){
                    console.log("not connected to database");
                }else {
                    console.log(`send data by protocol ${devPro} from database.`);
                    res.send(devices);
                }
            });
        }

    });

};

/* <==================================$$$$$$$===============================> */
/* GET data using Device ID & Protocol */
// example endpoint: /api/sitelog/devpro?D=18&key=H1 ==> result will be all data with D=18 and H1.
module.exports.getDevPro = (req, res) => {

    var devID = parseInt(req.query.D);
    var devPro = req.query.key;
    var query = {};
    query["data" + "." + devPro] = {$exists: true};

    MongoClient.connect(db_url, function(err, db){

        if (err) {
            MongoClient.connect(db_url2, function(err, db){
                db.collection('nms_sitelog').find({
                    $and: [
                       {dev_id: devID},
                       query 
                    ]
                }).sort({_id:-1}).limit(100).toArray(function(err, devices) {
                if(err){
                  console.log("not connected to meteor database");
                }else {
                    console.log(`send data by device ID ${devID} & protocol ${devPro} from meteor database.`);
                    res.send(devices);
                }
              });
            });
        } else {
            db.collection('nms_sitelog').find({
                $and: [
                    {dev_id: devID},
                    query 
                ]
            }).sort({_id:-1}).limit(100).toArray(function(err, devices) {
                if(err){
                    console.log("not connected to database");
                }else {
                    console.log(`send data by device ID ${devID} & protocol ${devPro} from database.`);
                    res.send(devices);
                }
            });
        }

    });

};

/* <==================================$$$$$$$===============================> */
/* GET the latest data */
// example endpoint: /api/sitelog/lastone ==> result will be the last data inserted.
module.exports.getLast = (req, res) => {

    MongoClient.connect(db_url, function(err, db){

        if (err) {
            MongoClient.connect(db_url2, function(err, db){
                db.collection('nms_sitelog').find({}).sort({_id:-1}).limit(1).toArray(function(err, devices) {
                    if(err){
                    console.log("not connected to meteor database");
                    }else {
                        console.log('send last inserted data from meteor database.');
                        res.send(devices);
                    }
                });
            });
        } else {
            db.collection('nms_sitelog').find({}).sort({_id:-1}).limit(1).toArray(function(err, devices) {
                if(err){
                    console.log("not connected to database");
                }else {
                    console.log('send last inserted data from database.');
                    res.send(devices);
                }
            });
        }

    });

};

/* <==================================$$$$$$$===============================> */
/* GET the latest data by device ID */
// example endpoint: /api/sitelog/last_device?D=18 ==> result will be the last data inserted by device ID = 18.
module.exports.getLastDev = (req, res) => {

    var devId = req.query.D;
    var deviceId = parseInt(devId);

    MongoClient.connect(db_url, (err, db) => {

        if (err) {
            MongoClient.connect(db_url2, (err, db) => {
                db.collection('nms_sitelog').find({ dev_id : deviceId }).sort({ _id:-1 }).limit(1).toArray( (err, devices) => {
                    if(err){
                    console.log("not connected to meteor database");
                    }else {
                        console.log('send last inserted data by device ID ${deviceId} from meteor database.');
                        res.send(devices);
                    }
                });
            });
        } else {
            db.collection('nms_sitelog').find({ dev_id : deviceId }).sort({ _id:-1 }).limit(1).toArray( (err, devices) => {
                if(err){
                    console.log("not connected to database");
                }else {
                    console.log('send last inserted data by device ID ${deviceId} from database.');
                    res.send(devices);
                }
            });
        }

    });

};
