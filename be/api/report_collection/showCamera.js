// ============================================================================== //
// PART INPUT MODULE //
// ============================================================================== //
var MongoClient = require('mongodb').MongoClient;
var db_url      = 'mongodb://localhost:27017/nms_db';
var cron        = require('node-cron');
var path        = require('path');
var fs          = require('fs');
var readdir     = require('readdir');
// ============================================================================== //
// folder untuk foto dari camera:
// nms/api/public/camera/dev_id/yyyy/...(filename: "yyyymmdd_hhmmss.jpg")...
/* <==================================$$$$$$$===============================> */
exports.getShowCamera = function () {

//     cron.schedule('*/3 * * * * *', function(){
      cron.schedule('*/50 * * * * *', function(){

        MongoClient.connect(db_url, (err, db) => {
            //ALL Devices. Start.
            db.collection('nms_site_device_sensor').find({sensor_name: "Camera" }).toArray((err, camera) => {
                if(err){
                    console.log("not connected to database");
                }else {
                  // console.log(camera);
                    let listCamera = camera;

                    for (let index = 0; index < listCamera.length; index++) {
                      const elCam = listCamera[index];

                      // console.log(devIdCam);
                      db.collection('nms_list_camera')
                        // .find({dev_id: devIdCam}, {fields:{_id: 0}})
                        .find({dev_id: elCam.dev_id})
                        // .sort({_id: -1})
                        .sort({file: -1})
                        .limit(7)
                        .toArray((err, imgCam) => {
                          if (err) {
                            console.log(`not connected to list camera collection.`);
                          } else {
                            
                            // console.log(imgCam);

                            if (imgCam.length > 0) {

                              db.collection('nms_show_camera').remove({dev_id: elCam.dev_id}, (err, result) => {
                                if (err) {
                                  console.log(`not connected to show camera collection.`);
                                } else {

                                  db.collection('nms_show_camera').insertMany(imgCam, (err, showCamera) => {
                                    if (err) {
                                      console.log(`not connected to show camera to update documents.`);
                                    } else {
                                      // console.log(`show camera updated for devID ${elCam.dev_id}.`);
                                    }
                                  });

                                }
                              });

                            } else {
                              console.log(`image with devID ${elCam.dev_id} was not found.`);
                            }

                          }

                      });
                      
                    }

                }
            });
            //ALL Devices. Finish.

        });

    });

}
/* <==================================$$$$$$$===============================> */

// for (let i = 0; i < imgCam.length; i++) {
                                    
                                  //   const objCam = imgCam[i];
                                    
                                  //   db.collection('nms_show_camera').save(objCam, (err, showCamera) => {
                                  //     if (err) {
                                  //       console.log(`not connected to show camera to update documents.`);
                                  //     } else {
                                  //       console.log(`show camera updated for devID ${elCam.dev_id}.`);
                                  //     }
                                  //   });

                                  // }

                                  // imgCam.forEach((objCam) => {
                                  // });

                                  // listCamera.forEach((object) => {
                    //   let devIdCam = object.dev_id;
                    // });