// LICENSE : MIT
"use strict";
const assert = require('assert');
const documentation = require("../lib/documentation-wrapper");
const fs = require('fs');
const path = require('path');
const markdown = require("../lib/markdown/markdown");
function trim(str) {
    return str.replace(/^\s+|\s+$/, '');
}

describe('finds JSDoc', function () {
    const fixturesDir = path.join(__dirname, 'fixtures');
    fs.readdirSync(fixturesDir).map(function (caseName) {
        it("should " + caseName.split('-').join(' '), function (done) {
            var fixtureDir = path.join(fixturesDir, caseName);
            var actualPath = path.join(fixtureDir, 'actual.js');
            documentation([actualPath], {}, function (error, results) {
                if (error) {
                    return done(error);
                }
                markdown(results, {}, function (error, actual) {
                    if (error) {
                        return done(error);
                    }
                    if (path.sep === '\\') {
                        // Specific case of windows, transformFileSync return code with '/'
                        actualPath = actualPath.replace(/\\/g, '/');
                    }
                    var expected = fs.readFileSync(
                        path.join(fixtureDir, 'expected.md')
                    ).toString().replace(/%FIXTURE_PATH%/g, actualPath);
                    assert.equal(trim(actual), trim(expected));
                    done();
                });
            });
        });
    });
});