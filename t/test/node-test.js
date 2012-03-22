(function () {
"use strict";

var QUnit    = require('../../modules/qunit/qunit/qunit'),
    qunitTap = require('../../node_modules/qunit-tap').qunitTap,
    util     = require('util');

QUnit.like = function(actual, expected, message) {
    QUnit.push(expected.test(actual), actual, expected.toString(), message);
};

qunitTap(QUnit, util.puts, {noPlan: true});

QUnit.init();
QUnit.config.updateRate = 0;

var exportMethods = {
    ok          : QUnit.ok,
    test        : QUnit.test,
    is          : QUnit.equal,
    like        : QUnit.like,
    is_deeply   : QUnit.deepEqual,
    dies_ok     : QUnit.raises,
    subtest     : QUnit.test,
    start       : QUnit.start,
    asyncTest   : QUnit.asyncTest,
    done_testing: QUnit.start,
};

var define = function (caller) {
    if (!caller) caller = Function('return this;')();
    for (var name in exportMethods) if (exportMethods.hasOwnProperty(name)) {
        caller[name] = exportMethods[name];
    }
}

var global = this;
if (typeof exports == 'undefined') {
    exports.define = define;
} else {
    global.define = define;
}

}).call(this);
