
/**
* (only for testing)
* IMPORT:
* *******
*/
if (typeof module !== 'undefined') {
	var $ = require('jquery');
	var d3 = require('d3');
}

let f = d3.layout.force;

var createdNodes = 0;
var svgCont = d3.select("#graph")
    .append("svg")
    .attr("width", 4000)
    .attr("height", 4000);

var defsCont = svgCont.append("defs").attr("id", "definitions");

// var rootNodeString; // global rootNodeString not used anymore
// var rootNode;	// global rootNode not used anymore
var rootNodes = [];

/*
maps from following string:
declaringClass.name(parameterTypes[0],...,parameterTypes[n]):returnType
to:
node object
 */
var nodeMap = new Map();
var placedNodesMap = new Map();



/**
* (only for testing)
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {

    module.exports = {
        f,
        createdNodes,
        svgCont,
        defsCont,
        rootNodes,
        nodeMap,
        placedNodesMap

    }
}

