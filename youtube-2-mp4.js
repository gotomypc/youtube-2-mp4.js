(function () {
"use strict";

var HttpClient = require('./http-client.js').HttpClient;
var ParseUri   = require('./modules/parseUri/parseuri.js');

var Youtube2Mp4 = function () {};
var BASE_URL = 'http://www.youtube.com/watch?v=';

Object.prototype.values = function() {var o=this;var r=[];for(var k in o) if(o.hasOwnProperty(k)){r.push(o[k])}return r};
Object.prototype.keys   = function() {var o=this;var r=[];for(var k in o) if(o.hasOwnProperty(k)){r.push(  k )}return r};
Object.prototype.each   = function(c){var o=this;var r=[];var i=0;for(var k in o) if(o.hasOwnProperty(k)){r.push(c.apply(o,[k,o[k],i++]))}return r}; 

var global = this;
if (typeof exports == 'undefined') {
    exports.Youtube2Mp4 = Youtube2Mp4;
} else {
    global.Youtube2Mp4 = Youtube2Mp4;
}

Youtube2Mp4.prototype = {
    getMp4: function (videoId, args) { // d
        if (!videoId)
            throw "Usage:\n"
                + "\tvar yt = new Youtube2Mp4();\n"
                + "\tvar mp4_link = yt.getMp4([video_id|video_url]);";
        args = {};
        var data = this.prepareDownload(videoId);
        return data; // XXX
    },
    prepareDownload: function (videoId) { // d
        videoId = this._videoId(videoId);
        var self = this;
        this._getContent(videoId).next(function (content) {
            var videoUrlMap = self._fetchVideoUrlMap(content);
            var fmtList = [];
            var sorted = videoUrlMap.values().map(function (value) {
                var resolution = value.resolution;
                return [
                    value,
                    resolution.replace(/(\d+)x(\d+)/, function (str, p1, p2) { return p1 * p2 }),
                ]
            }).sort(function (a, b) { return b[1] - a[1] }).map(function () {
            });
            
        });
    },
    _videoId: function (videoId) {
        var m;
        if (m = (videoId.match(/\/.*?[?&;!]v=([^&#?=/;]+)/)||[])[1]) return m;
        return videoId;
    },
    _getContent: function (videoId) { // d
        var url = BASE_URL + videoId;
        return (new HttpClient).get(url).next(function (res) {
            if (res.status != 200)
                throw 'GET ' + url + ' failed. status: ' + res.status;
            return res.body;
        });
    },
    _fetchVideoUrlMap: function (content) {
        var args = _getArgs(content);
        if (!(args.fmt_list && args.url_encoded_fmt_stream_map))
            throw 'failed to find video urls.';
        var fmtMap    = this._parseFmtMap(args.fmt_list);
        var fmtUrlMap = this._parseStreamMap(args.url_encoded_fmt_stream_map);
        var videoUrlMap = {};
        fmtMap.each(function (key) {
            this[fmt] = {
                fmt        : key,
                resolution : fmtMap[key],
                url        : fmtUrlMap[key],
                suffix     : this._suffix(key),
            };
        });
        return videoUrlMap;
    },
    _suffix : function (fmt) {
        return /43|44|45/.test(fmt)    ? 'webm'
             : /18|22|37|38/.test(fmt) ? 'mp4'
             : /13|17/.test(fmt)       ? '3gp'
             :                           'flv';
    },
    _parseFmtMmap : function (param) {
        var fmtMap = {};
        param.split(',').forEach(function (stuff) {
            var tmp = stuff.split('/');
            var fmt        = tmp[0];
            var resolution = tmp[1];
            fmtMap[fmt] = resolution;
        });
        return fmtMap;
    },
    _parseStreamMap : function (param) {
        var fmtUrlMap = {};
        param.split(',').forEach(function (stuff) {
            var query = ParseUri.parseUri(stuff).queryKey;
            fmtUrlMap[query.itag] = query.url;
        });
        return fmtUrlMap;
    },
    _getArgs: function (content) {
        var data;
        var lines = content.split(/\n/).filter(function (line) { !!line });
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var m;
            if (m = (videoId.match(/^\s*yt\.playerConfig\s*=\s*({.*})/)||[])[1]) {
                data = JSON.parse(m);
                break;
            }
        }
        if (! data.args) throw 'failed to extract JSON data.'
        return data.args;
    },
};

}).call(this);
