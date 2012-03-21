var QUnit    = require('../../modules/qunit/qunit/qunit.js'),
    qunitTap = require('../../node_modules/qunit-tap').qunitTap,
    util     = require('util'),
    fs       = require('fs');

QUnit.like = function(actual, expected, message) {
    QUnit.push(expected.test(actual), actual, expected.toString(), message);
};

qunitTap(QUnit, util.puts, {noPlan: true});

QUnit.init();
QUnit.config.updateRate = 0;

var Youtube2Mp4 = require('../../youtube-2-mp4.js').Youtube2Mp4;
with ({
    ok         : QUnit.ok,
    is         : QUnit.equal,
    like       : QUnit.like,
    is_deeply  : QUnit.deepEqual,
    dies_ok    : QUnit.raises,
    subtest    : QUnit.test,
    start      : QUnit.start,
    asyncTest  : QUnit.asyncTest,
}) {
    var content = fs.readFileSync('t/001_basic.js', 'utf-8');
    eval(content);
}

QUnit.start();
