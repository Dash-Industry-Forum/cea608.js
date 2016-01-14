/*jshint expr: true*/
var expect = require('chai').expect;
var fs = require('fs');
var PassThrough = require('stream').PassThrough;
var SccParser = require('../lib/scc-parser').SccParser;
var Cea608Parser = require('../lib/cea608-parser').Cea608Parser;
var findCea608Nalus = require('../lib/cea608-parser').findCea608Nalus;
var extractCea608DataFromRange = require('../lib/cea608-parser').extractCea608DataFromRange;
var WebVTTWriter = require('../lib/cea608-towebvtt').WebVTTWriter;
var cmpstreams = require('./cmpstreams');
var logger = require('../lib/cea608-parser').logger;
logger.verboseLevel = -1; //Even supress Error since some test sequences generate them

var channel = 1;
var field = 1;


function checkNaluData(naluPath) {

}


describe('NaluParser', function () {
    describe('#getCea608FromNalu', function() {
        it("should open a file with NALU data and extrac the NALU bytes", function() {
            var naluPath = __dirname + '/data/field1.nalu';
            var buffer = fs.readFileSync(naluPath);
            var ab = new ArrayBuffer(buffer.length);
            var raw = new DataView(ab);
            for (var i = 0 ; i < buffer.length ; i++) {
                raw.setUint8(i, buffer[i]);
            }
    
            var cea608Ranges = findCea608Nalus(raw, 0, buffer.length);
            expect(cea608Ranges.length).equal(1);
            var ccData = extractCea608DataFromRange(raw, cea608Ranges[0]);
            expect(ccData.length).equal(2);
            expect(ccData[0].length).equal(28); //Data from field1 channel (CC1+CC2)
            expect(ccData[1].length).equal(0);  //Data from field2 channel (CC3+CC4)
        });
    });
});