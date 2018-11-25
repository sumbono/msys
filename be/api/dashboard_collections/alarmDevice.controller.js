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
      cron.schedule('*/1 * * * *', function(){

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
                      db.collection('nms_site_device_sensor').find({dev_id: devId}).toArray((err, param) => {
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

                            // let timeNow  = new Date(Date.now()).toLocaleString();
                            // let timestamp = new Date(Date.now()).getTime();

                            //miliseconds to Date Now:
                            // var alarmDate = new Date(+paramTs).toLocaleString();
                            
                            let alarmData = {
                              // Date: alarmDate,
                              // timestamp: paramTs,
                              // nowDate: now,
                              Site: siteName,
                              Device: devName,
                              dev_id: devId,
                              Parameter: paramName,
                              Value: paramValue
                            };

                            //if device is not a Door Sensor
                            if ( paramView !== "label") {

                              //if device is not a Camera
                              if ( paramName !== "Camera" ) {

                                //if timestamp is undefined
                                if (elParam.timestamp !== undefined) {

                                  //if alarm data was found on document
                                  if ( elParam.alarm !== undefined ) {

                                    let paramTs = elParam.timestamp;
                                    let alarmDate = new Date(+paramTs).toLocaleString();
                                    
                                    alarmData.Date = alarmDate;
                                    alarmData.timestamp = paramTs;

                                    //if alarm data is not NORMAL
                                    if ( elParam.alarm !== "NORMAL" ) {
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
                                    } else {
                                      //if alarm data is NORMAL
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
                                  
                                  //if alarm data was not found on document
                                  } else {

                                    let paramTs = elParam.timestamp;
                                    let alarmDate = new Date(+paramTs).toLocaleString();
                                    
                                    alarmData.Date = alarmDate;
                                    alarmData.timestamp = paramTs;

                                    // if the device is not 'battery'
                                    if ( paramView !== "battery" ) {

                                      //if value is CRITICAL
                                      if ( paramColor === "red" ) {
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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "red",
                                                      alarm: "CRITICAL_MIN"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

                                              }
                                          });
                                        } else {
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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "red",
                                                      alarm: "CRITICAL_MAX"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

                                              }
                                          });
                                        }
                                      
                                      //if value is MAJOR
                                      } else if ( paramColor === "yellow" ) {
                                        if (limit_min <= paramValue && paramValue <= major_min) {
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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "yellow",
                                                      alarm: "MAJOR_MIN"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

                                              }
                                          });  
                                        } else {
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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "yellow",
                                                      alarm: "MAJOR_MAX"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

                                              }
                                          });
                                        }

                                      //if value is NORMAL
                                      } else if (paramColor === "green") {
                                        
                                        if ( major_min <= paramValue && paramValue <= major_max ) {
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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "green",
                                                      alarm: "NORMAL"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

                                              }
                                          });
                                        
                                        } else if (value_min <= paramValue && paramValue < limit_min) {
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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "red",
                                                      alarm: "CRITICAL_MIN"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "red",
                                                      alarm: "MAJOR_MIN"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "red",
                                                      alarm: "MAJOR_MAX"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "red",
                                                      alarm: "CRITICAL_MAX"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

                                              }
                                          });
                                        } else {
                                          console.log(`this parameter is UNDEFINED.`);
                                        }
      
                                      } else {
                                        alarmData.Status = "UNDEFINED";
                                        db.collection('nms_device_undefined').findOneAndUpdate(
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

                                    //if progress view is 'battery"
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

                                  //if alarm data was found on document
                                  if ( elParam.alarm !== undefined ) {

                                    // let paramTs = elParam.timestamp;
                                    // let alarmDate = new Date(+paramTs).toLocaleString();
                                    
                                    // alarmData.Date = alarmDate;
                                    // alarmData.timestamp = paramTs;

                                    let timeNow   = new Date(Date.now()).toLocaleString();
                                    let timeNowMs = new Date(Date.now()).getTime();

                                    alarmData.Date = timeNow;
                                    alarmData.timestamp = timeNowMs;

                                    //if alarm data is not NORMAL
                                    if ( elParam.alarm !== "NORMAL" ) {
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
                                    } else {
                                      //if alarm data is NORMAL
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
                                  
                                  //if alarm data was not found on document
                                  } else {

                                    let timeNow   = new Date(Date.now()).toLocaleString();
                                    let timeNowMs = new Date(Date.now()).getTime();

                                    alarmData.Date = timeNow;
                                    alarmData.timestamp = timeNowMs;

                                    // if the device is not 'battery'
                                    if ( paramView !== "battery" ) {

                                      //if value is CRITICAL
                                      if ( paramColor === "red" ) {
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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "red",
                                                      alarm: "CRITICAL_MIN"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

                                              }
                                          });
                                        } else {
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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "red",
                                                      alarm: "CRITICAL_MAX"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

                                              }
                                          });
                                        }
                                      
                                      //if value is MAJOR
                                      } else if ( paramColor === "yellow" ) {
                                        if (limit_min <= paramValue && paramValue <= major_min) {
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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "yellow",
                                                      alarm: "MAJOR_MIN"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

                                              }
                                          });  
                                        } else {
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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "yellow",
                                                      alarm: "MAJOR_MAX"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

                                              }
                                          });
                                        }

                                      //if value is NORMAL
                                      } else if (paramColor === "green") {
                                        
                                        if ( major_min <= paramValue && paramValue <= major_max ) {
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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "green",
                                                      alarm: "NORMAL"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

                                              }
                                          });
                                        
                                        } else if (value_min <= paramValue && paramValue < limit_min) {
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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "red",
                                                      alarm: "CRITICAL_MIN"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "red",
                                                      alarm: "MAJOR_MIN"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "red",
                                                      alarm: "MAJOR_MAX"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

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

                                                db.collection('nms_site_device_sensor').findOneAndUpdate(
                                                  {
                                                    $and: [
                                                      { dev_id: devId },
                                                      { protocol_id: paramId },
                                                      { sensor_name: paramName },
                                                      { protocol: paramInit }
                                                    ]
                                                  },
                                                  {
                                                    $set: {
                                                      // colour: "red",
                                                      alarm: "CRITICAL_MAX"
                                                    }
                                                  },
                                                  // {
                                                  //   returnOriginal: false,
                                                  //   upsert: false
                                                  // },
                                                  (err,result) => {
                                                    if(err){
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                                    }else {
                                                      console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                                    }
                                                });

                                              }
                                          });
                                        } else {
                                          console.log(`this parameter is UNDEFINED.`);
                                        }
      
                                      } else {
                                        alarmData.Status = "UNDEFINED";
                                        db.collection('nms_device_undefined').findOneAndUpdate(
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

                                    //if progress view is 'battery"
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


                                  // console.log(`this param ${paramName} is not available on web.`);
                                  // let timeNow   = new Date(Date.now()).toLocaleString();
                                  // let timeNowMs = new Date(Date.now()).getTime();

                                  // alarmData.Date = timeNow;
                                  // alarmData.timestamp = timeNowMs;
                                  // alarmData.Status = "UNDEFINED-ON-WEB";

                                  // db.collection('nms_device_undefined').findOneAndUpdate(
                                  //   {
                                  //     $and: [
                                  //       {Site: siteName},
                                  //       {Device: devName},
                                  //       {dev_id: devId},
                                  //       {Parameter: paramName},
                                  //     ]
                                  //   },
                                  //   alarmData,
                                  //   {
                                  //     returnOriginal: false,
                                  //     upsert: true
                                  //   },
                                  //   (err,result) => {
                                  //     if(err){
                                  //       console.log(`this parameter of ${devName} in Site ${siteName} is not inserted.`);
                                  //     }else {
                                  //       console.log(`this parameter of ${devName} in Site ${siteName} is ${alarmData.Status}.`);
                                  //     }
                                  // });

                                }

                              //if the device is Camera
                              } else {
                                // console.log(`this is a Camera.`);

                                let timeNow   = new Date(Date.now()).toLocaleString();
                                let timeNowMs = new Date(Date.now()).getTime();

                                alarmData.Date = timeNow;
                                alarmData.timestamp = timeNowMs;
                                alarmData.Status = "UNDEFINED-CAMERA";

                                db.collection('nms_device_undefined').findOneAndUpdate(
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
                              // console.log(`this is a Door sensor.`);

                              let timeNow   = new Date(Date.now()).toLocaleString();
                              let timeNowMs = new Date(Date.now()).getTime();

                              alarmData.Date = timeNow;
                              alarmData.timestamp = timeNowMs;
                              alarmData.Status = "UNDEFINED-DOOR";

                              db.collection('nms_device_undefined').findOneAndUpdate(
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