const MongoClient = require('mongodb').MongoClient;
const db_url = 'mongodb://localhost:27017/nms_db';

// Parsing Data Format: 18;H1=103.71&H2=241.81&H3=321.66&H4=577.234&H5=3079FA;20180704080031

module.exports.alarmData = function (data) {
    
    let timestamp = new Date(Date.now()).toLocaleString();
    // console.log(timestamp);
    
    console.log('================ALARM DATA==============');
    let Arr = data.split(';');
    console.log(Arr);
    let oneArr = Arr[1].charAt(0);
    let devID = parseInt(Arr[0]);
    // console.log(devID);

    if (oneArr == "[") {
        return console.log('This is Battery Data');
    } else {
        // console.log('This is not Battery Data');
        let w = Arr[1].split(/[=&]/);
        let keyArr =[];
        keyArr[0] = w[0];
        for ( var j=2; j<= w.length-2; j+=2) {
            keyArr.push(w[j]);
        }
        let valArr = [];
        valArr[0] = parseFloat( w[1] );
        for (j=3; j<= w.length; j+=2) {
                valArr.push( parseFloat( w[j] ) );
        }

        // let keyVal = {};
        // for (var i=0; i < keyArr.length; i++) {
        //     keyVal[keyArr[i]] = valArr[i];
        // }

        // let protocolNumber  = keyArr.length;
        // let valueNumber     = valArr.length;

        for (var k=0; k < keyArr.length; k++) {
            console.log('================ALARM DATA==============');
            let protocolName    = keyArr[k];
            console.log('protocol', protocolName);
            console.log('================ALARM DATA==============');
            let protocolValue   = valArr[k];
            console.log('value', protocolValue);
            console.log('================ALARM DATA==============');

            MongoClient.connect(db_url, function(err, db){

    //             let Kecuali = 6;

                if ( isNaN( devID ) !== true ) {

                     if ( devID !== 0 ) {
                      //get site_id & device_id
                      db.collection('nms_site_device').find({
                          dev_id: devID
                      }).sort({_id: -1}).limit(1).toArray(function(err, siteDevice) {
                          if (err) {
                              console.log(err);
                          }
                          let site_id = siteDevice[0].site_id;
                          let device_id = siteDevice[0].device_id;

                          //get siteName
                          db.collection('nms_site').find({
                              _id: site_id
                          }).sort({_id: -1}).limit(1).toArray(function(err, site) {
                              if (err) {
                                  console.log(err);
                              }
                              let siteName = site[0].name;

                              //get province
                              db.collection('nms_m_province').find({
                                  _id: site[0].province_id
                              }).sort({_id: -1}).limit(1).toArray(function(err, province) {
                                  if (err) {
                                      console.log(err);
                                  }
                                  let provinceName = province[0].name;

                                  //get deviceName
                                  db.collection('nms_m_device').find({
                                      _id: device_id
                                  }).sort({_id: -1}).limit(1).toArray(function(err, device) {
                                      if (err) {
                                          console.log(err);
                                      }
                                      let deviceName = device[0].name;

                                      //get Parameter & Unit
                                      //console.log('================ALARM DATA==============');
                                      //console.log('dev_id: ', devID);
                                      //console.log('================ALARM DATA==============');

                                      db.collection('nms_site_device_sensor')
                                      .find({ 
                                          $and: [
                                              {dev_id: devID},
                                              {protocol: protocolName}
                                          ] 
                                      })
                                      .limit(1).toArray((err, result) => {
                                          if(err){
                                              console.log(err);
                                          }else {
    //                                           console.log('================ALARM DATA==============');
    //                                           console.log('find result: ', result);
    //                                           console.log('================ALARM DATA==============');

                                              let parameter = result[0].sensor_name;
                                              let unit = result[0].unit;

                                              let value_min = result[0].value_min;
                                              let value_max = result[0].value_max;
                                              let major_min = result[0].major_min;
                                              let major_max = result[0].major_max;
                                              let limit_min = result[0].limit_min;
                                              let limit_max = result[0].limit_max;

                                              //...//
                                              let alarm_schema = {
                                                  Date: timestamp,
                                                  Site: `${siteName} (${provinceName})` ,
                                                  Device: deviceName,
                                                  Parameter: parameter,
                                                  Value: valArr[k],
                                                  Unit: unit
                                              };
                                              //...//

                                              // console.log('================ALARM DATA==============');
                                              // console.log('value', protocolValue);
                                              // console.log('================ALARM DATA==============');

                                              if (value_min < protocolValue && protocolValue < limit_min) {
                                                  let Alarm_status = "CRITICAL_MIN";
                                                  alarm_schema["Alarm_status"] = Alarm_status;
                                                  db.collection('nms_alarm_device').save( alarm_schema , (err,result) => {
                                                      if(err){
                                                  console.log("data not inserted.");
                                                      }else {
                                                  // console.log("data CRITICAL_MIN inserted to 'nms_alarm_device'.");
                                                      }
                                                  });
                                              } else if (limit_max <= protocolValue && protocolValue <= value_max) {
                                                  let Alarm_status = "CRITICAL_MAX";
                                                  alarm_schema["Alarm_status"] = Alarm_status;
                                                  db.collection('nms_alarm_device').save( alarm_schema , (err,result) => {
                                                      if(err){
                                                  console.log("data not inserted.");
                                                      }else {
                                                  // console.log("data CRITICAL_MAX inserted to 'nms_alarm_device'.");
                                                      }
                                                  });
                                              } else if (limit_min <= protocolValue && protocolValue <= major_min) {
                                                  let Alarm_status = "MAJOR_MIN";
                                                  alarm_schema["Alarm_status"] = Alarm_status;
                                                  db.collection('nms_alarm_device').save( alarm_schema , (err,result) => {
                                                      if(err){
                                                  console.log("data not inserted.");
                                                      }else {
                                                  // console.log("data MAJOR_MIN inserted to 'nms_alarm_device'.");
                                                      }
                                                  });
                                              } else if (major_max <= protocolValue && protocolValue <= limit_max) {
                                                  let Alarm_status = "MAJOR_MAX";
                                                  alarm_schema["Alarm_status"] = Alarm_status;
                                                  db.collection('nms_alarm_device').save( alarm_schema , (err,result) => {
                                                      if(err){
                                                  console.log("data not inserted.");
                                                      }else {
                                                  // console.log("data MAJOR_MAX inserted to 'nms_alarm_device'.");
                                                      }
                                                  });
                                              } else {
                                                  // console.log(`data device with dev_id ${ devID } is normal.`);
                                              }

                                          }
                                      });



                                  });

                              });
                              //next...
                          });
                      });

                    } else {
                      console.log('========================================');
                      console.log( 'dev_ID: ', devID );
                      console.log("data undefined => not inserted as alarm.");
                      console.log('========================================');
                    }


                } else {

                    console.log('========================================');
                    console.log( 'dev_ID: ', devID );
                    console.log("data undefined => not inserted as alarm.");
                    console.log('========================================');

                }

            }); 

        }
  
  }

}
