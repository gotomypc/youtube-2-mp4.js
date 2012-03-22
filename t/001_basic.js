(function () {
"use strict";

var Helper = require('./test/node-test');
Helper.define();
var Youtube2Mp4 = require('../youtube-2-mp4').Youtube2Mp4;
var Server = require('http').createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello, World!');
    res.end();
});
var Port = '8124';

asyncTest('http get', function() {
    var HttpClient = require('../http-client').HttpClient;
    var ua = new HttpClient;

    Server.listen(Port);
    ua.get('http://localhost:' + Port).next(function(res){
        start();
        like(res.body, /Hello, World!/i);
        Server.close();
    });
});

var yt = new Youtube2Mp4;
asyncTest('get mp4', function(){
    dies_ok(function () { yt.getMp4() });
    is(yt._videoId('ATg8CdRD68E'), 'ATg8CdRD68E');
    is(yt._videoId('http://www.youtube.com/watch?v=ATg8CdRD68E'), 'ATg8CdRD68E');

    yt.getMp4('http://www.youtube.com/watch?v=U8z2W3UWr4w').next(function (result) {
        start();
        like(result.filename, /\.mp4$/);
        like(result.videoUrl, /^https?:\/\/.+$/);
    }).error(function(e){
        console.trace(e);
    });
});

done_testing();

}).call(this);
