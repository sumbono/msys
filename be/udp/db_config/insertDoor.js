const MongoClient = require('mongodb').MongoClient;
const db_url = 'mongodb://localhost:27017/nms_db';
var ObjectID = require('mongodb').ObjectID;

module.exports.insertDoor = function (data){
    //tambahan jika dev_id: undefined
    if ( isNaN(data.dev_id) !== true ) {

        MongoClient.connect(db_url, function(err, db) {
            if (err) {
                console.log(`sensor data ${data.dev_id} not inserted to Mongo Host at ${ data.createdOn }.`);
            } else {

                if ( (data.dev_id) === 0 ) {
                    db.collection('nms_site_status_link').findOneAndUpdate( 
                      { site: data['site'] }, 
                      { $set: { status: data['status'], createdOn: data['createdOn'] } }, 
                      (err,result) => {
                        if(err){
                           console.log(`status ${ data.status } on site link ${ data.site } not inserted.`);
                        }else {
                          // console.log(`status ${ data.status } on site link ${ data.site } inserted.`);
                        }
                    });
                  } else {
                    //Door & Dehidrator data
                    db.collection('nms_site_device_sensor').find({
                        $and: [
                            {protocol_id: new ObjectID("5b7bcaa615bcf00cd3dabf88")}
                        ]
                    })
                    .toArray((err, doorData) => {
                        if (err) {
                            console.log(`sensor data with _id Door was not found.`);
                        } else {
                            doorData.forEach((elem) => {
                                if ( elem !== undefined ) {
                                    if ( elem.dev_id == data.dev_id ) {
                                        let sensorValueNow = data.data;
                                        for (let key in sensorValueNow) {
                                            if ( key == "WD" ) {
                                                if ( sensorValueNow[key] == 1 ) {
                                                    db.collection('nms_site_device_sensor').findOneAndUpdate( 
                                                        { 
                                                            $and: [
                                                                { dev_id: elem.dev_id },
                                                                { protocol: "WD" }
                                                            ] 
                                                        }, 
                                                        { $set: { colour: "danger" , condition: "OPEN" } }, 
                                                        (err,result) => {
                                                          if(err){
                                                            // console.log(`status ${ data.dev_id } not updated.`);
                                                          }else {
                                                            // console.log(`status ${ data.dev_id } was OPEN.`);
                                                          }
                                                    });
                                                } else {
                                                    db.collection('nms_site_device_sensor').findOneAndUpdate( 
                                                        { 
                                                            $and: [
                                                                { dev_id: elem.dev_id },
                                                                { protocol: "WD" }
                                                            ] 
                                                        }, 
                                                        { $set: { colour: "success" , condition: "CLOSE" } }, 
                                                        (err,result) => {
                                                          if(err){
                                                            // console.log(`status ${ data.dev_id } not updated.`);
                                                          }else {
                                                            // console.log(`status ${ data.dev_id } was CLOSE.`);
                                                          }
                                                    });
                                                }
                                            } else {
                                                if ( sensorValueNow[key] == 1 ) {
                                                    db.collection('nms_site_device_sensor').findOneAndUpdate( 
                                                        { 
                                                            $and: [
                                                                { dev_id: elem.dev_id },
                                                                { protocol: key }
                                                            ] 
                                                        }, 
                                                        { $set: { colour: "success" , condition: "Not Active" } }, 
                                                        (err,result) => {
                                                          if(err){
                                                            // console.log(`status ${ data.dev_id } not updated.`);
                                                          }else {
                                                            console.log(`status ${ data.dev_id } was Not Active.`);
                                                          }
                                                    });
                                                } else {
                                                    db.collection('nms_site_device_sensor').findOneAndUpdate( 
                                                        { 
                                                            $and: [
                                                                { dev_id: elem.dev_id },
                                                                { protocol: key }
                                                            ] 
                                                        }, 
                                                        { $set: { colour: "danger" , condition: "ACTIVE" } }, 
                                                        (err,result) => {
                                                          if(err){
                                                            // console.log(`status ${ data.dev_id } not updated.`);
                                                          }else {
                                                            console.log(`status ${ data.dev_id } was ACTIVE.`);
                                                          }
                                                    });
                                                }
                                            }
                                        }
                                    } else {
                                        // console.log(`this devID ${data.dev_id} not Door / Dehidrator.`);

                                        //==UPS data==//
                                        db.collection('nms_site_device_sensor').find({
                                            $and: [
                                                {sensor_view: "ups"}
                                            ]
                                        })
                                        .toArray((err, upsData) => {
                                            if (err) {
                                                console.log(`sensor data with sensor_view ups was not found.`);
                                            } else {
                                                upsData.forEach((elem) => {
                                                    if (elem !== undefined ) {
                                                        if ( elem.dev_id == data.dev_id ) {
                                                            let upsValueNow = data.data;
                                                            for (const key in upsValueNow) {
                                                                if ( upsValueNow[key] == 1 ) {
                                                                    db.collection('nms_site_device_sensor').findOneAndUpdate( 
                                                                        { 
                                                                            $and: [
                                                                                { dev_id: elem.dev_id },
                                                                                { protocol: key }
                                                                            ] 
                                                                        }, 
                                                                        { $set: { valueNow: 1, persent: 100, colour: "green" } },
                                                                        (err,result) => {
                                                                          if(err){
                                                                            // console.log(`status ${ data.dev_id } not updated.`);
                                                                          }else {
                                                                            // console.log(`status ${ data.dev_id } with ${key} was updated.`);
                                                                          }
                                                                    });
                                                                } else {
                                                                    db.collection('nms_site_device_sensor').findOneAndUpdate( 
                                                                        { 
                                                                            $and: [
                                                                                { dev_id: elem.dev_id },
                                                                                { protocol: key }
                                                                            ] 
                                                                        }, 
                                                                        { $set: { valueNow: 0, persent: 0, colour: "red" } }, 
                                                                        (err,result) => {
                                                                          if(err){
                                                                            // console.log(`status ${ data.dev_id } not updated.`);
                                                                          }else {
                                                                            // console.log(`status ${ data.dev_id } with ${key} was updated.`);
                                                                          }
                                                                    });
                                                                }
                                                            }
                                                        } else {
                                                            // console.log(`this devID ${data.dev_id} is not UPS.`);
                                                        }
                                                    } else {
                                                        console.log(`sensor data with sensor_view ups was not found.`);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                } else {
                                    console.log(`sensor data with _id Door was not found..`);
                                }
                            });
                        }
                    });
                }
            }
        });
    } else {
        console.log(`data ${data.dev_id} undefined => not inserted.`);
    }
}