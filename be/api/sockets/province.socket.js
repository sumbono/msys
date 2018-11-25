//SOCKET-IO

var MongoClient = require('mongodb').MongoClient;
var db_url  = 'mongodb://localhost:27017/nms_db';
var db_url2 = 'mongodb://localhost:3001/meteor';

exports = module.exports = function(io) {  

  // Set socket.io listeners.
  io.on('connection', (socket) => {

    // socket.emit("Start_Chat");
    
    socket.on("province_request", function() {

        MongoClient.connect(db_url, function(err, db){
            if (err) {
                MongoClient.connect(db_url2, function(err, db){
                    db.collection('nms_m_province').find({}).toArray(function(err, province) {
                        if(err){
                        console.log("not connected to meteor database");
                        }else {
                        console.log('send province data from meteor database.');
                        console.log( province[0].name );
                        io.sockets.emit("province_response", province);
                        }
                    });
                });
            } else {
                db.collection('nms_m_province').find().toArray(function(err, province) {
                    if(err){
                        console.log("not connected to database");
                    }else {
                        console.log('send province data from database.');
                        console.log( province[0].name );
                        io.sockets.emit("province_response", province);
                    }
                });
            }
        });


    });

  });

}