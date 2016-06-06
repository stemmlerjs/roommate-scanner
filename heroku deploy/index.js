
// SERVER
// ==== Require necessary packages ===== //
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var colors = require('colors');

var clients = {};

// ==== Notification Server Listens at Port 4376 ==== //
server.listen(process.env.PORT);
console.log("**********************************************");
console.log("***********   SERVER STARTED   ***************");
console.log("Listening for socket connections on PORT: 3000");
console.log("**********************************************");
console.log("")

 /* ==================================================================
  * =============== AUTHENTICATION (IDENTIFICATION) ==================
  * ==================================================================
  */

io.use(function(socket, next) {
  if(socket.handshake.query.auth == "kstemmler98993thebirthdayparty88") {
    socket.clientType = "Home Socket";
    return next();
  }

  if(socket.handshake.query.auth == "kstemmler98993thebirthdayparty889") {
    socket.clientType = "Remote Socket";
    return next();
  }

  console.warn('Unsuccessful Authentication occurred');
  next(new Error('Authentication Error'));
});

 /* ==================================================================
  * ==================== CONNECTION EVENTS ===========================
  * ==================================================================
  */

io.on('connection', function (socket) {
  	console.log("CONNECTION: ".green + (socket.clientType).yellow + " just connected", new Date());
    clients[socket.clientType] = socket;

    // Notify Remote Socket if Home Socket becomes available again
    var remoteSocket = getRemoteSocketConnection();
    if(socket.clientType === 'Home Socket') {
      if(remoteSocket){
        io.emit('home reconnected', { 
          message: 'Home Socket reconnected.',
          timestamp: new Date()
        });
      }
    } else {
      if(remoteSocket) {
        var homeSocket = getHomeSocketConnection();
        if(homeSocket) {
          io.emit('home is available', {
            message: 'Home Socket is available.',
            timestamp: new Date()
          })
        }
      }
    }


   /* ================================================================
    * ================ DISCONNECTION EVENT ===========================
    * ================================================================
    */

  	socket.on('disconnect', function(data){
  		console.log("DISCONNECTION: ".red + (socket.clientType).yellow  + " just disconnected", new Date());

      // Remote Socket from Client List
      delete clients[socket.clientType];

      // Notify Remote Socket if Home Socket gets disconnected
      if(socket.clientType === 'Home Socket') {
        var remoteSocket = getRemoteSocketConnection();
        if(remoteSocket){
          io.emit('home disconnected', { 
            message: 'Home Socket disconnected.',
            timestamp: new Date()
          });
        }
      }
  	});


   /* ================================================================
    * ================ 'requestScan' EVENT  ===========================
    * ================================================================
    */

    socket.on('requestScan', function(data) {
      var homeSocket = getHomeSocketConnection();

      console.log("SCAN REQUESTED (Received Request from Remote):".yellow + " Relay request to Home Socket");

      // If home socket up, relay request to it
      if(homeSocket) {
        io.emit('requestScan', data);
      } 
    })

   /* ================================================================
    * ================ 'scanStarted' EVENT  ===========================
    * ================================================================
    */

    socket.on('scanStarted', function(data) {
      var remoteSocket = getRemoteSocketConnection();

      console.log("SCAN REQUESTED (Received Reply from Home):".yellow + " Scan has been started at " + data.timestamp);      

      // If home socket up, relay request to it
      if(remoteSocket) {
        io.emit('scanStarted', data);
      } 
    })


    /* ================================================================
    * ================ 'scanResults' EVENT  ===========================
    * ================================================================
    */

    socket.on('scanResults', function(data) {
      var remoteSocket = getRemoteSocketConnection();

      // If home socket up, relay request to it
      if(remoteSocket) {
        io.emit('scanResults', data);
      } 
    })

});

 /*
  * getHomeSocketConnection()
  * @return the home socket connection if any
  */

  function getHomeSocketConnection() {
    if(clients['Home Socket']) return clients['Home Socket'];
    return false;
  }

 /*
  * getRemoteSocketConnection()
  * @return the remote socket connection if any
  */

  function getRemoteSocketConnection() {
    if(clients['Remote Socket']) return clients['Remote Socket'];
    return false;
  }


