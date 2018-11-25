//SOCKET-IO
var MongoClient = require('mongodb').MongoClient;
var db_url  = 'mongodb://localhost:27017/nms_db';
var db_url2 = 'mongodb://localhost:3001/meteor';

exports = module.exports = function(io) {  

  // Set socket.io listeners.
  io.on('connection', (socket) => {

    socket.emit("Start_Chat");
    
    socket.on("sitelog_lastone_request", function() {
      
        MongoClient.connect(db_url, function(err, db){
            if (err) {
                MongoClient.connect(db_url2, function(err, db){
                    db.collection('nms_sitelog').find().sort({_id:-1}).limit(1).toArray(function(err, devices) {
                        if(err){
                        console.log("not connected to meteor database");
                        }else {
                        console.log('send last inserted data from meteor database.');
                        console.log( devices[0].dev_id );
                        io.sockets.emit("sitelog_lastone", devices);
                        }
                    });
                });
            } else {
                db.collection('nms_sitelog').find().sort({_id:-1}).limit(1).toArray(function(err, devices) {
                    if(err){
                        console.log("not connected to database");
                    }else {
                        console.log('send last inserted data from database.');
                        console.log( devices[0].dev_id );
                        // io.sockets.emit( "sitelog_lastone", JSON.stringify( devices ) );
                        // io.sockets.emit( "sitelog_lastone", devices[0]._id );
                        io.sockets.emit( "sitelog_lastone", devices );
                    }
                });            
            }
        });

    });

  });

}
