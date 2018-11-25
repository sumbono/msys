// ============================================================================== //
// PART INPUT MODULE //
// ============================================================================== //
var MongoClient = require('mongodb').MongoClient;
var db_url      = 'mongodb://localhost:27017/nms_db';
var cron        = require('node-cron');
// ============================================================================== //

/* <==================================$$$$$$$===============================> */
exports.getActiveDev = function () {

//     cron.schedule('* */1 * * * *', function(){
      cron.schedule('*/1 * * * *', function(){

        MongoClient.connect(db_url, (err, db) => {

          //GET all sites
          db.collection('nms_site').find({}).toArray((err, site) => {
            if (err) {
              console.log(`not connected to nms site`);
            } else {
              for (let index = 0; index < site.length; index++) {
                let eachSite = site[index];
                let siteId    = eachSite._id;
                let siteName  = eachSite.name;

                db.collection('nms_site_device').find({site_id: siteId}).toArray((err, device) => {
                  if (err) {
                    console.log(`not connected to site device`);
                  } else {
                    
                    for (let i = 0; i < device.length; i++) {

                      let elDevId = device[i].dev_id;
                      let devName = device[i].title;
      
                      let query = {};
                      query["timestamp"] = {$exists: true};
                      
                      db.collection('nms_site_device_sensor').find(
                        {
                          $and: [
                            {dev_id: elDevId},
                            query,
                          ]
                        },
                      ).limit(1).toArray((err, devSensor) => {
      
                        // console.log(devSensor[0]);
      
                        if ( devSensor.length > 0 ) {
      
                          //get ms from db
                          let msMark = devSensor[0].timestamp;
                          let alarmDate = new Date(+msMark).toLocaleString();
                          // let alarmDate = new Date(+msMark).toDateString();
      
                          //get ms for now
                          let timeNow   = new Date(Date.now()).toLocaleString();
                          let timeNowMs = new Date(Date.now()).getTime();
      
                          let msDay = 86400000; //ms in a day.
                          let compareMs = timeNowMs - msMark; //difference between timestamp.
      
                          if ( compareMs < msDay ) {

                            let activeDev = {
                              site: siteName,
                              device: devName,
                              dev_id: elDevId,
                              timestamp: msMark,
                              last_update: alarmDate
                            };
        
                            db.collection('nms_device_active').findOneAndUpdate(
                              {
                                $and: [
                                  {dev_id: elDevId},
                                  // {timestamp: msMark},
                                ]
                              },
                              activeDev,
                              {
                                returnOriginal: false,
                                upsert: true
                              },
                              (err,result) => {
                                if(err){
                                  console.log(`this devID ${elDevId} is not inserted.`);
                                } else {
                                  console.log(`this devID ${elDevId} inserted to device_active at ${alarmDate}.`);
                                }
                            });
                          } else {
                            let inActiveDev = {
                              site: siteName,
                              device: devName,
                              dev_id: elDevId,
                              timestamp: msMark,
                              last_update: alarmDate
                            };
        
                            db.collection('nms_device_inactive').findOneAndUpdate(
                              {
                                $and: [
                                  {dev_id: elDevId},
                                  // {timestamp: msMark},
                                ]
                              },
                              inActiveDev,
                              {
                                returnOriginal: false,
                                upsert: true
                              },
                              (err,result) => {
                                if(err){
                                  console.log(`this devID ${elDevId} is not inserted.`);
                                }else {
                                  console.log(`this devID ${elDevId} inserted to device_inactive at ${timeNow}.`);
                                }
                            });
                          }
      
                        } else {
                          // console.log(`this devID ${elDevId} was not found on site_device_sensor.`);
      
                          let timeNow   = new Date(Date.now()).toLocaleString();
                          let timeNowMs = new Date(Date.now()).getTime();
      
                          let inActiveDev = {
                            site: siteName,
                            device: devName,
                            dev_id: elDevId,
                            timestamp: timeNowMs,
                            last_update: "unknown"
                          };
      
                          db.collection('nms_device_inactive').findOneAndUpdate(
                            {
                              $and: [
                                {dev_id: elDevId},
                                // {timestamp: msMark},
                              ]
                            },
                            inActiveDev,
                            {
                              returnOriginal: false,
                              upsert: true
                            },
                            (err,result) => {
                              if(err){
                                console.log(`this devID ${elDevId} is not inserted.`);
                              }else {
                                console.log(`this devID ${elDevId} inserted to device_inactive at ${timeNow}.`);
                              }
                          });
      
                        }
      
                      });
                    }


                  }
                });
                
              }
            }


          });
          //GET 

          // //Active Devices..  
          // db.collection('nms_site_device').distinct( 'dev_id', (err, devices) => {
          //   if(err){
          //       console.log("not connected to site_device");
          //   }else {
          //     // let active_dev = devices.length;
          //     for (let i = 0; i < devices.length; i++) {
          //       let elDevId = devices[i];

          //       let query = {};
          //       query["timestamp"] = {$exists: true};
                
          //       db.collection('nms_site_device_sensor').find(
          //         {
          //           $and: [
          //             {dev_id: elDevId},
          //             query,
          //           ]
          //         },
          //       ).limit(1).toArray((err, devSensor) => {

          //         // console.log(devSensor[0]);

          //         if ( devSensor.length > 0 ) {

          //           //get ms from db
          //           let msMark = devSensor[0].timestamp;
          //           let alarmDate = new Date(+msMark).toLocaleString();
          //           // let alarmDate = new Date(+msMark).toDateString();

          //           //get ms for now
          //           let timeNow   = new Date(Date.now()).toLocaleString();
          //           let timeNowMs = new Date(Date.now()).getTime();

          //           let msDay = 86400000; //ms in a day.
          //           let compareMs = timeNowMs - msMark; //difference between timestamp.

          //           if ( compareMs < msDay ) {
          //             let activeDev = {
          //               dev_id: elDevId,
          //               timestamp: msMark,
          //               last_update: alarmDate
          //             };
  
          //             db.collection('nms_device_active').findOneAndUpdate(
          //               {
          //                 $and: [
          //                   {dev_id: elDevId},
          //                   // {timestamp: msMark},
          //                 ]
          //               },
          //               activeDev,
          //               {
          //                 returnOriginal: false,
          //                 upsert: true
          //               },
          //               (err,result) => {
          //                 if(err){
          //                   console.log(`this devID ${elDevId} is not inserted.`);
          //                 } else {
          //                   console.log(`this devID ${elDevId} inserted to device_active at ${alarmDate}.`);
          //                 }
          //             });
          //           } else {
          //             let inActiveDev = {
          //               dev_id: elDevId,
          //               timestamp: timeNowMs,
          //               last_update: timeNow
          //             };
  
          //             db.collection('nms_device_inactive').findOneAndUpdate(
          //               {
          //                 $and: [
          //                   {dev_id: elDevId},
          //                   // {timestamp: msMark},
          //                 ]
          //               },
          //               inActiveDev,
          //               {
          //                 returnOriginal: false,
          //                 upsert: true
          //               },
          //               (err,result) => {
          //                 if(err){
          //                   console.log(`this devID ${elDevId} is not inserted.`);
          //                 }else {
          //                   console.log(`this devID ${elDevId} inserted to device_inactive at ${timeNow}.`);
          //                 }
          //             });
          //           }

          //         } else {
          //           // console.log(`this devID ${elDevId} was not found on site_device_sensor.`);

          //           let timeNow   = new Date(Date.now()).toLocaleString();
          //           let timeNowMs = new Date(Date.now()).getTime();

          //           let inActiveDev = {
          //             dev_id: elDevId,
          //             timestamp: timeNowMs,
          //             last_update: timeNow
          //           };

          //           db.collection('nms_device_inactive').findOneAndUpdate(
          //             {
          //               $and: [
          //                 {dev_id: elDevId},
          //                 // {timestamp: msMark},
          //               ]
          //             },
          //             inActiveDev,
          //             {
          //               returnOriginal: false,
          //               upsert: true
          //             },
          //             (err,result) => {
          //               if(err){
          //                 console.log(`this devID ${elDevId} is not inserted.`);
          //               }else {
          //                 console.log(`this devID ${elDevId} inserted to device_inactive at ${timeNow}.`);
          //               }
          //           });

          //         }

          //       });
          //     }

          //   }
          // });
          // //Active Devices. Finish.

        });

    });

}
/* <==================================$$$$$$$===============================> */