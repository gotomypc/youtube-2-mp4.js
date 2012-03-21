function async (cb) { setTimeout(cb, 0) }

var Server = require('http').createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello, World!');
    res.end();
});
var Port = '8124';

asyncTest('http get', function() {
    var HttpClient = require('../../http-client.js').HttpClient;
    var ua = new HttpClient;

    Server.listen(Port);
    ua.get('http://localhost:' + Port).next(function(res){
        start();
        like(res.body, /Hello, World!/i);
        Server.close();
    });
});
var yt = new Youtube2Mp4;
subtest('get mp4', function(){
    yt.getMp4('http://www.youtube.com/watch?v=U8z2W3UWr4w').next(function (s) {
        console.log(s);
    });
    dies_ok(function () { yt.getMp4() });

    is(yt._videoId('ATg8CdRD68E'), 'ATg8CdRD68E');
    is(yt._videoId('http://www.youtube.com/watch?v=ATg8CdRD68E'), 'ATg8CdRD68E');

});
