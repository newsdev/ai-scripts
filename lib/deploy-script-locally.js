/*

deploy-script-locally.js
Tom Giratikanon
July 29, 2016
Move a script to the users' Illustrator application folder.

*/

var fs = require("fs");
var path = require("path");

function deployScriptLocally(script, basename) {

	if (!script) return console.error("Error: No script.");
	if (!basename) basename = path.basename(script);

	var contents;

	// Illustrator script directories
	var destinations = [
		"/Applications/Adobe Illustrator CC 2014/Presets.localized/en_US/Scripts",
		"/Applications/Adobe Illustrator CC 2015/Presets.localized/en_US/Scripts"
	];

	try {
		contents = fs.readFileSync(script, "utf-8");
		if (!contents.length) return console.error("Error deploying script: No file contents.");
	} catch(error) {
		return console.log("Couldn't find file", script);
	}

	destinations.forEach(function(destination) {
		try {
			var result = fs.writeFileSync(path.join(destination, basename), contents);
			console.log("Wrote `" + script + "` to", path.join(destination, basename));
		} catch(error) {
			console.log("Skipped writing `" + script + "` to", path.join(destination, basename));
		}
	});

}

module.exports = deployScriptLocally;