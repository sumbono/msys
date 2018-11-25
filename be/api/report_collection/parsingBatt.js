// ============================================================================== //
// PART INPUT MODULE //
// ============================================================================== //
var MongoClient = require('mongodb').MongoClient;
var db_url      = 'mongodb://localhost:27017/nms_db';
var cron        = require('node-cron');
// ============================================================================== //

/* <==================================$$$$$$$===============================> */
exports.getParseBatt = function () {

    cron.schedule('*/5 * * * *', function(){
//       cron.schedule('*/3 * * * * *', function(){

        MongoClient.connect(db_url, (err, db) => {
          
          //Get battery dev_id: start.
          db.collection('nms_m_device').find({name: "Battery"}).toArray((err, batt) => {
            
            let battId = batt[0]._id;
            
            db.collection('nms_site_device').find({device_id: battId}).toArray((err, battDev) => {
              
              if (battDev.length > 0 ) {

                for (let index = 0; index < battDev.length; index++) {

                  let be = battDev[index];

                  db.collection('nms_sitelog').find({dev_id: be.dev_id }).sort({_id: -1}).limit(1)
                    .toArray((err, result) => {
                    
                    let cell = [], volt = [], cTemp = [], iR = [], soc = [];
                    let vColor = [], cTempColor = [], iRColor = [], socColor = [];
                    
                    if (result.length > 0 ) {
                      
                      let battMentah = result[0].data; //=> array of array
                      let createdOn = result[0].createdOn;

                      for ( var i=0; i<battMentah.length; i++) {
                        let r = battMentah[i];

                        //cell number:
                        cell.push(r[1]);
                        
                        //cell voltage:
                        volt.push(r[2]);
                        if (0.0 <= r[2] && r[2] < 12.5) {
                          vColor.push("red");
                        } else if (12.5 <= r[2] && r[2] <= 13.0) {
                          vColor.push("orange");
                        } else if (14.7 <= r[2] && r[2] <= 14.9) {
                          vColor.push("orange");
                        } else if (14.9 < r[2] && r[2] <= 15.0) {
                          vColor.push("red");
                        } else {
                          vColor.push("green");
                        }
                        
                        //cell temp:
                        cTemp.push(r[3]);
                        if (0.0 <= r[3] && r[3] < 0.0) {
                          cTempColor.push("red");
                        } else if (0.0 <= r[3] && r[3] <= 0.0) {
                          // cTempColor.push("yellow");
                          cTempColor.push("orange");
                        } else if (20.1 <= r[3] && r[3] <= 25.1) {
                          // cTempColor.push("yellow");
                          cTempColor.push("orange");
                        } else if (25.1 < r[3] && r[3] <= 47.0) {
                          cTempColor.push("red");
                        } else {
                          cTempColor.push("green");
                        }

                        //cell iR:
                        iR.push(r[4]);
                        if (0.0 <= r[4] && r[4] < 0.0) {
                          iRColor.push("red");
                        } else if (0.0 <= r[4] && r[4] <= 0.0) {
                          // iRColor.push("yellow");
                          iRColor.push("orange");
                        } else if (7.25 <= r[4] && r[4] <= 10.0) {
                          // iRColor.push("yellow");
                          iRColor.push("orange");
                        } else if (10.0 < r[4] && r[4] <= 100.0) {
                          iRColor.push("red");
                        } else {
                          iRColor.push("green");
                        }

                        //cell SoC:
                        soc.push(r[5]);
                        if (0.0 <= r[5] && r[5] < 30.0) {
                          socColor.push("red");
                        } else if (30.0 <= r[5] && r[5] <= 60.0) {
                          // socColor.push("yellow");
                          socColor.push("orange");
                        } else if (100.0 <= r[5] && r[5] <= 100.0) {
                          // socColor.push("yellow");
                          socColor.push("orange");
                        } else if (100.0 < r[5] && r[5] <= 100.0) {
                          socColor.push("red");
                        } else {
                          socColor.push("green");
                        }
                      }

                      let timestamp = new Date(Date.now());
                      // let msStamp = timestamp.getTime();
                                                  
                      let battParsed = {
                        dev_id: be.dev_id,
                        num_cell: cell,
                        num_volt: volt,
                        num_cell_temp: cTemp,
                        num_iR: iR,
                        num_soc: soc,
                        num_volt_color: vColor,
                        num_ctemp_color: cTempColor,
                        num_ir_color: iRColor,
                        num_soc_color: socColor,
                        lastUpdated: timestamp,
                        createdOn: createdOn
                      };

                      db.collection('nms_battery_parsed')
                        .findAndModify(
                          {dev_id: be.dev_id},
                          [['_id', 'descending']],
                          {$set: battParsed},
                          {
                            new: true,
                            upsert: true
                          }, 
                        (err, result) => {
                          if (err) {
                            console.log(`data battery ${be.dev_id} not parsed at ${timestamp}.`);
                          } else {
                            console.log(`data battery ${be.dev_id} parsed at ${timestamp}.`);

                            // Update Battery timestamp: Start
                            if ( createdOn !== undefined ) {
                              db.collection('nms_site_device_sensor').updateMany(
                                {
                                  $and: [
                                    {dev_id: be.dev_id},
                                    {sensor_view: "battery"}
                                  ]
                                },
                                { 
                                  $set: {
                                    timestamp: Date.parse(createdOn)
                                  }
                                },
                              (err, result) => {
                                if(err){
                                  console.log("sensor battery timestamp not inserted.");
                                }else {
                                  console.log(`sensor battery timestamp updated.`);
                                }
                              });
                            } else {
                              // var d = new Date(Date.now());
                              // var t = d.getTime(); //in milisecond.
                              let timestampS = timestamp.getTime(); //in second.
                              db.collection('nms_site_device_sensor').updateMany(
                                {
                                  $and: [
                                    {dev_id: be.dev_id},
                                    {sensor_view: "battery"}
                                  ]
                                },
                                { 
                                  $set: {
                                    timestamp: timestampS
                                  }
                                },
                              (err, result) => {
                                if(err){
                                  console.log("sensor battery timestamp not inserted.");
                                }else {
                                  console.log(`sensor battery timestamp updated.`);
                                }
                              });

                            }
                            
                          }
                      });

                    } else {
                      console.log(`Battery data ${be.dev_id} was not received from MW.`);
                      
                      let timestamp = new Date(Date.now());
                      let timestampLocal = timestamp.toLocaleString();
                      // let timestampS = timestamp.getTime(); //in second.

                      let parsedBatt = {
                          dev_id: be.dev_id,
                          num_cell: [1],
                          num_volt: [0],
                          num_cell_temp: [0],
                          num_iR: [0],
                          num_soc: [0],
                          num_volt_color: ['red'],
                          num_ctemp_color: ['red'],
                          num_ir_color: ['red'],
                          num_soc_color: ['red'],
                          lastUpdated: timestamp,
                          createdOn: timestampLocal
                      };
                      
                      db.collection('nms_battery_parsed')
                        .findOneAndUpdate(
                          {dev_id: be.dev_id},
                          parsedBatt,
                          {
                            returnOriginal: false,
                            upsert: true
                          }, 
                        (err, result) => {
                          if (err) {
                            console.log(`data battery ${be.dev_id} not parsed at ${timestamp}.`);
                          } else {
                            // console.log(`data battery ${battDevId} parsed as 0 at ${timestamp}.`);

                          }
                      });
                      
                      
                    }
                  });
                  
                }
                
                // battDev.forEach((batt_dev) => {

                //   let battDevId = batt_dev.dev_id;
                // });
                
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
