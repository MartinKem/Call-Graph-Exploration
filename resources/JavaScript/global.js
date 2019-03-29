
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
    .on("drag", function () {
        if (d3.event.sourceEvent.path[0].nodeName !== "svg") return;
        if (svgDragLock) {
            svgDragLock = false;
        }
        else {
            document.getElementsByTagName('html')[0].scrollLeft -= 2 * parseInt(d3.event.dx);
            document.getElementsByTagName('html')[0].scrollTop -= 2 * parseInt(d3.event.dy);
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

/**
* maps from following string:
* declaringClass.name(parameterTypes[0],...,parameterTypes[n]):returnType
* to:
* node object
*/
var nodeMap = new Map();
var placedNodesMap = new Map();

//variables that keep track of the graph stats
var generatedNodes = 0;
var totalNodes = 0;
var totalEdges = 0;
var currentNodes = 0;
var currentEdges = 0;
var maxSuggests = 10;


const nodeWidth = 380; //380 default; sets width of nodes, should only be changed in conjunction with width of .callsite in style.css
const nodeHeightEmpty = 143;
const callSiteWidth = nodeWidth -30; //nodewidth - 33 default; used to place edges, no impact on width of callsite visuals
const callSiteHeight = 27;
const callSiteTopOffset = 128;

//parameters of the force layout algorithm:
const forceCharge = -18000;                // -100000 default; determines how much nodes attract or repel each other, negative equals repulsion
const forceLinkDistance = 1000;            // 1500 default; sets the desired distance for each link
const forceGravity = 0.001;                // 0.001 default; determines the attraction of nodes to the center of the graph
const forceLinkStrength = 0.3;             // 1 default; determines how strongly link distance is adhered to, 1 equals full effect

var links = [];
var nodes = [];

var lockOnchange = false; //had to be added because onchange doesn't work anymore on id='fileinput' if file is droped, lockOnchange only exists because of this purpose

/**
* (only for testing)
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {

    global.lockOnchange = lockOnchange;
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
    global.maxSuggests = maxSuggests;
    global.forceCharge = forceCharge;
    global.forceLinkDistance = forceLinkDistance;
    global.forceGravity = forceGravity;
    global.forceLinkStrength = forceLinkStrength;
}

