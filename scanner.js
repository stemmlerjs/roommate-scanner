var network = require('network');
var nmap = require('libnmap');
var myInterface = {};
var jsonfile = require('jsonfile')

var file = './network2.json'
var file1 = './network.json'

function toBase2(block) {
    return Number(block).toString(2);
}

var scanner = {
    interface: {},
    subnetRange: null,
    cidr: 0,

    init: function(next) {
        this.setInterface(function() {
            this.setCIDR(function() {
                this.setSubnetAddr(next);
            }.bind(this))
        }.bind(this));
    },

    setInterface: function(next) {
        network.get_active_interface(function(err, obj) {
            this.interface = obj;
            next();
        }.bind(this));
    },
    setSubnetAddr: function(next) {
        var mask = this.interface.netmask.split('.').map(toBase2).join();
        // console.log('mask', mask)
        var addr = this.interface.ip_address.split('.').map(toBase2).join();
        // console.log('addr', addr);

        next();
    },
    setCIDR: function(next) {
        var mask = this.interface.netmask;
        var arr = mask.split('.');
        arr = arr.map(toBase2);
        this.cidr = arr.join().split('1').length - 1;
        next();
    },

    scanOptions: {
        range: [
            '192.168.2.1-132',
            '192.168.2.134-254'
        ]
    }
}

function MainProgram(callback) {
    // Start scan
    nmap.scan(scanner.scanOptions, function(err, json) {
        if (err) throw new Error(err);

        // Start a list of discovered devices
        var hosts = [];

        // Add all found hosts
        for(searchRange in json) {
            var host = json[searchRange].host;
            
            if (host){
                console.log("found some hosts")
                hosts.push(host);
            }
        }

        // Filter unnecessary data from returned host data
        var hosts = hosts[0].map(function(host) {
            var obj = {};
            obj.status = host.status[0].item.state;
            obj.reason = host.status[0].item.reason;
            obj.ipAddress = host.address[0].item.addr
            obj.macAddress = host.address[1].item.addr;
            obj.vendor = host.address[1].item.vendor;
            return obj;
        });
        
        callback(hosts)
    });
}



module.exports.scan = function(callback) {
    scanner.init(function() {
        MainProgram(callback);
    })
}


// nmap.discover(scanner.scanOptions, function(err, report) {

//   if (err) throw new Error(err);

//   for (var item in report) {

//     console.log(JSON.stringify(report[item]));

//   }

// });
//scanner.init(MainProgram);