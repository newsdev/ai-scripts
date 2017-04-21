#include ".scripts/utils.jsx"

// first we load the data file
var dataFile = app.activeDocument.path+'/colorizer.json';
if (!fileExists(dataFile)) {
    dataFile = File.openDialog('Select JSON data file', 'text/json', false);
}

var jsonStr = readFile(dataFile)
    .replace(new RegExp("\n[ \t]+", "gm"), ' ')
    .replace(new RegExp("\s*$"),"");

// // sometimes illustrator strips of the last character
// if (jsonStr.charAt(jsonStr.length-1) != ']') jsonStr = jsonStr + ']';

eval('var files = '+jsonStr+';');

var file_options = [],
    file_index = {};

for (var i=0; i<files.length; i++) {
    file_options.push(files[i].file);
    file_index[files[i].file] = i;
}

var Pallette = new Window ("dialog", "Select the dataset");
// Pallette.add ("statictext", undefined, "Fill Opening in Inches:");
Pallette.orientation = "column";
var myDropdown =  Pallette.add ("dropdownlist", undefined, file_options);
myDropdown.selection = myDropdown.items[0];
var myButtonGroup =  Pallette.add ("group");
myButtonGroup.orientation = "row";
var btnCreate = myButtonGroup.add ("button", undefined, "OK");
var btnCancel = myButtonGroup.add ("button", undefined, "Cancel");
var doc = app.activeDocument;

btnCreate.onClick = function () {
    var result = [];
    var file = String(myDropdown.selection);
    var data = files[file_index[file]];
    var layerNames = [];

    checkLayers(doc.layers, data.data);
    applyStyles(result, data.data);

    Pallette.close();
    return false;

    function checkLayers(layers, data) {
        var all_groups, group, layer, n;
        for (var lid=0; lid<layers.length; lid++) {
            layer = layers[lid];
            if (!layer.locked) { // only deal with visible layers
                collectMatchingItems(result, layer.pathItems, data);
                collectMatchingItems(result, layer.symbolItems, data);
                collectMatchingItems(result, layer.compoundPathItems, data);
                all_groups = findGroups(layer.groupItems);
                for (var g=0; g<all_groups.length; g++) {
                    group = all_groups[g];
                    if (!group.locked) {
                        if (data[group.name]) {
                            // give children same name as group
                            applyName(group.pathItems, group.name);
                            applyName(group.symbolItems, group.name);
                            applyName(group.compoundPathItems, group.name);
                        }
                        collectMatchingItems(result, group.pathItems, data);
                        collectMatchingItems(result, group.symbolItems, data);
                        collectMatchingItems(result, group.compoundPathItems, data);
                    }
                }
                if (layer.layers.length > 0) checkLayers(layer.layers, data);
            }
        }
    }

    function applyName(items, name) {
        for (var i=0, n=items.length; i<n; i++) {
            items[i].name = name;
        }
    }

    function findGroups(groupItems, collection) {
        if (!collection) {
            collection = [];
        }
        for (var g=0; g<groupItems.length; g++) {
            // recursively check sub-groups
            if (!groupItems[g].locked) {
                collection.push(groupItems[g]);
                if (groupItems[g].groupItems.length > 0) {
                    findGroups(groupItems[g].groupItems, collection);
                }
            }
        }
        return collection;
    }

    function collectMatchingItems(collection, items, data) {
        var item;
        for (var i=0, n=items.length; i<n; i++) {
            item = items[i];
            if (item.name && data[item.name]) collection.push(item);
        }
    }

    function applyStyles(items, data) {
        var memos = {};
        var item, d;
        for (var i=0, n=items.length; i<n; i++) {
            item = items[i];
            d = data[item.name];
            if (!d || !item) continue; // shouldn't happen
            if (item.typename == 'CompoundPathItem') {
                for (var pi=0; pi<item.pathItems.length; pi++) {
                    applyStyle(item.pathItems[pi], d);
                }
            } else {
                applyStyle(result[i], d);
            }
        }

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
    }
};

Pallette.show();
