var expect = require('chai').expect;
var Cea608Parser = require('../lib/cea608-parser').Cea608Parser;

describe('Cea608Parser', function () {
    
    describe('#parseALine', function() {
        var oneLineData = [0x94,0x20, 0x94,0x20, 0x94,0x2c, 0x91,0x40,
                        0x46,0xe9, 0xf2,0x73, 0xf4,0x80, 0x91,0xb9, 0xec,0xe9,
                        0x6e,0xe5, 0x94,0x2f];
        var FIRST_ROW = '[Row 1: "First line                      "]';
        var screenSwapData = [0x94,0xae, 0x94,0x2f]; // ENM, EOC
        var START_TIME = 0.5;
        var END_TIME = 2.0;
        
        it("should use updateData callback", function() {
            var counter = 0;
            var out1 = {updateData : function(t, screen) {
                counter++;
                var output = screen.getDisplayText(true /*asOneRow*/);
                if (counter === 1) {
                    expect(t).equals(START_TIME);
                    expect(output).equals("");
                } else if (counter === 2) {
                    expect(t).equals(START_TIME);
                    expect(output).equals(FIRST_ROW);
                }
            }};
            
            var parser = new Cea608Parser(1, out1, null);
            parser.addData(START_TIME, oneLineData);
            parser.addData(END_TIME, screenSwapData);
        });
        
        it("should use newCue callback", function() {
            var counter = 0;
            var out1 = {newCue : function(startTime, endTime, screen) {
                counter++;
                var output = screen.getDisplayText(true /*asOneRow*/);
                if (counter === 1) {
                    expect(startTime).equals(START_TIME);
                    expect(endTime).equals(END_TIME);
                    expect(output).equals(FIRST_ROW);
                }
            }};
            
            var parser = new Cea608Parser(1, out1, null);
            parser.addData(START_TIME, oneLineData);
            parser.addData(END_TIME, screenSwapData);
        });

        it("should handle segmentBoundary and create extra cue", function() {
            var counter = 0;
            var splitTime = 1.5;
            var out1 = {newCue : function(startTime, endTime, screen) {
                counter++;
                var output = screen.getDisplayText(true/*asOneRow*/);
                if (counter === 1) {
                    expect(startTime).equals(START_TIME);
                    expect(endTime).equals(splitTime);
                    expect(output).equals(FIRST_ROW);
                } else if (counter === 2) {
                    expect(startTime).equals(splitTime);
                    expect(endTime).equals(END_TIME);
                    expect(output).equals(FIRST_ROW);
                }
            }};
            
            var parser = new Cea608Parser(1, out1, null);
            parser.addData(START_TIME, oneLineData);
            parser.cueSplitAtTime(splitTime);
            parser.addData(END_TIME, screenSwapData);
        });
    });
});
