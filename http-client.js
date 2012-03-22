(function () {
"use strict";

var Deferred = require('./modules/jsdeferred/jsdeferred').Deferred;
var d = new Deferred();

var HttpClient = function () {};

var global = this;
if (typeof exports == 'undefined') {
    exports.HttpClient = HttpClient;
} else {
    global.HttpClient = HttpClient;
}

HttpClient.prototype = {
    get: function (url, callback) {
        var req;
        if (typeof Ti == 'undefined') {
            var request = require('request');
            request(url, function (error, res, body) {
                if (error) throw error.syscall + ' ' + error.code;
                d.call({status: res.statusCode, body: body});
            });
        } else {
            req = Ti.Network.createHTTPClient();
            req.onload = function() {
                d.call({status: this.status, body: this.responseText});
            };
            // TODO timeout
            req.open('GET', url);
            req.send();
        }
        
        return d;
    },
};

}).call(this);
