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
    cron.schedule('*/3 * * * *', function(){

        MongoClient.connect(db_url, (err, db) => {

            db.collection('nms_alarm_device').distinct( 'dev_id', {Status: { $in: ["CRITICAL_OFFLINE" ] } }, (err, offdev) => {
                if (err) {
                    console.log(`not connected to db`);
                } else {
                    //if offline device exist: START
                    if ( offdev.length > 0 ) {

                        db.collection('nms_site_device').distinct('dev_id', (err, device_id) => {
                            if (err) {
                                console.log(`not connected to site device`);
                            } else {

                                if (device_id.length > 0) {

                                    if ( offdev.length === device_id.length ) {
                                        db.collection('nms_site_device').updateMany(
                                            {},
                                            {
                                                $set: { status: "OFFLINE" }
                                            },
                                        (err, result) => {
                                            if(err){
                                                console.log(`site device status not updated.`);
                                            }else {
                                                console.log(`site device status updated to OFFLINE, for all devID.`);
                                            }
                                        });

                                    } else if ( offdev.length < device_id.length ) {

                                        //compare 2 arrays, get same devID, take result as offline device
                                        let offlineDev = offdev.slice().filter(function(val) {
                                            return device_id.indexOf(val) != -1;
                                        });

                                        //compare 2 arrays, get different devID, take result as online device
                                        let onlineDev = diff2arr(device_id, offdev);

                                        //Insert offline status_device: START
                                        db.collection('nms_site_device').updateMany(
                                            {dev_id: { $in: offlineDev } },
                                            {
                                                $set: { status: "OFFLINE" }
                                            },
                                        (err, result) => {
                                            if(err){
                                                console.log(`site device status not updated.`);
                                            }else {
                                                console.log(`site device status updated to OFFLINE, for devID: ( ${offlineDev} ).`);
                                            }
                                        }); 
                                        //Insert offline status_device: FINISH.

                                        //Find list devID with CRITICAL status: START
                                        db.collection('nms_alarm_device').distinct(
                                            'dev_id', 
                                            {  
                                                $and: [
                                                    {dev_id: {$in: onlineDev}}, 
                                                    {Status: { $in: ["CRITICAL_MIN", "CRITICAL_MAX"] } },
                                                ]
                                            },(err, cridev) => {
                                                if (err) {
                                                    console.log(`not connected to db`);
                                                } else {

                                                    if ( cridev.length > 0 ) {

                                                        if ( cridev.length === onlineDev.length ) {
                                                            
                                                            //Insert critical status_device: START
                                                            db.collection('nms_site_device').updateMany(
                                                                {dev_id: { $in: cridev } },
                                                                {
                                                                    $set: { status: "CRITICAL" }
                                                                },
                                                            (err, result) => {
                                                                if(err){
                                                                    console.log(`site device status not updated.`);
                                                                }else {
                                                                    console.log(`site device status updated to CRITICAL, for devID: ( ${cridev} ).`);
                                                                }
                                                            });
                                                            //Insert critical status_device: FINISH.

                                                        } else if ( cridev.length < onlineDev.length ) {

                                                            //compare 2 arrays, get same devID, take result as offline device
                                                            let criticDev = onlineDev.slice().filter(function(val) {
                                                                return cridev.indexOf(val) != -1;
                                                            });

                                                            //compare 2 arrays, get different devID, take result as online device
                                                            let uncriticDev = diff2arr(cridev, onlineDev);
                                                            
                                                            //Insert critical status_device: START
                                                            db.collection('nms_site_device').updateMany(
                                                                {dev_id: { $in: criticDev } },
                                                                {
                                                                    $set: { status: "CRITICAL" }
                                                                },
                                                            (err, result) => {
                                                                if(err){
                                                                    console.log(`site device status not updated.`);
                                                                }else {
                                                                    console.log(`site device status updated to CRITICAL, for devID: ( ${cridev} ).`);
                                                                }
                                                            });
                                                            //Insert critical status_device: FINISH.

                                                            //Find uncritical-device: START
                                                            db.collection('nms_alarm_device').distinct(
                                                                'dev_id', 
                                                                {  
                                                                    $and: [
                                                                        {dev_id: {$in: uncriticDev}}, 
                                                                        {Status: { $in: ["MAJOR_MIN", "MAJOR_MAX"] } },
                                                                    ]
                                                                },(err, majordev) => {
                                                                    if (err) {
                                                                        console.log(`not connected to db`);
                                                                    } else {
                                                                        if ( majordev.length > 0 ) {
                                                                            //All uncriticDev or part of it is MAJOR.

                                                                            if ( majordev.length === uncriticDev.length ) {
                                                                                
                                                                                //Insert major status_device: START
                                                                                db.collection('nms_site_device').updateMany(
                                                                                    {dev_id: { $in: majordev } },
                                                                                    {
                                                                                        $set: { status: "MAJOR" }
                                                                                    },
                                                                                (err, result) => {
                                                                                    if(err){
                                                                                        console.log(`site device status not updated.`);
                                                                                    }else {
                                                                                        console.log(`site device status updated to MAJOR, for devID: ( ${majordev} ).`);
                                                                                    }
                                                                                });
                                                                                //Insert major status_device: FINISH.

                                                                            } else if ( majordev.length < uncriticDev.length ) {
                                                                                
                                                                                //compare 2 arrays, get same devID, take result as major device
                                                                                let majorDevice = uncriticDev.slice().filter(function(val) {
                                                                                    return majordev.indexOf(val) != -1;
                                                                                });

                                                                                //compare 2 arrays, get different devID, take result as online device
                                                                                let unmajorDevice = diff2arr(majordev, uncriticDev);
                                                                                
                                                                                //Insert critical status_device: START
                                                                                db.collection('nms_site_device').updateMany(
                                                                                    {dev_id: { $in: majorDevice } },
                                                                                    {
                                                                                        $set: { status: "MAJOR" }
                                                                                    },
                                                                                (err, result) => {
                                                                                    if(err){
                                                                                        console.log(`site device status not updated.`);
                                                                                    }else {
                                                                                        console.log(`site device status updated to MAJOR, for devID: ( ${majorDevice} ).`);
                                                                                    }
                                                                                });
                                                                                //Insert critical status_device: FINISH.

                                                                                //Find NA status_device: START
                                                                                db.collection('nms_alarm_device').distinct(
                                                                                    'dev_id', 
                                                                                    {  
                                                                                        $and: [
                                                                                            {dev_id: {$in: unmajorDevice}}, 
                                                                                            {Status: { $in: ["NOT_AVAILABLE"] } },
                                                                                        ]
                                                                                    },(err, nadev) => {
                                                                                        if (err) {
                                                                                            console.log(`not connected to db`);
                                                                                        } else {
                                                                                            if ( nadev.length > 0 ) {
                                                                                                
                                                                                                if ( nadev.length === unmajorDevice.length ) {

                                                                                                    //Insert not available status_device: START
                                                                                                    db.collection('nms_site_device').updateMany(
                                                                                                        {dev_id: { $in: nadev } },
                                                                                                        {
                                                                                                            $set: { status: "NOT_AVAILABLE" }
                                                                                                        },
                                                                                                    (err, result) => {
                                                                                                        if(err){
                                                                                                            console.log(`site device status not updated.`);
                                                                                                        }else {
                                                                                                            console.log(`site device status updated to NOT_AVAILABLE, for devID: ( ${nadev} ).`);
                                                                                                        }
                                                                                                    });
                                                                                                    //Insert normal status_device: FINISH.

                                                                                                } else if ( nadev.length < unmajorDevice.length ) {
                                                                                                    
                                                                                                    //compare 2 arrays, get same devID, take result as major device
                                                                                                    let naDevice = unmajorDevice.slice().filter(function(val) {
                                                                                                        return nadev.indexOf(val) != -1;
                                                                                                    });

                                                                                                    //compare 2 arrays, get different devID, take result as online device
                                                                                                    let normalDevice = diff2arr(nadev, unmajorDevice);

                                                                                                    //Insert not available status_device: START
                                                                                                    db.collection('nms_site_device').updateMany(
                                                                                                        {dev_id: { $in: naDevice } },
                                                                                                        {
                                                                                                            $set: { status: "NOT_AVAILABLE" }
                                                                                                        },
                                                                                                    (err, result) => {
                                                                                                        if(err){
                                                                                                            console.log(`site device status not updated.`);
                                                                                                        }else {
                                                                                                            console.log(`site device status updated to NOT_AVAILABLE, for devID: ( ${naDevice} ).`);
                                                                                                        }
                                                                                                    });
                                                                                                    //Insert normal status_device: FINISH.

                                                                                                    //Insert normal status_device: START
                                                                                                    db.collection('nms_site_device').updateMany(
                                                                                                        {dev_id: { $in: normalDevice } },
                                                                                                        {
                                                                                                            $set: { status: "NORMAL" }
                                                                                                        },
                                                                                                    (err, result) => {
                                                                                                        if(err){
                                                                                                            console.log(`site device status not updated.`);
                                                                                                        }else {
                                                                                                            console.log(`site device status updated to NORMAL, for devID: ( ${normalDevice} ).`);
                                                                                                        }
                                                                                                    });
                                                                                                    //Insert normal status_device: FINISH.


                                                                                                } else {
                                                                                                    console.log(`undefined`);
                                                                                                }

                                                                                            } else {
                                                                                                //Insert normal status_device: START
                                                                                                db.collection('nms_site_device').updateMany(
                                                                                                    {dev_id: { $in: unmajorDevice } },
                                                                                                    {
                                                                                                        $set: { status: "NORMAL" }
                                                                                                    },
                                                                                                (err, result) => {
                                                                                                    if(err){
                                                                                                        console.log(`site device status not updated.`);
                                                                                                    }else {
                                                                                                        console.log(`site device status updated to NORMAL, for devID: ( ${unmajorDevice} ).`);
                                                                                                    }
                                                                                                });
                                                                                                //Insert normal status_device: FINISH.
                                                                                            }
                                                                                        }
                                                                                });
                                                                                //Find NA status_device: FINISH.

                                                                            } else {
                                                                                console.log(`undefined`);    
                                                                            }

                                                                        } else {
                                                                            //uncriticDev is all NORMAL.
                                                                            //Insert normal status_device: START
                                                                            db.collection('nms_site_device').updateMany(
                                                                                {dev_id: { $in: uncriticDev } },
                                                                                {
                                                                                    $set: { status: "NORMAL" }
                                                                                },
                                                                            (err, result) => {
                                                                                if(err){
                                                                                    console.log(`site device status not updated.`);
                                                                                }else {
                                                                                    console.log(`site device status updated to NORMAL, for devID: ( ${uncriticDev} ).`);
                                                                                }
                                                                            });
                                                                            //Insert normal status_device: FINISH.
                                                                        }
                                                                    }
                                                            });
                                                            //Find uncritical-device: FINISH.

                                                        } else {
                                                            console.log(`not identified.`);
                                                        }
                                                    
                                                    //if no CRITICAL parameters found: START
                                                    } else {
                                                        
                                                        // //Find list devID with MAJOR status: START
                                                        db.collection('nms_alarm_device').distinct(
                                                            'dev_id', 
                                                            {  
                                                                $and: [
                                                                    {dev_id: {$in: onlineDev}}, 
                                                                    {Status: { $in: ["MAJOR_MIN", "MAJOR_MAX"] } },
                                                                ]
                                                            },(err, majdevice) => {
                                                                if (err) {
                                                                    console.log(`not connected to db.`);
                                                                } else {
                                                                    if ( majdevice.length > 0 ) {
                                                                        if ( onlineDev.length === majdevice.length ) {
                                                                            //Insert major status_device: START
                                                                            db.collection('nms_site_device').updateMany(
                                                                                {dev_id: { $in: majdevice } },
                                                                                {
                                                                                    $set: { status: "MAJOR" }
                                                                                },
                                                                            (err, result) => {
                                                                                if(err){
                                                                                    console.log(`site device status not updated.`);
                                                                                }else {
                                                                                    console.log(`site device status updated to MAJOR, for devID: ( ${majdevice} ).`);
                                                                                }
                                                                            });
                                                                            //Insert major status_device: FINISH.
                                                                        } else if (onlineDev.length > majdevice.length) {
                                                                            
                                                                            //compare 2 arrays, get same devID, take result as major device
                                                                            let majorDevices = onlineDev.slice().filter(function(val) {
                                                                                return majdevice.indexOf(val) != -1;
                                                                            });

                                                                            //compare 2 arrays, get different devID, take result as online device
                                                                            let unmajorDevices = diff2arr(majdevice, onlineDev);
                                                                            
                                                                            //Insert critical status_device: START
                                                                            db.collection('nms_site_device').updateMany(
                                                                                {dev_id: { $in: majorDevices } },
                                                                                {
                                                                                    $set: { status: "MAJOR" }
                                                                                },
                                                                            (err, result) => {
                                                                                if(err){
                                                                                    console.log(`site device status not updated.`);
                                                                                }else {
                                                                                    console.log(`site device status updated to MAJOR, for devID: ( ${majorDevices} ).`);
                                                                                }
                                                                            });
                                                                            //Insert critical status_device: FINISH.

                                                                            //Find NA status_device: START
                                                                            db.collection('nms_alarm_device').distinct(
                                                                                'dev_id', 
                                                                                {  
                                                                                    $and: [
                                                                                        {dev_id: {$in: unmajorDevices}}, 
                                                                                        {Status: { $in: ["NOT_AVAILABLE"] } },
                                                                                    ]
                                                                                },(err, nadevices) => {
                                                                                    if (err) {
                                                                                        console.log(`not connected to db`);
                                                                                    } else {
                                                                                        if ( nadevices.length > 0 ) {
                                                                                            
                                                                                            if ( nadevices.length === unmajorDevices.length ) {

                                                                                                //Insert not available status_device: START
                                                                                                db.collection('nms_site_device').updateMany(
                                                                                                    {dev_id: { $in: nadevices } },
                                                                                                    {
                                                                                                        $set: { status: "NOT_AVAILABLE" }
                                                                                                    },
                                                                                                (err, result) => {
                                                                                                    if(err){
                                                                                                        console.log(`site device status not updated.`);
                                                                                                    }else {
                                                                                                        console.log(`site device status updated to NOT_AVAILABLE, for devID: ( ${nadevices} ).`);
                                                                                                    }
                                                                                                });
                                                                                                //Insert normal status_device: FINISH.

                                                                                            } else if ( nadevices.length < unmajorDevices.length ) {
                                                                                                
                                                                                                //compare 2 arrays, get same devID, take result as major device
                                                                                                let notaDevice = unmajorDevices.slice().filter(function(val) {
                                                                                                    return nadevices.indexOf(val) != -1;
                                                                                                });

                                                                                                //compare 2 arrays, get different devID, take result as online device
                                                                                                let normalDevices = diff2arr(nadevices, unmajorDevices);

                                                                                                //Insert not available status_device: START
                                                                                                db.collection('nms_site_device').updateMany(
                                                                                                    {dev_id: { $in: notaDevice } },
                                                                                                    {
                                                                                                        $set: { status: "NOT_AVAILABLE" }
                                                                                                    },
                                                                                                (err, result) => {
                                                                                                    if(err){
                                                                                                        console.log(`site device status not updated.`);
                                                                                                    }else {
                                                                                                        console.log(`site device status updated to NOT_AVAILABLE, for devID: ( ${notaDevice} ).`);
                                                                                                    }
                                                                                                });
                                                                                                //Insert normal status_device: FINISH.

                                                                                                //Insert normal status_device: START
                                                                                                db.collection('nms_site_device').updateMany(
                                                                                                    {dev_id: { $in: normalDevices } },
                                                                                                    {
                                                                                                        $set: { status: "NORMAL" }
                                                                                                    },
                                                                                                (err, result) => {
                                                                                                    if(err){
                                                                                                        console.log(`site device status not updated.`);
                                                                                                    }else {
                                                                                                        console.log(`site device status updated to NORMAL, for devID: ( ${normalDevices} ).`);
                                                                                                    }
                                                                                                });
                                                                                                //Insert normal status_device: FINISH.


                                                                                            } else {
                                                                                                console.log(`undefined`);
                                                                                            }

                                                                                        } else {
                                                                                            //Insert normal status_device: START
                                                                                            db.collection('nms_site_device').updateMany(
                                                                                                {dev_id: { $in: unmajorDevices } },
                                                                                                {
                                                                                                    $set: { status: "NORMAL" }
                                                                                                },
                                                                                            (err, result) => {
                                                                                                if(err){
                                                                                                    console.log(`site device status not updated.`);
                                                                                                }else {
                                                                                                    console.log(`site device status updated to NORMAL, for devID: ( ${unmajorDevices} ).`);
                                                                                                }
                                                                                            });
                                                                                            //Insert normal status_device: FINISH.
                                                                                        }
                                                                                    }
                                                                            });
                                                                            //Find NA status_device: FINISH.
    
                                                                        } else {
                                                                            console.log(`not identified.`);
                                                                        }
                                                                        
                                                                    } else {
                                                                        console.log(`no document found with MAJOR status on alarm device.`);
                                                                    }
                                                                }
                                                        });
    
                                                    }
                                                    //if no CRITICAL parameters found: FINISH.    
                                                }

                                        });
                                        //Find list devID with CRITICAL status: FINISH.

                                    } else {
                                        console.log(`cannot compare..`);
                                    }
                                } else {
                                    console.log(`no document found on site device collection.`);
                                }
                            }
                        });
                    //if offline device exist: FINISH.
//=======================================================================================================================================================//
                    //if offline device not exist: START
                    //All devices is ONLINE.
                    } else {
                        db.collection('nms_alarm_device').distinct( 'dev_id', {Status: { $in: ["CRITICAL_MIN", "CRITICAL_MAX" ] } }, (err, device) => {
                            if(err){
                                console.log("not connected to database");
                            }else {
                                if ( device.length > 0 ) {
                                    db.collection('nms_site_device').distinct('dev_id', (err, devid) => {
                                        if (err) {
                                            console.log(`not connected to db`);
                                        } else {
                                            if (devid.length > 0) {
                                                if ( device.length === devid.length ) {
                                                    db.collection('nms_site_device').updateMany(
                                                        {},
                                                        {
                                                            $set: { status: "CRITICAL" }
                                                        },
                                                    (err, result) => {
                                                        if(err){
                                                            console.log(`site device status not updated.`);
                                                        }else {
                                                            console.log(`site device status updated to CRITICAL, for all devID.`);
                                                        }
                                                    });
                                                } else if ( device.length < devid.length ) {
            
                                                    //compare 2 arrays, get same devID, take result as critical device
                                                    let criticalDev = device.slice().filter(function(val) {
                                                        return devid.indexOf(val) != -1;
                                                    });
            
                                                    //compare 2 arrays, get different devID, take result as uncritical device
                                                    let uncriticalDev = diff2arr(devid, device);
            
                                                    //Insert critical status_device: START
                                                    db.collection('nms_site_device').updateMany(
                                                        {dev_id: { $in: criticalDev } },
                                                        {
                                                            $set: { status: "CRITICAL" }
                                                        },
                                                    (err, result) => {
                                                        if(err){
                                                            console.log(`site device status not updated.`);
                                                        }else {
                                                            console.log(`site device status updated to CRITICAL, for devID: ( ${criticalDev} ).`);
                                                        }
                                                    }); 
                                                    //Insert critical status_device: FINISH.
            
                                                    //Find list devID with MAJOR status: START
                                                    db.collection('nms_alarm_device').distinct(
                                                        'dev_id', 
                                                        {  
                                                            $and: [
                                                                {dev_id: {$in: uncriticalDev}}, 
                                                                {Status: { $in: ["MAJOR_MIN", "MAJOR_MAX"] } },
                                                            ]
                                                        },(err, majdevice) => {
                                                            if (err) {
                                                                console.log(`not connected to db.`);
                                                            } else {
                                                                if ( majdevice.length > 0 ) {
                                                                    if ( uncriticalDev.length === majdevice.length ) {
                                                                        //Insert major status_device: START
                                                                        db.collection('nms_site_device').updateMany(
                                                                            {dev_id: { $in: majdevice } },
                                                                            {
                                                                                $set: { status: "MAJOR" }
                                                                            },
                                                                        (err, result) => {
                                                                            if(err){
                                                                                console.log(`site device status not updated.`);
                                                                            }else {
                                                                                console.log(`site device status updated to MAJOR, for devID: ( ${majdevice} ).`);
                                                                            }
                                                                        });
                                                                        //Insert major status_device: FINISH.
                                                                    } else if (uncriticalDev.length > majdevice.length) {

                                                                        //compare 2 arrays, get same devID, take result as major device
                                                                        let majorDevices = uncriticalDev.slice().filter(function(val) {
                                                                            return majdevice.indexOf(val) != -1;
                                                                        });

                                                                        //compare 2 arrays, get different devID, take result as online device
                                                                        let unmajorDevices = diff2arr(majdevice, uncriticalDev);
                                                                        
                                                                        //Insert critical status_device: START
                                                                        db.collection('nms_site_device').updateMany(
                                                                            {dev_id: { $in: majorDevices } },
                                                                            {
                                                                                $set: { status: "MAJOR" }
                                                                            },
                                                                        (err, result) => {
                                                                            if(err){
                                                                                console.log(`site device status not updated.`);
                                                                            }else {
                                                                                console.log(`site device status updated to MAJOR, for devID: ( ${majorDevices} ).`);
                                                                            }
                                                                        });
                                                                        //Insert critical status_device: FINISH.

                                                                        //Find NA status_device: START
                                                                        db.collection('nms_alarm_device').distinct(
                                                                            'dev_id', 
                                                                            {  
                                                                                $and: [
                                                                                    {dev_id: {$in: unmajorDevices}}, 
                                                                                    {Status: { $in: ["NOT_AVAILABLE"] } },
                                                                                ]
                                                                            },(err, nadevices) => {
                                                                                if (err) {
                                                                                    console.log(`not connected to db`);
                                                                                } else {
                                                                                    if ( nadevices.length > 0 ) {
                                                                                        
                                                                                        if ( nadevices.length === unmajorDevices.length ) {

                                                                                            //Insert not available status_device: START
                                                                                            db.collection('nms_site_device').updateMany(
                                                                                                {dev_id: { $in: nadevices } },
                                                                                                {
                                                                                                    $set: { status: "NOT_AVAILABLE" }
                                                                                                },
                                                                                            (err, result) => {
                                                                                                if(err){
                                                                                                    console.log(`site device status not updated.`);
                                                                                                }else {
                                                                                                    console.log(`site device status updated to NOT_AVAILABLE, for devID: ( ${nadevices} ).`);
                                                                                                }
                                                                                            });
                                                                                            //Insert normal status_device: FINISH.

                                                                                        } else if ( nadevices.length < unmajorDevices.length ) {
                                                                                            
                                                                                            //compare 2 arrays, get same devID, take result as major device
                                                                                            let notaDevice = unmajorDevices.slice().filter(function(val) {
                                                                                                return nadevices.indexOf(val) != -1;
                                                                                            });

                                                                                            //compare 2 arrays, get different devID, take result as online device
                                                                                            let normalDevices = diff2arr(nadevices, unmajorDevices);

                                                                                            //Insert not available status_device: START
                                                                                            db.collection('nms_site_device').updateMany(
                                                                                                {dev_id: { $in: notaDevice } },
                                                                                                {
                                                                                                    $set: { status: "NOT_AVAILABLE" }
                                                                                                },
                                                                                            (err, result) => {
                                                                                                if(err){
                                                                                                    console.log(`site device status not updated.`);
                                                                                                }else {
                                                                                                    console.log(`site device status updated to NOT_AVAILABLE, for devID: ( ${notaDevice} ).`);
                                                                                                }
                                                                                            });
                                                                                            //Insert normal status_device: FINISH.

                                                                                            //Insert normal status_device: START
                                                                                            db.collection('nms_site_device').updateMany(
                                                                                                {dev_id: { $in: normalDevices } },
                                                                                                {
                                                                                                    $set: { status: "NORMAL" }
                                                                                                },
                                                                                            (err, result) => {
                                                                                                if(err){
                                                                                                    console.log(`site device status not updated.`);
                                                                                                }else {
                                                                                                    console.log(`site device status updated to NORMAL, for devID: ( ${normalDevices} ).`);
                                                                                                }
                                                                                            });
                                                                                            //Insert normal status_device: FINISH.


                                                                                        } else {
                                                                                            console.log(`undefined`);
                                                                                        }

                                                                                    } else {
                                                                                        //Insert normal status_device: START
                                                                                        db.collection('nms_site_device').updateMany(
                                                                                            {dev_id: { $in: unmajorDevices } },
                                                                                            {
                                                                                                $set: { status: "NORMAL" }
                                                                                            },
                                                                                        (err, result) => {
                                                                                            if(err){
                                                                                                console.log(`site device status not updated.`);
                                                                                            }else {
                                                                                                console.log(`site device status updated to NORMAL, for devID: ( ${unmajorDevices} ).`);
                                                                                            }
                                                                                        });
                                                                                        //Insert normal status_device: FINISH.
                                                                                    }
                                                                                }
                                                                        });
                                                                        //Find NA status_device: FINISH.
            
                                                                    } else {
                                                                        console.log(`not identified.`);
                                                                    }
                                                                    
                                                                } else {
                                                                    console.log(`no document found with MAJOR status on alarm device.`);
                                                                }
                                                            }
                                                    });
            
                                                } else {
                                                    console.log(`cannot compare..`);
                                                }
                                            } else {
                                                console.log(`no document found on site device collection.`);
                                            }
                                        }
                                    });
                                
                                //if no one CRITICAL devices
                                } else {
                                    db.collection('nms_alarm_device').distinct('dev_id', {Status: { $in: ["MAJOR_MIN", "MAJOR_MAX"] } }, (err, majdev) => {
                                        if (err) {
                                            console.log(`not connected to db`);
                                        } else {
                                            if ( majdev.length > 0 ) {
                                                
                                                db.collection('nms_site_device').distinct('dev_id', (err, devidall) => {
                                                    if (err) {
                                                        console.log(`not connected to db`);
                                                    } else {
                                                        if (devid.length > 0) {
                                                            if ( majdev.length === devidall.length ) {
                                                                db.collection('nms_site_device').updateMany(
                                                                    {},
                                                                    {
                                                                        $set: { status: "MAJOR" }
                                                                    },
                                                                (err, result) => {
                                                                    if(err){
                                                                        console.log(`site device status not updated.`);
                                                                    }else {
                                                                        console.log(`site device status updated to MAJOR, for all devID.`);
                                                                    }
                                                                });
                                                            } else if ( majdev.length < devidall.length ) {

                                                                //compare 2 arrays, get same devID, take result as major device
                                                                let majorDevices = devidall.slice().filter(function(val) {
                                                                    return majdev.indexOf(val) != -1;
                                                                });

                                                                //compare 2 arrays, get different devID, take result as online device
                                                                let unmajorDevices = diff2arr(majdev, devidall);
                                                                
                                                                //Insert critical status_device: START
                                                                db.collection('nms_site_device').updateMany(
                                                                    {dev_id: { $in: majorDevices } },
                                                                    {
                                                                        $set: { status: "MAJOR" }
                                                                    },
                                                                (err, result) => {
                                                                    if(err){
                                                                        console.log(`site device status not updated.`);
                                                                    }else {
                                                                        console.log(`site device status updated to MAJOR, for devID: ( ${majorDevices} ).`);
                                                                    }
                                                                });
                                                                //Insert critical status_device: FINISH.

                                                                //Find NA status_device: START
                                                                db.collection('nms_alarm_device').distinct(
                                                                    'dev_id', 
                                                                    {  
                                                                        $and: [
                                                                            {dev_id: {$in: unmajorDevices}}, 
                                                                            {Status: { $in: ["NOT_AVAILABLE"] } },
                                                                        ]
                                                                    },(err, nadevices) => {
                                                                        if (err) {
                                                                            console.log(`not connected to db`);
                                                                        } else {
                                                                            if ( nadevices.length > 0 ) {
                                                                                
                                                                                if ( nadevices.length === unmajorDevices.length ) {

                                                                                    //Insert not available status_device: START
                                                                                    db.collection('nms_site_device').updateMany(
                                                                                        {dev_id: { $in: nadevices } },
                                                                                        {
                                                                                            $set: { status: "NOT_AVAILABLE" }
                                                                                        },
                                                                                    (err, result) => {
                                                                                        if(err){
                                                                                            console.log(`site device status not updated.`);
                                                                                        }else {
                                                                                            console.log(`site device status updated to NOT_AVAILABLE, for devID: ( ${nadevices} ).`);
                                                                                        }
                                                                                    });
                                                                                    //Insert normal status_device: FINISH.

                                                                                } else if ( nadevices.length < unmajorDevices.length ) {
                                                                                    
                                                                                    //compare 2 arrays, get same devID, take result as major device
                                                                                    let notaDevice = unmajorDevices.slice().filter(function(val) {
                                                                                        return nadevices.indexOf(val) != -1;
                                                                                    });

                                                                                    //compare 2 arrays, get different devID, take result as online device
                                                                                    let normalDevices = diff2arr(nadevices, unmajorDevices);

                                                                                    //Insert not available status_device: START
                                                                                    db.collection('nms_site_device').updateMany(
                                                                                        {dev_id: { $in: notaDevice } },
                                                                                        {
                                                                                            $set: { status: "NOT_AVAILABLE" }
                                                                                        },
                                                                                    (err, result) => {
                                                                                        if(err){
                                                                                            console.log(`site device status not updated.`);
                                                                                        }else {
                                                                                            console.log(`site device status updated to NOT_AVAILABLE, for devID: ( ${notaDevice} ).`);
                                                                                        }
                                                                                    });
                                                                                    //Insert normal status_device: FINISH.

                                                                                    //Insert normal status_device: START
                                                                                    db.collection('nms_site_device').updateMany(
                                                                                        {dev_id: { $in: normalDevices } },
                                                                                        {
                                                                                            $set: { status: "NORMAL" }
                                                                                        },
                                                                                    (err, result) => {
                                                                                        if(err){
                                                                                            console.log(`site device status not updated.`);
                                                                                        }else {
                                                                                            console.log(`site device status updated to NORMAL, for devID: ( ${normalDevices} ).`);
                                                                                        }
                                                                                    });
                                                                                    //Insert normal status_device: FINISH.


                                                                                } else {
                                                                                    console.log(`undefined`);
                                                                                }

                                                                            } else {
                                                                                //Insert normal status_device: START
                                                                                db.collection('nms_site_device').updateMany(
                                                                                    {dev_id: { $in: unmajorDevices } },
                                                                                    {
                                                                                        $set: { status: "NORMAL" }
                                                                                    },
                                                                                (err, result) => {
                                                                                    if(err){
                                                                                        console.log(`site device status not updated.`);
                                                                                    }else {
                                                                                        console.log(`site device status updated to NORMAL, for devID: ( ${unmajorDevices} ).`);
                                                                                    }
                                                                                });
                                                                                //Insert normal status_device: FINISH.
                                                                            }
                                                                        }
                                                                });
                                                                //Find NA status_device: FINISH.
                        
                                                            } else {
                                                                console.log(`cannot compare..`);
                                                            }
                                                        } else {
                                                            console.log(`no document found on site device collection.`);
                                                        }
                                                    }
                                                });
            
            
                                            } else {
                                                //if no one MAJOR devices
                                                //Insert normal status_device: START
                                                db.collection('nms_site_device').updateMany(
                                                    {},
                                                    {
                                                        $set: { status: "NORMAL" }
                                                    },
                                                (err, result) => {
                                                    if(err){
                                                        console.log(`site device status not updated.`);
                                                    }else {
                                                        console.log(`site device status updated to NORMAL, for all devID.`);
                                                    }
                                                });
                                                //Insert normal status_device: FINISH.
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                    //if offline device not exist: FINISH.
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