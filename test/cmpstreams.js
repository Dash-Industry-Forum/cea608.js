"use strict";

/**
 * Compare two streams as finished and send back an asynchronous result event.
 */
var streamCmp = function(stream1, stream2, callback) {
    var data1 = "";
    var data2 = "";
    var finished1 = false;
    var finished2 = false;
    
    var run = function() {
        stream1.on('data', function(data) {
            //console.log("data1");
            data1 += data;
        });
        stream2.on('data', function(data) {
            //console.log("data2 " + data.length);
            data2 += data;
        });
        stream1.on('end', function() {
            //console.log("end1");
            finished1 = true;
            checkDone();
        });
        stream2.on('end', function() {
            //console.log("end2");
            finished2 = true;
            checkDone();
        });
    };
    
    var checkDone = function() {
        if (finished1 && finished2) {
            var equal = data1 === data2;
            callback(null, equal);
        }
    };
    
    run();
};

module.exports = streamCmp;
