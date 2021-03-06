const MongoClient = require('mongodb').MongoClient;
const db_url = 'mongodb://localhost:27017/nms_db';
// const db_url2 = 'mongodb://localhost:3001/meteor'; 
// untuk akses ke meteor mongo, meteor harus dijalankan lebih dahulu, 
// baru tcpServer.js bisa mengakses DB dan App tidak crash.

module.exports.insertData = function (data){
    //tambahan jika dev_id: undefined
    if ( isNaN(data.dev_id) !== true ) {
        MongoClient.connect(db_url, function(err, db) {

            // if (err) {
            //     MongoClient.connect(db_url2, function(err, db){
            //         db.collection('nms_sitelog').save(data , (err,result) => {
            //             if(err){
            //               console.log(`data ${ data.dev_id } not inserted at ${ data.createdOn }.`);
            //             }else {
            //               console.log(`data ${ data.dev_id } inserted at ${ data.createdOn }.`);
            //             }
            //         });
            //     });
            // } else {

                if ( (data.dev_id) === 0 ) {
                  console.log(`status ${ data.status } on site link ${ data.site } updated.`);
                } else {

                    //Insert all received data (except door, dehidrator, ups status) here..: START
                    db.collection('nms_sitelog').save(data , (err,result) => {
                        if(err){
                            console.log(`sensor data ${data.dev_id} not inserted to Mongo Host at ${ data.createdOn }.`);
                        }else {
                            console.log(`sensor data ${data.dev_id} inserted to Mongo Host at ${ data.createdOn }.`);
                        }
                    });
                    //Insert all received data (except door, dehidrator, ups status) here..: FINISH.

                    //Added sensor value to valueNow: Start
                    // db.collection('nms_site_device').distinct( 'dev_id', (err, devices) => {
                    //     if(err){
                    //         console.log("not connected to database");
                    //     }else {
                                let sensorValueNow = data.data;
                                
                                for (let key in sensorValueNow) {

                                    //Set valueNow & timestamp: start.
                                    db.collection('nms_site_device_sensor').findOneAndUpdate(
                                        {
                                          $and: [
                                            {dev_id: data['dev_id']},
                                            {protocol: key}
                                          ]
                                        },
                                        { 
                                          // $set: {valueNow: sensorValueNow[key]}
                                          $set: { 
                                            valueNow: Math.round((sensorValueNow[key] + 0.00001)*100) / 100,
                                            timestamp: data.timestamp 
                                          }
                                        },
                                      (err, result) => {
                                        if(err){
                                          console.log("sensor valueNow not inserted.");
                                        }else {
                                          // console.log(`sensor valueNow ${sensorValueNow[key]} inserted to ${data['dev_id']}: ${key}.`);
                                        }
                                    });
                                    // Set valueNow & timestamp: finish.
                                    
                                    //Set the colour devsensor: Start
                                    if ( data.type === undefined ) {

                                      //Set alarm status: Start
                                      db.collection('nms_site_device_sensor').find({
                                          $and: [
                                            {dev_id: data['dev_id']},
                                            {protocol: key}
                                          ]
                                        })
                                      .limit(1).toArray((err, result) => {
                                        if(err){
                                          console.log(`device ${data.dev_id} with protocol ${key} not found in nms_site_device_sensor, register it first!`);
                                        } else {
                                          // console.log( result[0] );

                                          if (result.length > 0) {
                                            let value_min = result[0].value_min;
                                            let value_max = result[0].value_max;
                                            let major_min = result[0].major_min;
                                            let major_max = result[0].major_max;
                                            let limit_min = result[0].limit_min;
                                            let limit_max = result[0].limit_max;

                                            //GREEN
                                            if (major_min < sensorValueNow[key] && sensorValueNow[key] < major_max) {
                                              // Update Color Value: Start
                                              db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                {
                                                  $and: [
                                                    {dev_id: data['dev_id']},
                                                    {protocol: key},
                                                    {sensor_view: "progress"}
                                                  ]
                                                },
                                                { 
                                                  $set: {
                                                    colour: "green",
                                                    alarm: "NORMAL",
                                                    // timestamp: data.timestamp
                                                  }
                                                },
                                              (err, result) => {
                                                if(err){
                                                  console.log("sensor colour not inserted.");
                                                }else {
                                                  // console.log(`sensor colour updated to green.`);
                                                }
                                              });
                                              // Update Color Value: Finish.

                                            //YELLOW (MIN)
                                            } else if (limit_min < sensorValueNow[key] && sensorValueNow[key] <= major_min) {
                                              // Update Color Value: Start
                                              db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                {
                                                  $and: [
                                                    {dev_id: data['dev_id']},
                                                    {protocol: key},
                                                    {sensor_view: "progress"}
                                                  ]
                                                },
                                                { 
                                                  $set: {
                                                    colour: "yellow",
                                                    alarm: "MAJOR_MIN",
                                                    // timestamp: data.timestamp
                                                  }
                                                },
                                              (err, result) => {
                                                if(err){
                                                  console.log("sensor colour not inserted.");
                                                }else {
                                                  // console.log(`sensor colour updated to yellow.`);
                                                }
                                              });
                                              // Update Color Value: Finish.

                                            //YELLOW (MAX)
                                            } else if (major_max <= sensorValueNow[key] && sensorValueNow[key] < limit_max) {
                                              // Update Color Value: Start
                                              db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                {
                                                  $and: [
                                                    {dev_id: data['dev_id']},
                                                    {protocol: key},
                                                    {sensor_view: "progress"}
                                                  ]
                                                },
                                                { 
                                                  $set: {
                                                    colour: "yellow",
                                                    alarm: "MAJOR_MAX",
                                                    // timestamp: data.timestamp
                                                  }
                                                },
                                              (err, result) => {
                                                if(err){
                                                  console.log("sensor colour not inserted.");
                                                }else {
                                                // console.log(`sensor colour updated to yellow.`);
                                                }
                                              });
                                              // Update Color Value: Finish.

                                            //RED (MIN)
                                            } else if (value_min <= sensorValueNow[key] && sensorValueNow[key] <= limit_min) {
                                              // Update Color Value: Start
                                              db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                {
                                                  $and: [
                                                    {dev_id: data['dev_id']},
                                                    {protocol: key},
                                                    {sensor_view: "progress"}
                                                  ]
                                                },
                                                { 
                                                  $set: {
                                                    colour: "red",
                                                    alarm: "CRITICAL_MIN",
                                                    // timestamp: data.timestamp
                                                  }
                                                },
                                              (err, result) => {
                                                if(err){
                                                  console.log("sensor colour not inserted.");
                                                }else {
                                                // console.log(`sensor colour updated to red.`);
                                                }
                                              });
                                              // Update Color Value: Finish.

                                            //RED (MAX)
                                            } else {
                                              // Update Color Value: Start
                                              db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                {
                                                  $and: [
                                                    {dev_id: data['dev_id']},
                                                    {protocol: key},
                                                    {sensor_view: "progress"}
                                                  ]
                                                },
                                                { 
                                                  $set: {
                                                    colour: "red",
                                                    alarm: "CRITICAL_MAX",
                                                    // timestamp: data.timestamp
                                                  }
                                                },
                                              (err, result) => {
                                                if(err){
                                                  console.log("sensor colour not inserted.");
                                                }else {
                                                // console.log(`sensor colour updated to red.`);
                                                }
                                              });
                                              // Update Color Value: Finish.
                                            }

                                          } else {
                                            console.log(`device ${data.dev_id} with protocol ${key} not found in nms_site_device_sensor, register it first!`);
                                          }

                                        }
                                    });
                                    //Set alarm status: Finish.

                                    } else {
                                      console.log(`This is battery raw data, not to parse here to alarm device.`);
                                    }

                                }
                    //     }
                    // });
                    //Added sensor value to valueNow: Finish.
                    
                    //Set persent value: start.
                      //code here...
                    //Set persent value: finish.
               }
            // }
        });
    } else {
        console.log(`data ${data.dev_id} undefined => not inserted.`);
    }
}
