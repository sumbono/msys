// ============================================================================== //
// PART INPUT MODULE //
// ============================================================================== //
var MongoClient = require('mongodb').MongoClient;
var db_url      = 'mongodb://localhost:27017/nms_db';
var cron        = require('node-cron');
// ============================================================================== //
// GET DATA //
// ============================================================================== //

/* <==================================$$$$$$$===============================> */
/* GET the list of active device by device ID */
// example endpoint: /api/sitelog/active_device ==> result will be the list of active device by device ID.

exports.getGraphDataRx = function () {

  cron.schedule('*/1 * * * *', function(){

    MongoClient.connect(db_url, (err, db) => {
      
      //GET RX _id: Start
      db.collection('nms_m_device_category').find({name: "Satellite Receiver"}).toArray((err, devcat) => {
        if (err) {
          console.log(`not connected to device category collections.`);
        } else {
          
          let idTx = devcat[0]._id;

          //GET all sites: Start
          db.collection('nms_site').find({}).toArray((err, sites) => {
            if (err) {
              console.log(`not connected to site collection.`);
            } else {

              //Loop for each site to find RX device: Start
              for (let i = 0; i < sites.length; i++) {
                let eachSite = sites[i];
                let idSite = eachSite._id;
                let siteName = eachSite.name;
                let siteNumber = eachSite.site_id;
                db.collection('nms_site_device').find(
                  {
                    $and: [
                      {device_category_id: idTx},
                      {site_id: idSite}
                    ] 
                  }
                  )
                  .toArray((err, device) => {
                    if ( err ) {
                      console.log(`not connected to site device`);
                    } else {
                      if (device.length > 0 ) {

                        //Loop for each RX device find its values: Start
                        for (let j = 0; j < device.length; j++) {
                          let TxDev = device[j];
                          let TxDevId = TxDev.dev_id;
                          let TxTitle = TxDev.title;
                          let TxDevNameId = TxDev.device_id;

                          db.collection('nms_m_device').find(
                            {
                              _id: TxDevNameId
                            }
                            )
                            .toArray((err, devname) => {
                              let txName = devname[0].name;
                              db.collection('nms_site_device_sensor').find(
                                {
                                  $and: [
                                    {dev_id: TxDevId},
                                    // {protocol_id: idProtocol}
                                    { 
                                      protocol: { 
                                        $in: ["HB", "HE"] 
                                      } 
                                    }
                                  ]
                                }
                                )
                                .toArray((err, param) => {
                                  if (err) {
                                    console.log(`not connected to site device sensor.`);
                                  } else {

                                    //elements of param always 1.
                                    if ( param.length > 0 ) {
                                      let txGraph = {
                                        site: `${siteName}-${TxTitle}`,
                                        site_id: siteNumber,
                                        // device_name: txName,
                                        // device: TxTitle,
                                        dev_id: TxDevId,
                                      };

                                      let firstParamInit = param[0].protocol;
                                      let firstParamValue = param[0].valueNow;
                                      // let firstParamUnit = param[0].unit;

                                      if ( param[0].timestamp !== undefined) {
                                        let ms = param[0].timestamp;
                                        let msDate = new Date(+ms).toLocaleString();
                                        txGraph.last_update = msDate;

                                        if ( firstParamInit === "HB" ) {
                                          txGraph.link = firstParamValue;
                                          db.collection('nms_dashboard_rx_graph').findOneAndUpdate(
                                            {
                                              $and: [
                                                {site_id: siteNumber},
                                                {dev_id: TxDevId}
                                              ]
                                            },
                                            txGraph,
                                            {
                                              returnOriginal: false,
                                              upsert: true
                                            },
                                            (err,result) => {
                                              if(err){
                                                console.log(`this site ${siteName} for devID ${TxDevId} is not inserted.`);
                                              }else {
                                                console.log(`this site ${siteName} for devID ${TxDevId} was inserted.`);
                                              }
                                          });
                                        } else {
                                          txGraph.signal_strength = firstParamValue;
                                          db.collection('nms_dashboard_rx_graph').findOneAndUpdate(
                                            {
                                              $and: [
                                                {site_id: siteNumber},
                                                {dev_id: TxDevId}
                                              ]
                                            },
                                            txGraph,
                                            {
                                              returnOriginal: false,
                                              upsert: true
                                            },
                                            (err,result) => {
                                              if(err){
                                                console.log(`this site ${siteName} for devID ${TxDevId} is not inserted.`);
                                              }else {
                                                console.log(`this site ${siteName} for devID ${TxDevId} was inserted.`);
                                              }
                                          });
                                        }

                                      } else {
                                        let timeNow   = new Date(Date.now()).toLocaleString();
                                        // let timeNowMs = new Date(Date.now()).getTime();
                                        txGraph.last_update = timeNow;

                                        if ( firstParamInit === "HB" ) {
                                          txGraph.link = firstParamValue;
                                          db.collection('nms_dashboard_rx_graph').findOneAndUpdate(
                                            {
                                              $and: [
                                                {site_id: siteNumber}, 
                                                {dev_id: TxDevId}
                                              ]
                                            },
                                            txGraph,
                                            {
                                              returnOriginal: false,
                                              upsert: true
                                            },
                                            (err,result) => {
                                              if(err){
                                                console.log(`this site ${siteName} for devID ${TxDevId} is not inserted.`);
                                              }else {
                                                console.log(`this site ${siteName} for devID ${TxDevId} was inserted.`);
                                              }
                                          });
                                        } else {
                                          txGraph.signal_strength = firstParamValue;
                                          db.collection('nms_dashboard_rx_graph').findOneAndUpdate(
                                            {
                                              $and: [
                                                {site_id: siteNumber},
                                                {dev_id: TxDevId}
                                              ]
                                            },
                                            txGraph,
                                            {
                                              returnOriginal: false,
                                              upsert: true
                                            },
                                            (err,result) => {
                                              if(err){
                                                console.log(`this site ${siteName} for devID ${TxDevId} is not inserted.`);
                                              }else {
                                                console.log(`this site ${siteName} for devID ${TxDevId} was inserted.`);
                                              }
                                          });
                                        }

                                      }

                                    } else {
                                      console.log(`this TX device ${TxDevId} was not found in site device sensor, register it first!`);
                                    }

                                  }
                              });

                          });

                        }
                        //Loop for each TX device find its values: Finish.

                      } else {
                        console.log(`No TX on the ${siteName} site.`)
                      } 
                    }
                });   
                
              }
              //Loop for each site to find TX device: Finish.

            }

          });
          //GET all sites: Finish.

        }

      });
      //GET TX _id: Finish.

    });

  });

}

// ==============================================================================//

// //GET TX main protocol: Start
// db.collection('nms_m_protocol').find(
//   { 
//     protocol: { 
//       $in: ["AA", "AB", "AC", "AD" ] 
//     } 
//   }
//   )
//   .toArray((err, protocol) => {
//     if (err) {
//       console.log(`not connected to protocol`);
//     } else {

//       //Loop for each TX main protocol to find its value: Start
//       for (let m = 0; m < protocol.length; m++) {
//         let eachProtocol = protocol[m];
//         let idProtocol = eachProtocol._id;

//       }
//       //Loop for each TX main protocol to find its value: Finish.

//     }
// });
// //GET TX main protocol: Finish.