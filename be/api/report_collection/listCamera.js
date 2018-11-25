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
exports.getListCamera = function () {

//     cron.schedule('*/3 * * * * *', function(){
      cron.schedule('*/55 * * * * *', function(){

        MongoClient.connect(db_url, (err, db) => {
            //ALL Devices. Start.
            db.collection('nms_site_device_sensor').find({sensor_name: "Camera" }).toArray((err, camera) => {
                if(err){
                    console.log("not connected to database");
                }else {
                    let listCamera = camera;
                    listCamera.forEach((object) => {
                      let devIdCam = object.dev_id;
                      let dateNow = new Date(Date.now());
                      let yearNow = dateNow.getFullYear();
                      let monthNow = dateNow.getMonth() + 1; //month count from zero.
                      // var currentDir = path.join(`/var/www/nms2/nms_v2/fe/public/`, `/camera/${devIdCam.toString()}/${yearNow.toString()}/`);
                      var currentDir = path.join(`/home/nms2/`, `/public/${devIdCam.toString()}/${yearNow.toString()}/`);
                                            
                      // fs.readdir(currentDir, ['**.jpg'], function(err, files){
                      fs.readdir(currentDir, function(err, files){
                        if (err) {
                          // console.log(`directory ${currentDir} not found.`);
                        } else {

                          if ( files !== undefined ) {

                            // console.log(typeof files);

                            var lastTenImage = files.slice(-10);
                              
                            // console.log(`${devIdCam} :`, lastTenImage);

                            lastTenImage.forEach((imageFile) => {

                              if (path.extname(imageFile) === ".jpg") {
  
                                  let fileExtSplit = imageFile.split(".");
                                  let fileNameSplit = fileExtSplit[0].split("_");
                                  let fileNameDate = fileNameSplit[0].replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
                                  let fileNameTime = fileNameSplit[1].replace(/(\d{2})(\d{2})(\d{2})/, "$1:$2:$3");
                                  let formatDate = new Date(fileNameDate).toDateString();
                                  let dateTime = formatDate + " | " + fileNameTime;
  
                                  let fileNameDateSplit = fileNameDate.split("-");
                                  let fileNameYear = fileNameDateSplit[0];
                                  let fileNameMonth = parseInt(fileNameDateSplit[1]).toString();
  
                                  let listImage = {
                                    dev_id: devIdCam,
                                    dev_ids: devIdCam.toString(),
                                    year: fileNameYear,
                                    month: fileNameMonth,
                                    date: dateTime,
                                    file: imageFile
                                  };
                                  
                                  db.collection('nms_list_camera').findOneAndUpdate( 
                                  { 
                                    $and: [
                                      { dev_id: devIdCam },
                                      { file: imageFile }
                                    ] 
                                  },
                                  listImage,
                                  {
                                      returnOriginal: false,
                                      upsert: true
                                    },
                                  (err, data) => {
                                      if (err) {
                                          console.log("not connected to database or collection not found.");
                                      } else {
                                        // console.log(`image list from camera dev_id ${devIdCam} inserted.`);
                                      }
                                  });
                                
                              } else {
                                console.log(`${devIdCam} : The file is not jpg.`);
                              }  


                            });

                            
                          } else {
                            console.log(`no more image files in this folder.`);
                          }


                        }
                        
                      }); 
                      
                    });
                }
            });
            //ALL Devices. Finish.

        });

    });

}
/* <==================================$$$$$$$===============================> */
