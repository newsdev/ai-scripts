#include ".scripts/polyfills.jsx"
#include ".scripts/underscore.jsx"
#include ".scripts/utils.jsx"

var doc = app.activeDocument;
var artboards = app.activeDocument.artboards;

var ignore = [],
    convert = [];

_.each(artboards, function(ab) {
    if (ab.name.charAt(0) == '-') ignore.push(ab);
    else convert.push(ab);
});

if (!ignore.length) {
    // make a fake artboard
    ab = artboards.add(artboards[0].artboardRect);
    ab.name = "-- ignore me --";
    ab.artboardRect = getRect(-600, -600, 10, 10);
}

// draw rect for each
var toDelete = [];
_.each(convert, function(ab) {
    var top = ab.artboardRect[1],
        left = ab.artboardRect[0],
        width = ab.artboardRect[2] - ab.artboardRect[0],
        height = ab.artboardRect[1] - ab.artboardRect[3],
        rect = doc.pathItems.rectangle (top, left, width, height);
    rect.filled = false;
    rect.strokeColor = getColor(0xff00ff);
    rect.strokeWidth = 10;
    rect.opacity = 50;
    toDelete.push(ab.name);
});

_.each(toDelete, function(name) {
    artboards.getByName(name).remove();
});
