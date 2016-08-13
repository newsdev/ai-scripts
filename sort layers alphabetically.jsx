#target "Illustrator"

/**
 * sort layers (with sublayer)
 */

var doc = app.documents[0];
var lay = doc.layers;
var array_primary = [];
for (var i=0, iL=lay.length; i < iL ; i++) {
  if (lay[i].layers.length === 0) {
    array_primary.push( lay[i].name );
  }
  else {
    array_primary.push( lay[i].name );
    var array_secondary = [];
    for (var j=0, jL=lay[i].layers.length; j < jL ; j++) {
      array_secondary.push(lay[i].layers[j].name);
    };
    var result2 = array_secondary.sort( function (a,b) { return a > b });
    // sort sublayers
    sort_layer (lay[i], result2);
  }
};
var result1 = array_primary.sort( function(a,b) { return a > b } );

// sort layers
sort_layer (doc, result1);

function sort_layer (obj, array) {
  for (var ri=0, riL=array.length; ri < riL ; ri++) {
    obj.layers.getByName(array[ri]).zOrder( ZOrderMethod.SENDTOBACK );
  };
}