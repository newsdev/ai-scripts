#include ".scripts/polyfills.jsx"
#include ".scripts/underscore.jsx"
#include ".scripts/utils.jsx"

// select all elements with matching name id

// var dataFile = File.openDialog('Select JSON file', 'text/json', false);
var json = readFile(app.activeDocument.path+'/colorizer.json').replace(new RegExp("\n[ \t]+", "gm"), ' ');

// sometimes illustrator strips of the last character
if (json.charAt(json.length-1) != ']') json = json + ']';

eval('var files = '+json+';');

var file_options = [],
    file_index = {};

for (var i=0; i<files.length; i++) {
    file_options.push(files[i].file);
    file_index[files[i].file] = i;
}


var Pallette = new Window ("dialog", "Select the data file");
// Pallette.add ("statictext", undefined, "Fill Opening in Inches:");
Pallette.orientation = "column";
var myDropdown =  Pallette.add ("dropdownlist", undefined, file_options);
myDropdown.selection = myDropdown.items[0];
var myButtonGroup =  Pallette.add ("group");
myButtonGroup.orientation = "row";
var btnCreate = myButtonGroup.add ("button", undefined, "OK");
var btnCancel = myButtonGroup.add ("button", undefined, "Cancel");

var doc = app.activeDocument;
var result = [];

btnCreate.onClick = function () {
    result = [];

    var file = String(myDropdown.selection);

    var data = files[file_index[file]];
    var nanColor = 0xffffff;

    checkLayers(doc.layers, data.data);

    // alert('found '+result.length+' shapes');

    for (var i=0; i<result.length; i++) {
        // if (i>0 && i%50==0) alert(i);
        if (result[i]) {
            var color = data.data[result[i].name].fill,
                stroke = data.data[result[i].name].stroke;
            
            if (result[i].typename == 'CompoundPathItem') {
                for (var pi=0; pi < result[i].pathItems.length; pi++) {
                    applyStyle(result[i].pathItems[pi], color, stroke);
                }
            } else {
                applyStyle(result[i], color, stroke);
            }            
        }
    }

    function applyStyle(thing, fill, stroke) {
        if (fill !== undefined) {
            if (fill === false) {
                thing.filled = false;
            } else {
                thing.filled = true;
                thing.fillColor = getColor(fill);
            }
        }
        if (stroke !== undefined) {
            if (stroke === false) {
                thing.stroked = false;
            } else {
                thing.stroked = true;
                thing.strokeColor = getColor(stroke);
            }
        }
    }

    Pallette.close();

    return false;  

    function checkLayers(layers, data) {
        
        for (var lid=0; lid<layers.length; lid++) {
            var layer = layers[lid];
            if (!layer.locked) { // only deal with visible layers
                var checkItemGroups = [layer.pathItems, layer.symbolItems, layer.compoundPathItems];
                all_groups = [];
                
                traverseGroups(layer.groupItems);
                
                for (var g=0; g<all_groups.length; g++) {
                    if (!all_groups[g].locked) {
                        if (data[all_groups[g].name]) {
                            // give children same name as group
                            var items_g = [all_groups[g].pathItems,all_groups[g].symbolItems,all_groups[g].compoundPathItems];
                            for (var k=0;k<items_g.length;k++) {
                                if (items_g[k].length > 0) {
                                    for (var l=0;l<items_g[k].length;l++) {
                                        items_g[k][l].name = all_groups[g].name;
                                    }
                                }
                            }
                        }
                        checkItemGroups.push(all_groups[g].pathItems);
                        checkItemGroups.push(all_groups[g].symbolItems);
                        checkItemGroups.push(all_groups[g].compoundPathItems);
                    }
                }
                for (var cig=0; cig<checkItemGroups.length; cig++) {
                    for (var item_i=0; item_i<checkItemGroups[cig].length; item_i++) {
                        var check_item = checkItemGroups[cig][item_i];
                        if (data[check_item.name] !== undefined) {
                            result.push(check_item);
                        }
                    }
                }
                if (layer.layers.length > 0) checkLayers(layer.layers, data);
            }
        }


        function traverseGroups(groupItems) {
            for (var g=0;g<groupItems.length;g++) {
                // recursively check sub-groups
                if (!groupItems[g].locked) {
                    all_groups.push(groupItems[g]);
                    if (groupItems[g].groupItems.length > 0) {
                        traverseGroups(groupItems[g].groupItems);   
                    }
                }
            }
        }
    }

};

Pallette.show();


function readFile(filename) {
    var f = new File(filename);
    f.open('r');
    var data = '';
    while(!f.eof) {
        data = data + f.readln() + '\n';
    }
    f.close();
    return data;
}


