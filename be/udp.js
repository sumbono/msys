// ==============================================================================//
// INPUT MODULE //
// ==============================================================================//
var udp         = require('dgram');
var parseData   = require('./udp/parsers/dataParser');
var insertData  = require('./udp/db_config/insertData');
var insertDoor  = require('./udp/db_config/insertDoor');

// ==============================================================================//

// ==============================================================================//
// UDP //
// ==============================================================================//
// define a port
const UDPport = process.env.PORT || 5001;

// creating a udp server
var server = udp.createSocket('udp4');
server.bind(UDPport);

// emits on new datagram data
server.on('message',function(data, info) {
  
  let m = data.toString('utf8').replace(/[\n\r]*$/, '');

  console.log('========================================');
  console.log('Received %d bytes data from %s:%d',data.length, info.address, info.port);
  let timestamp = new Date(Date.now()).toLocaleString();
  console.log('At: ', timestamp);
  console.log('========================================');

  let dataReceive = parseData.parseData(m);
  insertData.insertData(dataReceive);
  insertDoor.insertDoor(dataReceive);

});

// emits when any error occurs
server.on('error',function(error){
  console.log('Error: ' + error);
  server.close();
});

//emits when socket is ready and listening for datagram msgs
server.on('listening',function(){
  var address = server.address();
  var port = address.port;
  var family = address.family;
  var ipaddr = address.address;
  console.log(`Server is listening at ${family} => ${ipaddr}: ${port}`);
});

//emits after the socket is closed using socket.close();
server.on('close',function(){
  console.log('Socket is closed !');
});
// ==============================================================================//
