/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2015-2016, DASH Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  1. Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  2. Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
"use strict";

var PenState = require('./cea608-parser').PenState;
var CaptionScreen = require('./cea608-parser').CaptionScreen;

/**
 * Write of WebVTT to file
 * @constructor
 */
var WebVTTWriter = function(writeStream, channelNr, combineConsecutiveRows) {
    this.stream = writeStream;
    this.channelNr = channelNr | 1;
    this.combineConsecutiveRows = combineConsecutiveRows | true;
    this.initWritten = false;
};

WebVTTWriter.prototype = {
    
    /**
     * New cue data
     * @parameter {Number} startTime start of cue
     * @parameter {Number} endTime end of cue
     * @parameter {CaptionScreen} CEA608 32x15 screen of characters
     */
    newCue : function(startTime, endTime, screen) {
        if (!this.initWritten) {
            this.writeInit();
        }
        var sTime = this.formatTime(startTime);
        var eTime = this.formatTime(endTime);
        this.writeCue(sTime, eTime, screen);
    },
    
    writeToStream : function(str) {
        if (this.stream) {
            this.stream.write(str); 
        }
    },
    
    formatTime : function(t) {
        var seconds = Math.floor(t);
        var frac = t - seconds;
        var hours, minutes, millis;
        var twoDigits = function(nr) {
            var s = nr.toString();
            return (s.length === 1) ? "0" + s : s;
        };
        var threeDigits = function(nr) {
            var s = nr.toString();
            var exDigits = 3 - s.length;
            while (exDigits > 0) {
                s = "0" + s;
                exDigits--;
            }
            return s;
        };
        hours = Math.floor(seconds/3600);
        seconds -= hours*3600;
        minutes = Math.floor(seconds/60);
        seconds -= minutes * 60;
        millis = Math.floor(frac*1000);
        
        return twoDigits(hours) + ":" + twoDigits(minutes) + ":" + twoDigits(seconds) + "." + threeDigits(millis);
    },
    
    writeInit : function(t, screen) {
        this.writeToStream("WEBVTT\nStyling=CEA608\nKind=Caption\nChannel=CC" + this.channelNr + "\n");
        if (screen) {
            this.lastScreen.copy(screen);
            this.lastTime = t;
        }
        this.initWritten = true;
    },
    
    writeCue : function(startTime, endTime, screen) {
        //console.log("WRITECUE " + startTime + " --> " + endTime+ " " + screen.getDisplayText(true));
        var lastRowNr = -2; // Make sure that there is a jump in rowNr compared to lastRowNr
        for (var rowNr = 0 ; rowNr < screen.rows.length ; rowNr++) {
            var row = screen.rows[rowNr];
            if (!row.isEmpty()) {
                if (!this.combineConsecutiveRows || (rowNr !== lastRowNr + 1)) {
                    var lineNr = rowNr + 1;
                    this.writeToStream("\n" + startTime + " --> " + endTime + " line:" + lineNr + "\n");
                }
                this.outputTextRow(row);
                this.writeToStream( "\n");
                lastRowNr = rowNr;
            }
        }
    },
    
    outputTextRow : function(row) {
        var prevState = new PenState();
        var currState = null;
        var c = null;
        for (var i = 0 ; i < row.chars.length ; i++) {
            c = row.chars[i];
            var new_c_attrs = false;
            currState = c.penState;
            // First close open contexts
            if (currState.foreground !== prevState.foreground || currState.background !== prevState.background ||
                currState.flash !== prevState.flash) {
                if (prevState.foreground !== "white" || prevState.background !== "black" || prevState.flash) {
                    this.writeToStream("</c>");
                }
                new_c_attrs = true;
            }
            if (currState.underline !== prevState.underline && prevState.underline) {
                    this.writeToStream("</u>");
            }
            if (currState.italics !== prevState.italics && prevState.italics) {
                    this.writeToStream("</i>");
            }
            // Now open new contexts
            if (currState.italics !== prevState.italics) {
                if (currState.italics) {
                    this.writeToStream("<i>");
                }
                prevState.italics = currState.italics;
            }
            if (currState.underline !== prevState.underline) {
                if (currState.underline) {
                    this.writeToStream("<u>");
                }
            }
            if (new_c_attrs) {
                if (currState.foreground !== "white" || currState.background !== "black" || currState.flash) {
                    var attr_string_parts = [];
                    var bkg = currState.background;
                    if (currState.background === "transparent") {
                        attr_string_parts.push("transparent");
                    } else {
                        var parts = bkg.split("_");
                        if (parts.length  === 2 && parts[1] === "semi") {
                            attr_string_parts.push("semi-transparent");
                        }
                        if (bkg !== "black") { // This is black opaque which is default
                            attr_string_parts.push("bg_" +  parts[0]); // Add color
                        }
                    }
                    if (currState.foreground !== "white") {
                        attr_string_parts.push(currState.foreground);
                    }
                    if (currState.flash) {
                        attr_string_parts.push("blink");
                    }
                    var str = attr_string_parts.join(".");
                    this.writeToStream("<c." + str + ">");
                }
            }
            this.writeToStream(c.uchar);
            prevState.copy(currState);
        }
        // End of line
        if (currState.foreground !== "white" || currState.background !== "black") {
            this.writeToStream("</c>");
        }
        if (currState.underline) {
            this.writeToStream("</u>");
        }
        if (currState.italics) {
            this.writeToStream("</i>");
        }
    },
    
    close : function() {
        if (this.stream) {
            this.stream.end();
            this.stream = null;
        }
    }
};

module.exports.WebVTTWriter = WebVTTWriter;
