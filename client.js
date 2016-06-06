// HOME CLIENT CONNECTION
var scanner = require('./scanner.js');
var io = require('socket.io-client')
var client = io('http://roommate-scanner.herokuapp.com', { query: "auth=kstemmler98993thebirthdayparty88" });
var colors = require('colors');



client.on('connect', function() {
    console.log('Connected to server at', client.io.opts.hostname + ":" + client.io.opts.port, new Date());
});

client.on('disconnect', function() {
    console.log('Disconnected from server.', new Date());
});

client.on('requestScan', function(data) {
	var options = data.options;

	console.log("SCAN REQUESTED (Request): ".yellow + " sending initialization response.");

	client.emit('scanStarted', {
		timestamp: new Date()
	});

	scanner.scan(function(hosts){
		console.log("SCAN COMPLETE: ".yellow + " Sending results.");

		client.emit('scanResults', hosts);
	})
})



//scanner.init(MainProgram);
