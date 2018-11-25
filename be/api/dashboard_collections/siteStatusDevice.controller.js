// ============================================================================== //
// PART INPUT MODULE //
// ============================================================================== //
var MongoClient = require('mongodb').MongoClient;
var db_url      = 'mongodb://localhost:27017/nms_db';
var cron        = require('node-cron');
// ============================================================================== //

/* <==================================$$$$$$$===============================> */
exports.getsiteStatusDevice = function () {

    //     cron.schedule('* */1 * * * *', function(){
    cron.schedule('*/5 * * * * *', function(){

        MongoClient.connect(db_url, (err, db) => {

            db.collection('nms_alarm_device').distinct( 'Site', {Status: { $in: ["CRITICAL_MIN", "CRITICAL_MAX" ] } }, (err, site) => {
                if(err){
                    console.log("not connected to database");
                }else {
                    if ( site.length > 0 ) {
                        db.collection('nms_site').distinct('name', (err, sitename) => {
                            if (err) {
                                console.log(`not connected to db`);
                            } else {
                                if (sitename.length > 0) {
                                    if ( site.length === sitename.length ) {
                                        db.collection('nms_site').updateMany(
                                            {},
                                            {
                                                $set: { status_device: "red" }
                                            },
                                        (err, result) => {
                                            if(err){
                                                console.log(`site status device not updated.`);
                                            }else {
                                                console.log(`site status device updated to RED.`);
                                            }
                                        });
                                    } else if ( site.length < sitename.length ) {

                                        let criticalSite = sitename.slice().filter(function(val) {
                                            return site.indexOf(val) != -1;
                                        });

                                        let uncriticalSite = diff2arr(site, sitename);

                                        //Insert critical status_device
                                        db.collection('nms_site').updateMany(
                                            {name: { $in: criticalSite } },
                                            {
                                                $set: { status_device: "red" }
                                            },
                                        (err, result) => {
                                            if(err){
                                                console.log(`site status device not updated.`);
                                            }else {
                                                console.log(`site status device updated to RED.`);

                                                db.collection('nms_alarm_device').distinct(
                                                    'Site',
                                                    {Status: { $in: ["MAJOR_MIN", "MAJOR_MAX" ] } }, 
                                                    (err, sitedev) => {
                                                        if (err) {
                                                            console.log(`not connected to db`);
                                                        } else {
                                                            
                                                        }
                                                });

                                            }
                                        });


                                    } else {
                                        
                                    }
                                } else {
                                    
                                }
                            }
                        });
                    
                    //if no one CRITICAL devices
                    } else {
                        db.collection('nms_alarm_device').distinct('Site', {Status: { $in: ["MAJOR_MIN", "MAJOR_MAX" ] } }, (err, sitedev) => {
                            if (err) {
                                console.log(`not connected to db`);
                            } else {
                                if ( sitedev.length > 0 ) {
                                    
                                } else {
                                    
                                }
                            }
                        });
                    }
                }
            });

        });

    });
    
}
/* <==================================$$$$$$$===============================> */

function diff2arr (array1, array2) {
    var temp = [];
    array1 = array1.toString().split(',').map(Number);
    array2 = array2.toString().split(',').map(Number);
    
    for (var i in array1) {
    if(array2.indexOf(array1[i]) === -1) temp.push(array1[i]);
    }
    for(i in array2) {
    if(array1.indexOf(array2[i]) === -1) temp.push(array2[i]);
    }
    return temp.sort((a,b) => a-b);
}