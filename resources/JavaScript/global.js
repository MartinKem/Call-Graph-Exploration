
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

var generatedNodes = 0;
var totalNodes = 0;
var totalEdges = 0;
var currentNodes = 0;
var currentEdges = 0;

/**
* (only for testing)
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {

    global.f = f;
    global.createdNodes = createdNodes;
    global.svgCont = svgCont;
    global.defsCont = defsCont;
    global.rootNodes = rootNodes;
    global.nodeMap = nodeMap;
    global.placedNodesMap = placedNodesMap;
    global.generatedNodes = generatedNodes;
    global.totalNodes = totalNodes;
    global.totalEdges = totalEdges;
    global.currentEdges = currentEdges;
    global.currentNodes = currentNodes;

    //module.exports = {
    //    f,
    //    createdNodes,
    //    svgCont,
    //    defsCont,
    //    rootNodes,
    //    nodeMap,
    //    placedNodesMap,
    //    createdEdges,
    //    currentEdges,
    //    currentNodes
    //}
}

