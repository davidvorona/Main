/*
Copyright (c) 2012 Juan Mellado

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

'use strict';

//THIS FILE LOOKS THROUGH EACH IMAGE IN HTML VIDEO ELEMENT FOR MATCHES TO THE PLAYER'S HAND RGB
var HT = HT || {};
var delayedTrackerMatches = {trackFlag: false}, checkMatches = 0;
var counter = true, startTime, endTime, that;

HT.Tracker = function(params){
  this.params = params || {};

  this.mask = new CV.Image();
  this.eroded = new CV.Image();
  this.contours = [];

  this.skinner = new HT.Skinner();
};

//Engaged by demo.tick(), this.skinner.mask is where the match checking functionality was added
HT.Tracker.prototype.detect = function(image){
  this.skinner.mask(image, this.mask);
  if (this.params.fast){
    this.blackBorder(this.mask);
  } else {
    CV.erode(this.mask, this.eroded);
    CV.dilate(this.eroded, this.mask);
  }
  this.contours = CV.findContours(this.mask);
  return this.findCandidate(this.contours, image.width * image.height * 0.05, 0.005);
};

HT.Tracker.prototype.returnTimeObj = function(){ //PULLING THE OBJECT CONTAINING PLAYER HAND VELOCITY FROM SKINNER.MASK
  return this.skinner.finalTimeObj;
};

HT.Tracker.prototype.clear = function(){
   this.skinner.finalTimeObj.counter = 0;
};

HT.Tracker.prototype.findCandidate = function(contours, minSize, epsilon){
  var contour, candidate;

  contour = this.findMaxArea(contours, minSize);
  if (contour){
    contour = CV.approxPolyDP(contour, contour.length * epsilon);

    candidate = new HT.Candidate(contour);
  }
  return candidate;
};

HT.Tracker.prototype.findMaxArea = function(contours, minSize){
  var len = contours.length, i = 0,
      maxArea = -Infinity, area, contour;

  for (; i < len; ++ i){
    area = CV.area(contours[i]);
    if (area >= minSize){

      if (area > maxArea) {
        maxArea = area;

        contour = contours[i];
      }
    }
  }

  return contour;
};

HT.Tracker.prototype.blackBorder = function(image){
  var img = image.data, width = image.width, height = image.height,
      pos = 0, i;

  for (i = 0; i < width; ++ i){
    img[pos ++] = 0;
  }

  for (i = 2; i < height; ++ i){
    img[pos] = img[pos + width - 1] = 0;

    pos += width;
  }

  for (i = 0; i < width; ++ i){
    img[pos ++] = 0;
  }

  return image;
};

HT.Candidate = function(contour){
  this.contour = contour;
  this.hull = CV.convexHull(contour);
  this.defects = CV.convexityDefects(contour, this.hull);
};

HT.Skinner = function(){
  that = this;
  this.finalTimeObj = {
    trackFlag: 0,
    flag: 0,
    counter: 0,
    coordinate: {}
   };
   this.usePicture = {
    averageR: 0,
    averageG: 0,
    averageB: 0,
  };
  this.middle = {
    r: 0,
    g: 0,
    b: 0
  };
};

//Using indices collected in engageTracking.js (pixelsNeededIndex) to determine which part of the image to check (center circle)
//
HT.Skinner.prototype.mask = function(imageSrc, imageDst){
  var test = that.finalTimeObj;
  var src = imageSrc.data, dst = imageDst.data, len = src.length,
       j = 0,
      r, g, b, h, s, v, value;

  let needed = pixelsNeededIndex;
  for(let i = 0 ; i < needed.length; i++){
    r = src[needed[i]];
    g = src[needed[i] + 1];
    b = src[needed[i] + 2];

    v = Math.max(r, g, b);
    s = v === 0? 0: 255 * ( v - Math.min(r, g, b) ) / v;
    h = 0;

    if (0 !== s){
      if (v === r){
        h = 30 * (g - b) / s;
      }else if (v === g){
        h = 60 + ( (b - r) / s);
      }else{
        h = 120 + ( (r - g) / s);
      }
      if (h < 0){
        h += 360;
      }
    }
    //FOR TESTING PURPOSES - SEE WHERE X, Y IS IN OBJ.
    if ( i > 10000 && i < 50000) {
      h = 0;
      s = 0;
      v = 0;
    }
    //END TEST
    value = 0;

    if (v >= 15 && v <= 250){
      if (h >= 3 && h <= 33){
        value = 255;
      }
    }
       // As soon as 1 match is found, collect all other matches found for half a second, store total number of matches found in delayedTrackerMatches.counter
     if (r > minMaxColors.lowRed && r < minMaxColors.maxRed && g > minMaxColors.lowGreen && g < minMaxColors.maxGreen && b > minMaxColors.lowBlue && b < minMaxColors.maxBlue && that.finalTimeObj.coordinate[i] === undefined){
       that.finalTimeObj.counter++; // <-- note each match found as tracker scans center cirlce of current HTML video 
       that.finalTimeObj.coordinate[i] = true; // <-- to avoid tracking same coordinate more than 1x if hand is still
       if (user.checkMatches === 0) { // <-- to stop function from re-running every time match is found
         user.checkMatches++;
         setTimeout(function(){
           delayedTrackerMatches.counter = that.finalTimeObj.counter;
           delayedTrackerMatches.trackFlag = true;
           that.finalTimeObj.coordinate = {}; 
         }, 500);
       }
     }

    dst[j ++] = value;
  }

  imageDst.width = imageSrc.width;
  imageDst.height = imageSrc.height;
  return imageDst;
};

HT.Skinner.prototype.checkPic = function(imageSrc){
  var pictureObj  = {};
    var len = imageSrc.data.length, src = imageSrc.data;
     var i = 0, r, g, b, averageR = 0, averageB = 0, averageG = 0, picCounter = 0;
      that.middle.r = src[90000], that.middle.g = src[90001], that.middle.b = src[90002];

  for(; i < len; i += 4){

    r = src[i];
    g = src[i + 1];
    b = src[i + 2];

    if ( i > 10000 && i < 50000) {
      r = 0;
      g = 0;
      b = 0;
    }

    if (i > 90000 && i < 91000){
    averageR += r;
     averageG += g;
     averageB += b;
  }

  picCounter++;

  }
  that.usePicture.averageR = averageR / 250;
  that.usePicture.averageG = averageG / 250;
  that.usePicture.averageB = averageB / 250;
};
