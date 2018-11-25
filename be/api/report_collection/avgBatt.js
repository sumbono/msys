// ============================================================================== //
// PART INPUT MODULE //
// ============================================================================== //
var MongoClient = require('mongodb').MongoClient;
var db_url      = 'mongodb://localhost:27017/nms_db';
var cron        = require('node-cron');
// ============================================================================== //

/* <==================================$$$$$$$===============================> */
exports.getAvgBatt = function () {

    cron.schedule('*/5 * * * *', function(){
//       cron.schedule('*/3 * * * * *', function(){

        MongoClient.connect(db_url, (err, db) => {
          
          //Get battery dev_id: start.
          db.collection('nms_m_device').find({name: "Battery"}).toArray((err, batt) => {
            
            let battId = batt[0]._id;
            
            db.collection('nms_site_device').find({device_id: battId}).toArray((err, battDev) => {
              
              if (battDev.length > 0 ) {
                
                battDev.forEach((batt_dev) => {
                  
                  let battDevId = batt_dev.dev_id;
                  
                  db.collection('nms_sitelog').find({dev_id: battDevId}).sort({_id: -1}).limit(1)
                    .toArray((err, result) => {
                    
                    let cell = [], volt = [], cTemp = [], iR = [], soc = [];
                    let avg_cell, avg_volt, avg_cTemp, avg_iR, avg_soc;
                    
                    let arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
                    
                    if (result.length > 0 ) {
                      
                      let battMentah = result[0].data;

                        battMentah.forEach((r) => {

                          cell.push(r[1]);
                          volt.push(r[2]);
                          // console.log('Volt:', volt);
                          
                          //Volt Average:
                          avg_volt = Math.round((arrAvg(volt) + 0.00001)*100) / 100;
                           // console.log('AVG Volt: ', avg_volt);

                          
                           cTemp.push(r[3]);
                          // console.log('Cell Temp:', cTemp);
                          //cTemp Average:
                          avg_cTemp = Math.round((arrAvg(cTemp) + 0.00001)*100) / 100;
                           // console.log('AVG CTemp: ', avg_cTemp);


                           iR.push(r[4]);
                          // console.log('Int. R: ' ,iR);
                          //iR Average:
                          avg_iR = Math.round((arrAvg(iR) + 0.00001)*100) / 100;
                           // console.log('AVG iR: ', avg_iR);


                           soc.push(r[5]);
                           // console.log('SoC: ', soc);
                          //SoC Average:
                          avg_soc = Math.round((arrAvg(soc) + 0.00001)*100) / 100;
                           // console.log('AVG SoC: ', avg_soc);
                          
                          // Inserting AVG Volt Value to site device sensor:
                          db.collection('nms_site_device_sensor').update(
                              { $and: [{dev_id: battDevId}, {protocol: "DA"}] },
                              {
                                  $set: { valueNow: avg_volt }
                              },
                          (err, result) => {
                              if(err){
                                console.log(`sensor volt avg for ${battDevId} data not updated.`);
                              }else {
                                // console.log(`sensor volt avg for ${battDevId} data updated.`);
                              }
                          });
                          
                          //AVG CTemp:
                          db.collection('nms_site_device_sensor').update(
                              { $and: [{dev_id: battDevId}, {protocol: "DB"}] },
                              {
                                  $set: { valueNow: avg_cTemp }
                              },
                          (err, result) => {
                              if(err){
                                console.log(`sensor cTemp avg for ${battDevId} data not updated.`);
                              }else {
                                // console.log(`sensor cTemp avg for ${battDevId} data updated.`);
                              }
                          });
                          
                          //AVG iR:
                          db.collection('nms_site_device_sensor').update(
                              { $and: [{dev_id: battDevId}, {protocol: "DC"}] },
                              {
                                  $set: { valueNow: avg_iR }
                              },
                          (err, result) => {
                              if(err){
                                console.log(`sensor iR avg for ${battDevId} data not updated.`);
                              }else {
                                // console.log(`sensor iR avg for ${battDevId} data updated.`);
                              }
                          });
                          
                          //AVG SoC:
                          db.collection('nms_site_device_sensor').update(
                              { $and: [{dev_id: battDevId}, {protocol: "DD"}] },
                              {
                                  $set: { valueNow: avg_soc }
                              },
                          (err, result) => {
                              if(err){
                                console.log(`sensor soc avg for ${battDevId} data not updated.`);
                              }else {
                                // console.log(`sensor soc avg for ${battDevId} data updated.`);
                              }
                          });
                          
                        });
                      
                      
                    } else {
                      console.log(`Battery data ${battDevId} for avgBatt was not received from MW.`);
                    }
                  });
                });
                
              } else {
                console.log(`No Battery device on site device collection. Register it.`);
              }
            });
          });
          
          //Get battery value parameters: finish.
          
        });

    });

}
/* <==================================$$$$$$$===============================> */
