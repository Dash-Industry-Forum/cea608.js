/*jshint expr: true*/
var expect = require('chai').expect;
var fs = require('fs');
var cmpstreams = require('./cmpstreams');
var PassThrough = require('stream').PassThrough;


describe('CompareStreams', function () {
    describe('#compareTwoFiles', function() {
        it("should compare 2 identical files", function(done) {
            var filePath1 = __dirname + '/data/vtt/header.vtt';
            var filePath2 = __dirname + '/data/vtt/header.vtt';

            var stream1 = fs.createReadStream(filePath1, 'utf8');
            var stream2 = fs.createReadStream(filePath2, 'utf8');           
            new cmpstreams(stream1, stream2, function(err, result) {
                if (!err) expect(result).true;
                done(err);
            });
        });
    });
    
    describe('#UsePassThroughStream', function() {
        it("should compare 2 identical files", function(done) {
            var filePath1 = __dirname + '/data/vtt/header.vtt';
            var filePath2 = __dirname + '/data/vtt/header.vtt';
            

            var stream1 = fs.createReadStream(filePath1, 'utf8');
            
            var data2 = fs.readFileSync(filePath2, 'utf8');
            
            var stream2 = new PassThrough();        
            new cmpstreams(stream1, stream2,  function(err, result) {
                if (!err) expect(result).true;
                done(err);
            });
            stream2.write(data2);
            stream2.end();
        });
    });
});
