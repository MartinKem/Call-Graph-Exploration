/**
* (only for testing)
* IMPORT:
* *******
*/
if (typeof module !== 'undefined') {
    var index = require("./index");
	var createdNodes = index.createdNodes;

}

function refreshGraphData(){
document.getElementById("currentVisibleNodes").innerHTML = "Current Nodes: " + String(currentNodes);
document.getElementById("currentVisibleEdges").innerHTML = "Current Edges: " + String(currentEdges);
}

function estGraphData(){
document.getElementById("totalNodes").innerHTML = "Total Nodes: " + String(createdNodes);
document.getElementById("totalEdges").innerHTML = "Total Edges: " + "undefined";
}

var createdEdges = 0;
var currentNodes = 0;
var currentEdges = 0;


/**
* (only for testing)
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {
    module.exports.refreshGraphData = refreshGraphData;
    module.exports.estGraphData = estGraphData;
    module.exports.createdEdges = createdEdges;
    module.exports.currentNodes = currentNodes;
    module.exports.currentEdges = currentEdges;
}