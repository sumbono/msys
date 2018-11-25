// ============================================================================== //
// PART INPUT MODULE //
// ============================================================================== //
var MongoClient = require('mongodb').MongoClient;
var db_url      = 'mongodb://localhost:27017/nms_db';
var cron        = require('node-cron');
// ============================================================================== //

/* <==================================$$$$$$$===============================> */
exports.getSensorValue = function () {

    cron.schedule('*/2 * * * * *', function(){
//       cron.schedule('* */1 * * * *', function(){

        MongoClient.connect(db_url, (err, db) => {
          
            //Set persent value: start.
            db.collection('nms_site_device_sensor').find().snapshot().forEach( (elem) => {
                
                if (elem.sensor_view == "progress") {

                    // let dibagi = Math.abs( ((elem.valueNow - elem.value_min) / (elem.value_max - elem.value_min))*100 );
                    let dibagi = ((elem.valueNow - elem.value_min) / (elem.value_max - elem.value_min))*100;
                
                    let persentValue = Math.round( dibagi );
                    
                    db.collection('nms_site_device_sensor').update(
                        {_id: elem._id },
                        {
                            $set: { persent: dibagi }
                        },
                    (err, result) => {
                        if(err){
                            console.log(`sensor persent ${persentValue} not inserted to ${elem.dev_id}: ${elem.protocol}.`);
                        }else {
                            // console.log(`sensor persent ${persentValue} inserted to ${elem.dev_id}: ${elem.protocol}.`);
                        }
                    });

                } else {
                    // console.log(`this ${elem.dev_id} is not a progress bar view.`);
                }
            });
          //Set persent value: finish.
          
        });

    });

}
/* <==================================$$$$$$$===============================> */
