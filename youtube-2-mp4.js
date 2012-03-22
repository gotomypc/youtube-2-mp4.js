(function () {
"use strict";

var HttpClient = require('./http-client').HttpClient;
var ParseUri   = require('./modules/parseUri/parseuri'); // XXX module.export 決め打ちだけどTiで動くのか

var Youtube2Mp4 = function () {};
var BASE_URL = 'http://www.youtube.com/watch?v=';
//var DEFAULT_FMT = 18; // XXX
var DEFAULT_FMT = 19; // XXX

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
    getMp4: function (videoId, args) { // deferred
        if (!videoId)
            throw "Usage:\n"
                + "\tvar yt = new Youtube2Mp4();\n"
                + "\tvar mp4_link = yt.getMp4([video_id|video_url]);";
        if (!args) args = {};
        var self = this;
        return this.prepareDownload(videoId).next(function (data) {
            var fmt = args.fmt || data.fmt || DEFAULT_FMT;
            var videoUrl = data.videoUrlMap[fmt].url;
            if (!videoUrl) throw 'this video has not supported fmt: ' + fmt;
            if (!args.filename) args.filename = args.file_name;
            var filename = self._formatFilename(args.filename, {
                videoId    : data.videoId,
                fmt        : fmt,
                suffix     : data.videoUrlMap[fmt].suffix || this._suffix(fmt),
                resolution : data.videoUrlMap[fmt].resolution || 0,
            });
            return {filename: filename, videoUrl: videoUrl};
        });
    },
    _formatFilename: function (filename, data) {
        if (typeof filename === 'undefined')
            return data.videoId + '.' + data.suffix;
        filename = filename.replace(/{([^}]+)}/g, function (str, $1) {
            return data.$1 || '{' + $1 + '}';
        });
        return filename;
    },
    prepareDownload: function (videoId) { // deferred
        videoId = this._videoId(videoId);
        var self = this;
        return this._getContent(videoId).next(function (content) {
            var videoUrlMap = self._fetchVideoUrlMap(content);
            var fmtList = [];
            var sorted = videoUrlMap.values().map(function (value) {
                var resolution = value.resolution;
                return [
                    value,
                    resolution.replace(/(\d+)x(\d+)/, function (str, $1, $2) { return $1 * $2 }),
                ];
            }).sort(function (a, b) {
                return b[1] - a[1]
            }).map(function (fmt) {
                fmtList.push(fmt[0].fmt);
                return fmt[0];
            });
            var hqData = sorted[0];
            return {
                videoId     : videoId,
                videoUrl    : hqData.url,
                videoUrlMap : videoUrlMap,
                fmt         : hqData.fmt,
                fmtList     : fmtList,
                suffix      : hqData.suffix,
            };
        });
    },
    _videoId: function (videoId) {
        var m;
        if (m = (videoId.match(/\/.*?[?&;!]v=([^&#?=/;]+)/)||[])[1]) return m;
        return videoId;
    },
    _getContent: function (videoId) { // deferred
        var url = BASE_URL + videoId;
        return (new HttpClient).get(url).next(function (res) {
            if (res.status != 200)
                throw 'GET ' + url + ' failed. status: ' + res.status;
            return res.body;
        });
    },
    _fetchVideoUrlMap: function (content) {
        var args = this._getArgs(content);
        if (!(args.fmt_list && args.url_encoded_fmt_stream_map))
            throw 'failed to find video urls.';
        var fmtMap    = this._parseFmtMap(args.fmt_list);
        var fmtUrlMap = this._parseStreamMap(args.url_encoded_fmt_stream_map);
        var videoUrlMap = {};
        var self = this;
        fmtMap.keys().map(function (key) {
            videoUrlMap[key] = {
                fmt        : key,
                resolution : fmtMap[key],
                url        : fmtUrlMap[key],
                suffix     : self._suffix(key),
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
    _parseFmtMap : function (param) {
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
            var parsed = ParseUri('http://dum.my/?' + stuff);
            var query = parsed.queryKey;
            fmtUrlMap[query.itag] = decodeURIComponent(query.url);
        });
        return fmtUrlMap;
    },
    _getArgs: function (content) {
        var data;
        var lines = content.split(/\n/).filter(function (line) { return !!line });
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var m;
            if (m = (line.match(/^\s*yt\.playerConfig\s*=\s*({.*})/)||[])[1]) {
                data = JSON.parse(m);
                break;
            }
        }
        if (!(data && data.args)) throw 'failed to extract JSON data.';
        return data.args;
    },
};

}).call(this);
