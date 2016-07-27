#include ".scripts/polyfills.jsx"
#include ".scripts/underscore.jsx"

// put code in here
var doc = app.activeDocument;
var artboards = doc.artboards;

function getColor(num) {
    // var num = $.colorPicker();
    // num >>>= 0;
    // var b = num & 0xFF,
    //     g = (num & 0xFF00) >>> 8,
    //     r = (num & 0xFF0000) >>> 16,
    //     a = ( (num & 0xFF000000) >>> 24 ) / 255 ;
    var r = (num >> 16) & 255;
    var g = (num >> 8) & 255;
    var b = num & 255;
    var col = new RGBColor();
    col.red = r;
    col.green = g;
    col.blue = b;
    return col;
}

var newRect = function(x, y, width, height) {
    var l = 0;
    var t = 1;
    var r = 2;
    var b = 3;

    var rect = [];

    rect[l] = x;
    rect[t] = -y;
    rect[r] = width + x;
    rect[b] = -(height - rect[t]);

    return rect;
};

// make a fake artboard
var abnames = [];
for (var i = 0; i < artboards.length; i++) {
  abnames.push(artboards[i].name);
}

if (abnames.indexOf("-- ignore me --") == -1) {
  var top = 0;
  var left = 0;
  var width = 10;
  var height = 10;

  ab = artboards.add(artboards[0].artboardRect);
  ab.name = "-- ignore me --";
  ab.artboardRect = newRect(-100, -100, 10, 10);
}

// draw rect for each
var toDelete = [];
for(i = 0; i < artboards.length; i++){  
  if (artboards[i].name != "-- ignore me --") {
    var top=artboards[i].artboardRect[1];  
    var left=artboards[i].artboardRect[0];
    var width=artboards[i].artboardRect[2]-artboards[i].artboardRect[0]; 
    var height=artboards[i].artboardRect[1]-artboards[i].artboardRect[3];
    var rect = doc.pathItems.rectangle (top, left, width, height);
    rect.filled = false;
    rect.strokeColor = getColor(0x8a497e);
    rect.strokeWidth = 30;

    toDelete.push(artboards[i].name);
  }
}

// delete all the artboards
for (i = 0; i < toDelete.length; i++) {
  artboards.getByName(toDelete[i]).remove();
}