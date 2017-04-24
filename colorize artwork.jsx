#include ".scripts/utils.jsx"

// first we load the data file
var dataFile = app.activeDocument.path+'/colorizer.json';
if (!fileExists(dataFile)) {
    dataFile = File.openDialog('Select JSON data file', 'text/json', false);
}

var jsonStr = readFile(dataFile)
    .replace(new RegExp("\n[ \t]+", "gm"), ' ')
    .replace(new RegExp("\s*$"),"");

eval('var files = '+jsonStr+';');

var file_options = [],
    file_index = {};

for (var i=0; i<files.length; i++) {
    file_options.push(files[i].file);
    file_index[files[i].file] = i;
}

var Pallette = new Window ("dialog", "Select the dataset");
Pallette.orientation = "column";
var myDropdown =  Pallette.add ("dropdownlist", undefined, file_options);
myDropdown.selection = myDropdown.items[0];
var myButtonGroup =  Pallette.add ("group");
myButtonGroup.orientation = "row";
var btnCreate = myButtonGroup.add ("button", undefined, "OK");
var btnCancel = myButtonGroup.add ("button", undefined, "Cancel");
btnCreate.onClick = function() {
    var file = String(myDropdown.selection);
    var data = files[file_index[file]];
    colorizeItems(app.activeDocument.layers, getColorFunction(data.data));
    Pallette.close();
    return false;
};
Pallette.show();

function colorizeItems(collection, styler) {
    for (var i=0, n=collection.length; i<n; i++) {
        colorizeItem(collection[i], styler);
    }
}

function itemIsEditable(item) {
    if (item.locked) return false;
    if (item.typename == 'Layer') {
        return item.visible;
    } else {
        return !item.hidden;
    }
}

function colorizeItem(item, styler) {
    var type = item.typename;
    if (!itemIsEditable(item)) return false;
    if (type == 'Layer' || type == 'GroupItem') {
        if (type == 'Layer') {
            colorizeItems(item.layers, styler);
        }
        colorizeItems(item.pathItems, styler);
        colorizeItems(item.symbolItems, styler);
        colorizeItems(item.compoundPathItems, styler);
        colorizeItems(item.groupItems, styler);
    } else {
        styler(item, item.name || item.parent.name);
    }
}

function getColorFunction(data) {
    var memos = {};

    function applyStyle(thing, d) {
        if (d.fill) {
            thing.filled = true;
            thing.fillColor = convertColor(d.fill);
        } else if (d.fill === false) {
            thing.filled = false;
        }
        if (d.stroke === false) {
            thing.stroked = false;
        } else if (d.stroke) {
            thing.stroked = true;
            thing.strokeColor = convertColor(d.stroke);
        }
    }

    function convertColor(value) {
        var rgb = memos[value];
        if (!rgb) {
            rgb = memos[value] = getColor(value);
        }
        return rgb;
    }

    return function(item, key) {
        var d = data[key];
        if (!d) return;
        if (item.typename == 'CompoundPathItem') {
            for (var pi=0; pi<item.pathItems.length; pi++) {
                applyStyle(item.pathItems[pi], d);
            }
        } else {
            applyStyle(item, d);
        }
    };
}
