// ============================================================================== //
// PART INPUT MODULE //
// ============================================================================== //
var MongoClient = require('mongodb').MongoClient;
var db_url      = 'mongodb://localhost:27017/nms_db';
var cron        = require('node-cron');
// ============================================================================== //

/* <==================================$$$$$$$===============================> */

exports.alarmDev = function () {

//     cron.schedule('* */1 * * * *', function(){
      cron.schedule('*/3 * * * *', function(){

        MongoClient.connect(db_url, (err, db) => {
          //GET site_id for all devices..
          db.collection('nms_site').find({}).toArray((err, site) => {
            if (err) {
              console.log(`not connected to site collection.`);
            } else {

              //Loop through each document sites: START
              for (let i=0; i<site.length; i++) {
                let elSite    = site[i];
                let siteId    = elSite._id;
                let siteName  = elSite.name;
                
                //GET all device's dev_id..
                db.collection('nms_site_device').find({site_id: siteId}).toArray((err, device) => {
                  if (err) {
                    console.log(`not connected to site device collection.`);
                  } else {

                    //Loop through each document devices: START
                    for (let j = 0; j < device.length; j++) {
                      let elDevice  = device[j];
                      let devId     = elDevice.dev_id;
                      let devName   = elDevice.title;

                      //GET all device's parameters..
                      db.collection('nms_site_device_sensor').find(
                        {  
                          $and: [
                              {dev_id: devId}, 
                              // {timestamp: {$exists: true}},
                          ]
                        }
                        ).toArray((err, param) => {
                        if (err) {
                          console.log(`not connected to site device sensor collection.`);
                        } else {

                          //Loop through each document parameters: START
                          for (let k = 0; k < param.length; k++) {
                            let elParam     = param[k];
                            let paramId     = elParam.protocol_id;
                            let paramName   = elParam.sensor_name;
                            let paramInit   = elParam.protocol;
                            let paramValue  = elParam.valueNow;
                            let paramColor  = elParam.colour;
                            let paramView   = elParam.sensor_view;
                            // let paramTs     = elParam.timestamp;

                            //treshold
                            let value_min = elParam.value_min;
                            let limit_min = elParam.limit_min;
                            let major_min = elParam.major_min;
                            let major_max = elParam.major_max;
                            let limit_max = elParam.limit_max;
                            let value_max = elParam.value_max;

                            let timeNow   = new Date(Date.now()).toLocaleString();
                            let timeNowMs = new Date(Date.now()).getTime();

                            //date tolerance for last inserted date: 3 day
                            let toleranceMs = 3*24*60*60*1000;

                            //last inserted date
                            // let paramTs = elParam.timestamp;
                            // let alarmDate = new Date(+paramTs).toLocaleString();

                            //miliseconds to Date Now:
                            // var alarmDate = new Date(+paramTs).toLocaleString();
                            
                            let alarmData = {
                              Site: siteName,
                              Device: devName,
                              dev_id: devId,
                              Parameter: paramName,
                              Value: paramValue,
                              // Date: alarmDate,
                              // timestamp: paramTs
                            };

                            //if device is not a Door Sensor
                            if ( paramView !== "label") {

                              //if device is not a Camera
                              if ( paramName !== "Camera" ) {

                                // //if timestamp is undefined
                                if (elParam.timestamp !== undefined) {

                                  //last inserted date
                                  let paramTs = elParam.timestamp;
                                  let alarmDate = new Date(+paramTs).toLocaleString();

                                  alarmData.Date = alarmDate;
                                  alarmData.timestamp = paramTs;

                                  //if alarm data was found on document
                                  if ( elParam.alarm !== undefined ) {

                                    //if alarm data is not NORMAL
                                    if ( elParam.alarm !== "NORMAL" ) {

                                      //if diff is more than tolerance
                                      if ( (timeNowMs - paramTs) >= toleranceMs ) {
                                        
                                        alarmData.Status = "CRITICAL_OFFLINE";

                                        db.collection('nms_alarm_device').findOneAndUpdate(
                                          {
                                            $and: [
                                              {Site: siteName},
                                              {Device: devName},
                                              {dev_id: devId},
                                              {Parameter: paramName},
                                            ]
                                          },
                                          alarmData,
                                          {
                                            returnOriginal: false,
                                            upsert: true
                                          },
                                          (err,result) => {
                                            if(err){
                                              console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                            }else {
                                              console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                            }
                                        });
                                      
                                      //if diff is less than tolerance
                                      } else {

                                        alarmData.Status = elParam.alarm;
                                        db.collection('nms_alarm_device').findOneAndUpdate(
                                          {
                                            $and: [
                                              {Site: siteName},
                                              {Device: devName},
                                              {dev_id: devId},
                                              {Parameter: paramName},
                                            ]
                                          },
                                          alarmData,
                                          {
                                            returnOriginal: false,
                                            upsert: true
                                          },
                                          (err,result) => {
                                            if(err){
                                              console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                            }else {
                                              console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                            }
                                        });

                                      }
                                    
                                    //if alarm data is NORMAL
                                    } else {

                                      //if diff is more than tolerance
                                      if ( (timeNowMs - paramTs) >= toleranceMs ) {
                                        
                                        alarmData.Status = "CRITICAL_OFFLINE";

                                        db.collection('nms_alarm_device').findOneAndUpdate(
                                          {
                                            $and: [
                                              {Site: siteName},
                                              {Device: devName},
                                              {dev_id: devId},
                                              {Parameter: paramName},
                                            ]
                                          },
                                          alarmData,
                                          {
                                            returnOriginal: false,
                                            upsert: true
                                          },
                                          (err,result) => {
                                            if(err){
                                              console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                            }else {
                                              console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                            }
                                        });
                                      
                                      //if diff is less than tolerance
                                      } else {

                                        alarmData.Status = elParam.alarm;
                                        db.collection('nms_device_normal').findOneAndUpdate(
                                          {
                                            $and: [
                                              {Site: siteName},
                                              {Device: devName},
                                              {dev_id: devId},
                                              {Parameter: paramName},
                                            ]
                                          },
                                          alarmData,
                                          {
                                            returnOriginal: false,
                                            upsert: true
                                          },
                                          (err,result) => {
                                            if(err){
                                              console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                            }else {
                                              console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                            }
                                        });
                                      }

                                    }
                                  
                                  //if alarm data was not found on document
                                  } else {

                                    //if diff is more than tolerance
                                    if ( (timeNowMs - paramTs) >= toleranceMs ) {

                                      alarmData.Status = "CRITICAL_OFFLINE";

                                      db.collection('nms_alarm_device').findOneAndUpdate(
                                        {
                                          $and: [
                                            {Site: siteName},
                                            {Device: devName},
                                            {dev_id: devId},
                                            {Parameter: paramName},
                                          ]
                                        },
                                        alarmData,
                                        {
                                          returnOriginal: false,
                                          upsert: true
                                        },
                                        (err,result) => {
                                          if(err){
                                            console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                          }else {
                                            console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                          }
                                      });
                                    
                                    //if diff is less than tolerance
                                    } else {

                                      if (value_min <= paramValue && paramValue < limit_min) {

                                        alarmData.Status = "CRITICAL_MIN";

                                        db.collection('nms_alarm_device').findOneAndUpdate(
                                          {
                                            $and: [
                                              {Site: siteName},
                                              {Device: devName},
                                              {dev_id: devId},
                                              {Parameter: paramName},
                                            ]
                                          },
                                          alarmData,
                                          {
                                            returnOriginal: false,
                                            upsert: true
                                          },
                                          (err,result) => {
                                            if(err){
                                              console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                            }else {
                                              console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                            }
                                        });
                                      } else if (limit_min <= paramValue && paramValue <= major_min) {

                                        alarmData.Status = "MAJOR_MIN";

                                        db.collection('nms_alarm_device').findOneAndUpdate(
                                          {
                                            $and: [
                                              {Site: siteName},
                                              {Device: devName},
                                              {dev_id: devId},
                                              {Parameter: paramName},
                                            ]
                                          },
                                          alarmData,
                                          {
                                            returnOriginal: false,
                                            upsert: true
                                          },
                                          (err,result) => {
                                            if(err){
                                              console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                            }else {
                                              console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                            }
                                        });
                                      } else if (major_max <= paramValue && paramValue <= limit_max) {

                                        alarmData.Status = "MAJOR_MAX";

                                        db.collection('nms_alarm_device').findOneAndUpdate(
                                          {
                                            $and: [
                                              {Site: siteName},
                                              {Device: devName},
                                              {dev_id: devId},
                                              {Parameter: paramName},
                                            ]
                                          },
                                          alarmData,
                                          {
                                            returnOriginal: false,
                                            upsert: true
                                          },
                                          (err,result) => {
                                            if(err){
                                              console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                            }else {
                                              console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                            }
                                        });
                                      } else if (limit_max <= paramValue && paramValue <= value_max) {

                                        alarmData.Status = "CRITICAL_MAX";

                                        db.collection('nms_alarm_device').findOneAndUpdate(
                                          {
                                            $and: [
                                              {Site: siteName},
                                              {Device: devName},
                                              {dev_id: devId},
                                              {Parameter: paramName},
                                            ]
                                          },
                                          alarmData,
                                          {
                                            returnOriginal: false,
                                            upsert: true
                                          },
                                          (err,result) => {
                                            if(err){
                                              console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                            }else {
                                              console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                            }
                                        });
                                      } else {

                                        alarmData.Status = "NORMAL";

                                        db.collection('nms_device_normal').findOneAndUpdate(
                                          {
                                            $and: [
                                              {Site: siteName},
                                              {Device: devName},
                                              {dev_id: devId},
                                              {Parameter: paramName},
                                            ]
                                          },
                                          alarmData,
                                          {
                                            returnOriginal: false,
                                            upsert: true
                                          },
                                          (err,result) => {
                                            if(err){
                                              console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                            }else {
                                              console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                            }
                                        });
                                      }

                                    }
                                  }
                              
                                } else {
                                  // console.log(`this device ${devName} with devID ${devId} on site ${siteName} is CRITICAL_OFFLINE..!!`);

                                  if ( paramName === "KWh" ) {

                                    alarmData.Date = timeNow ;
                                    alarmData.timestamp = timeNowMs;
                                    alarmData.Status = "NORMAL";

                                    db.collection('nms_device_normal').findOneAndUpdate(
                                      {
                                        $and: [
                                          {Site: siteName},
                                          {Device: devName},
                                          {dev_id: devId},
                                          {Parameter: paramName},
                                        ]
                                      },
                                      alarmData,
                                      {
                                        returnOriginal: false,
                                        upsert: true
                                      },
                                      (err,result) => {
                                        if(err){
                                          console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                        }else {
                                          console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                        }
                                    });

                                  } else if (paramValue === "NA") {

                                    alarmData.Date = "not_available" ;
                                    alarmData.timestamp = timeNowMs;
                                    alarmData.Status = "NOT_AVAILABLE";

                                    db.collection('nms_alarm_device').findOneAndUpdate(
                                      {
                                        $and: [
                                          {Site: siteName},
                                          {Device: devName},
                                          {dev_id: devId},
                                          {Parameter: paramName},
                                        ]
                                      },
                                      alarmData,
                                      {
                                        returnOriginal: false,
                                        upsert: true
                                      },
                                      (err,result) => {
                                        if(err){
                                          console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                        }else {
                                          console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                        }
                                    });
                                  } else {

                                    alarmData.Date = "unknown" ;
                                    alarmData.timestamp = timeNowMs;
                                    alarmData.Status = "CRITICAL_OFFLINE";

                                    db.collection('nms_alarm_device').findOneAndUpdate(
                                      {
                                        $and: [
                                          {Site: siteName},
                                          {Device: devName},
                                          {dev_id: devId},
                                          {Parameter: paramName},
                                        ]
                                      },
                                      alarmData,
                                      {
                                        returnOriginal: false,
                                        upsert: true
                                      },
                                      (err,result) => {
                                        if(err){
                                          console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                        }else {
                                          console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                        }
                                    });
                                  }

                                }

                              //if the device is Camera
                              } else {
                                alarmData.Date = timeNow;
                                alarmData.timestamp = timeNowMs;
                                alarmData.Status = "NORMAL";

                                db.collection('nms_device_normal').findOneAndUpdate(
                                  {
                                    $and: [
                                      {Site: siteName},
                                      {Device: devName},
                                      {dev_id: devId},
                                      {Parameter: paramName},
                                    ]
                                  },
                                  alarmData,
                                  {
                                    returnOriginal: false,
                                    upsert: true
                                  },
                                  (err,result) => {
                                    if(err){
                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                    }else {
                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                    }
                                });    
                              }
                            
                            //if the device is Door sensor
                            } else {
                              alarmData.Date = timeNow;
                              alarmData.timestamp = timeNowMs;
                              alarmData.Status = "NORMAL";

                              db.collection('nms_device_normal').findOneAndUpdate(
                                {
                                  $and: [
                                    {Site: siteName},
                                    {Device: devName},
                                    {dev_id: devId},
                                    {Parameter: paramName},
                                  ]
                                },
                                alarmData,
                                {
                                  returnOriginal: false,
                                  upsert: true
                                },
                                (err,result) => {
                                  if(err){
                                    console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                  }else {
                                    console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                  }
                              }); 
                            }
                            
                          }
                          //Loop through each document parameters: FINISH.
                        }
                      });
                    }
                    //Loop through each document devices: FINISH.
                  }
                });
              }
              //Loop through each document sites: FINISH.
            }
          });

          //Count number of devices
          // ........ //

        });

    });

}
/* <==================================$$$$$$$===============================> */