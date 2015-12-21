/*jshint expr: true*/
var expect = require('chai').expect;
var PassThrough = require('stream').PassThrough;
var fs = require('fs');
var WebVTTWriter = require('../lib/cea608-towebvtt').WebVTTWriter;
var Cea608Parser = require('../lib/cea608-parser').Cea608Parser;
var cmpstreams = require('./cmpstreams');
var assert = require('assert');


describe('WebVTTWriter', function () {
    describe("#parseAndWrite", function() { 
        it("should write a file with a simple line", function(done) {
            var refStream = fs.createReadStream(__dirname + '/data/vtt/oneline.vtt', 'utf8');
            var outStream = new PassThrough();
            var out1 = new WebVTTWriter(outStream, 1, true);
            var out2 = null;
            
            new cmpstreams(refStream, outStream, function(err, result) {
                if (!err) 
                {
                    expect(result).true;
                    if (!result) console.log("Failure: Not WebVTT not equal"); //assert does not fire here
                }
                done(err);
            });
            
            var oneLineData = [0x94,0x20, 0x94,0x20, 0x94,0x2c, 0x91,0x40,
                        0x46,0xe9, 0xf2,0x73, 0xf4,0x80, 0x91,0xb9, 0xec,0xe9,
                        0x6e,0xe5, 0x94,0x2f];
            
            var parser = new Cea608Parser(1, out1, out2);
            parser.addData(1.5, oneLineData);
            var swap = [0x94,0xae, 0x94,0x2f]; // ENM, EOC
            parser.addData(2, swap);
            out1.close();
        });
    });
});