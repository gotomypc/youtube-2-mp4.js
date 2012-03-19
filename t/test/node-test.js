var QUnit = require('./qunit').QUnit,
    qunitTap = require('./node-modules/qunit-tap').qunitTap,
    util = require('util'),
    fs = require('fs');

qunitTap(QUnit, util.puts, {noPlan: true});

QUnit.init();
QUnit.config.updateRate = 0;

var Youtube2Mp4 = require('../../youtube-2-mp4.js');
with ({
    ok         : QUnit.ok,
    is         : QUnit.equal,
    like       : function (re, str) { QUnit.ok(re.test(str)) },
    is_deeply  : QUnit.deepEqual,
    dies_ok    : QUnit.raises,
    subtest    : QUnit.test,
    Youtube2Mp4 : Youtube2Mp4,
}) {

    var content = fs.readFileSync('t/001_basic.js', 'utf-8');
    eval(content);
}

QUnit.start();
