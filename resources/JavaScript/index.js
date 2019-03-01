/**
* (only for testing)
* IMPORT:
* *******
*/
if (typeof module !== 'undefined') {
	var $ = require('jquery');
	var d3 = require('d3');
	var global = require('./global');
}


//Add the events for the drop zone
var dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; //shows it is a copy
}

function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer.files; // FileList object.

	document.getElementById('fileinput').files = files; // set new file
}


// returns the string, that identifies the node with the given data
function idString(nodeData) {
	if (!nodeData) return;
	let result = nodeData.declaringClass + '.' + nodeData.name + '(';
	for (let i = 0; i < nodeData.parameterTypes.length; i++) {
		result += nodeData.parameterTypes[i];
		if (i < nodeData.parameterTypes.length - 1) result += ',';
	}
	result += '):' + nodeData.returnType;
	return result;
}

// extracts the node data out of an identification string
// requires, that declaringClass, name, parameterTypes and returnType do not contain any of the following symbols: "."   ","   "):"   "("
function getNodeDataFromString(idString) {
	if (idString.split('(').length > 2) console.log("Identification error, multiple '(' in idString");
	[declaringClass, rest] = idString.split('.');
	if (!rest) return;
	[name, rest] = rest.split('(');
	if (!rest) return;
	[parameterString, returnType] = rest.split('):');
	if (!returnType) return;
	let parameterTypes = parameterString.split(',');

	return { declaringClass: declaringClass, name: name, parameterTypes: parameterTypes, returnType: returnType };
}

// returns a string with escaped ">" and "<"
function escapeSG(string) {
	return string.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

// if a node is placed outside the current svg container, the container grows in that direction
function resizeSVGCont(node) {
	let svgWidth = parseInt(svgCont.attr("width"));
	let svgHeight = parseInt(svgCont.attr("height"));
	let sizes = node.getSizes();
	let resized = false;

	if (sizes.x < 0) {
		resized = true;
		svgCont.attr("width", svgWidth + 1000);
		replaceAllHorizontally()
	} else if (sizes.x + sizes.width > svgWidth) {
		resized = true;
		svgCont.attr("width", svgWidth + 1000);
	}
	if (sizes.y < 0) {
		resized = true;
		svgCont.attr("height", svgHeight + 1000);
		replaceAllVertically()
	} else if (sizes.y + sizes.height > svgHeight) {
		resized = true;
		svgCont.attr("height", svgHeight + 1000);
	}

	// this function is executed until the placed node is inside the svg container
	if (resized) {
		// force.size([svgCont.attr("width"), svgCont.attr("height")]);
		resizeSVGCont(node);
		node.focus();
	}

	// In case that the node was placed behind the left or the top border, in addition to increasing the container sizes
	// the whole graph and the force graph must be replaced.
	function replaceAllHorizontally() {
		Array.from(placedNodesMap.values()).forEach(function (node) {
			node.setPosition(node.getSizes().x + 1000, node.getSizes().y);
			document.getElementById(idString(node.getNodeData())).parentNode.setAttribute("x", node.getSizes().x);
			node.reloadEdges(node.getDetailed() ? "toDetailed" : "toAbstract");
		});
		for (let i = 0; i < nodes.length; i++) {
			nodes[i].px += 1000;
			nodes[i].x += 1000;
		}
	}

	function replaceAllVertically() {
		Array.from(placedNodesMap.values()).forEach(function (node) {
			node.setPosition(node.getSizes().x, node.getSizes().y + 1000);
			document.getElementById(idString(node.getNodeData())).parentNode.setAttribute("y", node.getSizes().y);
			node.reloadEdges(node.getDetailed() ? "toDetailed" : "toAbstract");
		});
		for (let i = 0; i < nodes.length; i++) {
			nodes[i].py += 1000;
			nodes[i].y += 1000;
		}
	}
	return resized;
}

function open_close(currentValue) {

	if (currentValue === "Hide Details") {
		d3.selectAll(".node_inhalt").classed("invis", true);
		Array.from(placedNodesMap.values()).forEach(function (node) { node.toggleToAbstract(); });
		// rootNodes.forEach(function(rootNode){ rootNode.allToAbstract(); });
		document.getElementById("btn").innerText = "Show Details";
	} else {

		d3.selectAll(".node_inhalt").classed("invis", false);
		Array.from(placedNodesMap.values()).forEach(function (node) { node.toggleToDetailed(); });
		// rootNodes.forEach(function(rootNode){ rootNode.allToDetailed(); });
		document.getElementById("btn").innerText = "Hide Details";
	}
}



/**
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {
	module.exports.open_close = open_close;
	module.exports.idString = idString;
}