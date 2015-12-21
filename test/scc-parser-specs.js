/*jshint expr: true*/
var expect = require('chai').expect;
var fs = require('fs');
var PassThrough = require('stream').PassThrough;
var SccParser = require('../lib/scc-parser').SccParser;
var Cea608Parser = require('../lib/cea608-parser').Cea608Parser;
var WebVTTWriter = require('../lib/cea608-towebvtt').WebVTTWriter;
var cmpstreams = require('./cmpstreams');
var logger = require('../lib/cea608-parser').logger;
logger.verboseLevel = -1; //Even supress Error since some test sequences generate them

var channel = 1;
var field = 1;

function makeVttOutputAndCompareWithRef(sccPath, refPath, done) {
    var refStream = fs.createReadStream(refPath, 'utf8');
    var outStream;
    var outputToFile = false;
    if (outputToFile) {
        var outPath = refPath.replace('vtt', 'out');
        outStream = fs.createWriteStream(outPath);
    } else {
        outStream = new PassThrough();
    }
    var out1 = new WebVTTWriter(outStream, field, true);
    var ceaParser = new Cea608Parser(field, out1, null);
    var parser = new SccParser(sccPath, ceaParser); 
    if (!outputToFile) {    
        cmpstreams(refStream, outStream,  function(err, result) {
            if (!err) {
                expect(result).true;
            }
            done(err);
        });
    } else {
        outStream.on('finish', function() {
            done();
        });
    }
    parser.parse();
    out1.close();
}

describe('SccParser', function () {
    describe('#parseHeader', function() {
        it("should parse an scc file and find the Header", function() {
            var filePath = __dirname + '/data/allchars.scc';
            var parser = new SccParser(filePath);
            parser.parse();
            expect(parser).to.have.a.property('hasHeader', true);
        });
    });
    describe('#parseFile', function() {
        it("should parse all lines in a scc file", function() {
            var filePath = __dirname + '/data/allchars.scc';
            var parser = new SccParser(filePath);
            parser.parse();
            expect(parser).to.have.a.property('nrLinesParsed', 22);
        });
    });
    describe('#parseTimeAndData', function() {
        it("should parse time and data from line", function() {
            var filePath = __dirname + '/data/allchars.scc';
            var processor = {data : [], addData : function(t, byteList) {
                this.data.push([t, byteList]);
                }
            };
            var parser = new SccParser(filePath, processor);
            parser.parse();
            expect(processor.data[0][0]).equal(0);
            expect(processor.data[8][0]).equal(21);
            expect(processor.data[0][1][0]).equal(148);
            expect(processor.data[0][1][1]).equal(32);
        });
    });
    describe('#fullParseToWebVTT', function() {

        it("should parse rollup.scc correctly", function(done) {
            var sccPath = __dirname + '/data/rollup.scc';
            var refPath = __dirname + '/data/vtt/rollup_ch1.vtt';
            makeVttOutputAndCompareWithRef(sccPath, refPath, done);
        });
                
        it("should parse allchars.scc correctly", function(done) {
            var sccPath = __dirname + '/data/allchars.scc';
            var refPath = __dirname + '/data/vtt/allchars_ch1.vtt';
            makeVttOutputAndCompareWithRef(sccPath, refPath, done);
        });
        
        it("should parse backgrounds.scc correctly", function(done) {
            var sccPath = __dirname + '/data/backgrounds.scc';
            var refPath = __dirname + '/data/vtt/backgrounds_ch1.vtt';
            makeVttOutputAndCompareWithRef(sccPath, refPath, done);
        });
        
        it("should parse midrow_flash.scc correctly", function(done) {
            var sccPath = __dirname + '/data/midrow_flash.scc';
            var refPath = __dirname + '/data/vtt/midrow_flash_ch1.vtt';
            makeVttOutputAndCompareWithRef(sccPath, refPath, done);
        });
        
        it("should parse offsets.scc correctly", function(done) {
            var sccPath = __dirname + '/data/offsets.scc';
            var refPath = __dirname + '/data/vtt/offsets_ch1.vtt';
            makeVttOutputAndCompareWithRef(sccPath, refPath, done);
        });
        
        it("should parse strange_stuff.scc correctly", function(done) {
            var sccPath = __dirname + '/data/strange_stuff.scc';
            var refPath = __dirname + '/data/vtt/strange_stuff_ch1.vtt';
            makeVttOutputAndCompareWithRef(sccPath, refPath, done);
        });
    });
});