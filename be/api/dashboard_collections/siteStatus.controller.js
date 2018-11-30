// ============================================================================== //
// PART INPUT MODULE //
// ============================================================================== //
var MongoClient = require('mongodb').MongoClient;
var db_url      = 'mongodb://localhost:27017/nms_db';
var cron        = require('node-cron');
// ============================================================================== //

/* <==================================$$$$$$$===============================> */
exports.getsiteStatus = function () {

    //     cron.schedule('* */1 * * * *', function(){
          cron.schedule('*/4 * * * *', function(){
            MongoClient.connect(db_url, function(err, db) {
              
              //Find all site
              db.collection('nms_site').find({}).toArray((err, site) => {
                if (err) {
                  console.log(`not connected to site collection.`);
                } else {
                  let minutes = 1000*60;
                  let t = Date.now();
                  let msNow = Math.round(t / minutes);
                  let alarmDate = new Date(+msNow).toLocaleString();

                  if ( site.length > 0 ) {
                    for (let i = 0; i < site.length; i++) {
                      let elSite = site[i];
                      let d = Date.parse(elSite.last_updated);
                      // console.log(`Site ms: `, d);

                      let ms = d/minutes;
                      let idSite = elSite.site_id;

                      if ( (msNow - ms) > 5 ) {
                        
                      db.collection('nms_site').findOneAndUpdate(
                        { site_id: idSite },
                        { $set: { status: "red", last_updated: alarmDate } }, 
                        (err, hasil) => {
                          if(err){
                            console.log(`status red on site ${ elSite.name } not inserted.`);
                          }else {
                            console.log(`status red on site ${ elSite.name } inserted.`);
                          }
                      });
                      } else {
                        console.log(`this ${elSite.name} site status is updated.`);
                      }

                    }
                  } else {
                    console.log(`site collection doesn't have data.`);
                  }
                }
              });

            });
    
        });
    
    }
    /* <==================================$$$$$$$===============================> */