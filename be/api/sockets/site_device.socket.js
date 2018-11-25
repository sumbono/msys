//SOCKET-IO
var MongoClient = require('mongodb').MongoClient;
var db_url  = 'mongodb://localhost:27017/nms_db';
var db_url2 = 'mongodb://localhost:3001/meteor';

exports = module.exports = function(io) {  

  // Set socket.io listeners.
  io.on('connection', (socket) => {

    // socket.emit("Start_Chat");
    
    socket.on("site_device_request", function() {
      
        MongoClient.connect(db_url, function(err, db){
            if (err) {
                MongoClient.connect(db_url2, function(err, db){
                    db.collection('nms_site_device').find().toArray(function(err, site_device) {
                        if(err){
                        console.log("not connected to meteor database");
                        }else {
                        console.log('send site_device data from meteor database.');
                        console.log( site_device[0].unit );
                        io.sockets.emit("site_device_response", site_device);
                        }
                    });
                });
            } else {
                db.collection('nms_site_device').find().toArray(function(err, site_device) {
                    if(err){
                        console.log("not connected to database");
                    }else {
                        console.log('send site_device data from database.');
                        console.log( site_device[0].unit );
                        io.sockets.emit( "site_device_response", site_device);
                    }
                });
            }
        });

    });

  });

}