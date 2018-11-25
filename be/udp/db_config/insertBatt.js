const MongoClient = require('mongodb').MongoClient;
const db_url = 'mongodb://localhost:27017/nms_db';
// const db_url2 = 'mongodb://localhost:3001/meteor'; 
// untuk akses ke meteor mongo, meteor harus dijalankan lebih dahulu, 
// baru tcpServer.js bisa mengakses DB dan App tidak crash.

module.exports.insertBatt = function (data){
	MongoClient.connect(db_url, function(err, db){
        if (err) {
            
//             MongoClient.connect(db_url2, function(err, db){
//                 db.collection('nms_battery_sitelog').save(data , (err,result) => {
//                     if(err){
//                       console.log(`data ${ data.dev_id } not inserted at ${ data.createdOn }.`);
//                     }else {
//                       console.log(`data ${ data.dev_id } inserted at ${ data.createdOn }.`);
//                     }
//                 });
//             });
              
              console.log(`data ${ data.dev_id } not inserted at ${ data.createdOn }.`);

        } else {
            
            db.collection('nms_battery_sitelog').save(data , (err,result) => {
                if(err){
                  console.log(`data ${ data.dev_id } not inserted at ${ data.createdOn }.`);
                }else {
                  console.log(`data ${ data.dev_id } inserted at ${ data.createdOn }.`);
                }
            });

        }
        
	});
}