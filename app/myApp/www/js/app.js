// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('roommate-scaner', ['ionic', 'socketService'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('MainController', MainController)

  function MainController($scope, $interval, socket) {
    $scope.home = {};
    $scope.server = {};
    $scope.results = null;
    $scope.scanDisabled = false;
    $scope.scanningAnimation = "Scanning";
    var scanAnimationInterval = null;

    function initScanningAnimation() {
      scanAnimationInterval = $interval(function() { 
        if($scope.scanningAnimation === "Scanning...") {
          $scope.scanningAnimation = "Scanning";
        } else {
           $scope.scanningAnimation += "."
        }       
      }, 1000)
    }

    $scope.initScan = function() {
      socket.requestScan(null);
      $scope.scanDisabled = true;
      initScanningAnimation();
    }

    socket.on('connect', function() {
      console.log('Connected to server at', socket.io.opts.hostname + ":" + socket.io.opts.port, new Date());

      $scope.$apply(function() {
        $scope.server.status = "Connected"
        $scope.home.status = null;
      });

      socket.on('home is available', function(data) {
        $scope.$apply(function() {
          $scope.home.status = "Connected"
        });
      })

      // Notify remote when HOME Socket is connected to Server
      socket.on('home reconnected', function(data) {
        console.log("Home Server has reconnected");
        $scope.$apply(function() {
          $scope.home.status = "Connected"
        });
      });

      // Notify remote when HOME Socket is disconnected from Server
      socket.on('home disconnected', function(data) {
        console.log("Home Server has disconnected");
        $scope.$apply(function() {
          $scope.home.status = "Disconnected"
        });
      });

      socket.on('scanStarted', function(data) {
        console.log("Scan has been started");
      });

      // Parse results from scan
      socket.on('scanResults', function(data) {
        $interval.cancel(scanAnimationInterval);
        $scope.results = data;
        $scope.scanDisabled = false;
        console.log("Scan results came in");
        console.log(data);
      });

      socket.on('disconnect', function(data) {
        console.log("Lost connection to server");
        $scope.$apply(function() {
          $scope.home.status = "Disconnected"
          $scope.server.status = "Disconnected"
        });
      })
    });


    

  }
