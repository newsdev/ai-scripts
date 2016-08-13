var docRef = app.activeDocument;
 
with (docRef) {
     for (var i = 0; i < layers.length; i++) {
          layers[i].name = layers[i].name.toLowerCase();
     }
}