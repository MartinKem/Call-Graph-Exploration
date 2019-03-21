
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


var svgDragLock = false;
var svgDrag = d3.behavior.drag()
    .on("drag", function(){
        if(d3.event.sourceEvent.path[0].nodeName !== "svg") return;
        if(svgDragLock){
            svgDragLock = false;
        }
        else{
            document.getElementsByTagName('html')[0].scrollLeft -= 2*parseInt(d3.event.dx);
            document.getElementsByTagName('html')[0].scrollTop -= 2*parseInt(d3.event.dy);
            svgDragLock = true;
        }
    });

var svgCont = d3.select("#graph")
    .append("svg")
    .call(svgDrag)
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


const nodeWidth = 400;
const nodeHeightEmpty = 247;
const callSiteWidth = nodeWidth-53;
const callSiteHeight = 27;
const callSiteTopOffset = 220;

var links = [];
var nodes = [];

/**
* (only for testing)
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {

    global.links = links;
    global.nodes = nodes;
    global.nodeWidth  = nodeWidth;
    global.nodeHeightEmpty  = nodeHeightEmpty;
    global.callSiteWidth  = callSiteWidth;
    global.callSiteHeight  = callSiteHeight;
    global.callSiteTopOffset  = callSiteTopOffset; 
    global.d3 = d3;
    global.$ = $;
    global.f = f;
    global.createdNodes = createdNodes;
    global.svgCont = svgCont;
    global.svgDragLock = svgDragLock;
    global.svgDrag = svgDrag;
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

