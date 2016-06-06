angular.module('socketService', [])
  .factory('socket', SocketFactory);

  function SocketFactory() {

    var client = io('http://roommate-scanner.herokuapp.com', {
            query: "auth=kstemmler98993thebirthdayparty889" 
        });

    client.requestScan = function(options) {
      client.emit('requestScan', {
        options: options
      });
    }

    return client;

  }