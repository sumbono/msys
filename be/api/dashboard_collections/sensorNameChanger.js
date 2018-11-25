// ============================================================================== //
// PART INPUT MODULE //
// ============================================================================== //
var MongoClient = require('mongodb').MongoClient;
var db_url      = 'mongodb://localhost:27017/nms_db';
var cron        = require('node-cron');
// ============================================================================== //

// cron.schedule('*/5 * * * * *', function(){

    MongoClient.connect(db_url, (err, db) => {
        //GET _id All Protocols/Parameters..  
        // db.collection('nms_m_protocol').find().snapshot().forEach( (elem) => {
        db.collection('nms_m_protocol').find({}).toArray((err, elem) => {
            if(err){
                console.log(`not connected to master protocol.`);
            }else {

                for (let i = 0; i < elem.length; i++) {
                    let param   = elem[i];
                    let paramID = param._id;
                    let sensorName  = param.sensor;
                    let protocolID  = param.protocol;

                    // console.log(protocolID);
                    
                    if ( protocolID !== "BQ45" ) {
                        db.collection('nms_site_device_sensor').updateMany(
                            { protocol_id: paramID },
                            {
                                $set: { sensor_name: sensorName, protocol: protocolID }
                            },
                        (err, result) => {
                            if(err){
                                console.log(`Parameter ${sensorName} not inserted to ${paramID}: ${protocolID}.`);
                            }else {
                                console.log(`Parameter ${sensorName} inserted to ${paramID}: ${protocolID}.`);
                            }
                        });
                    } else {
                        console.log(`this is blank protocol.`);
                    }
                }
            }
        });

    });
    
// });