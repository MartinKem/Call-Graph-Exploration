

function refreshGraphData(){
document.getElementById("currentVisibleNodes").innerHTML = "Current Nodes: " + String(currentNodes);
document.getElementById("currentVisibleEdges").innerHTML = "Current Edges: " + String(currentEdges);
}

function estGraphData(){
document.getElementById("totalNodes").innerHTML = "Total Nodes: " + String(createdNodes);
document.getElementById("totalEdges").innerHTML = "Total Edges: " + "undefined";
}


/**
* (only for testing)
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {
    module.exports.refreshGraphData = refreshGraphData;
    module.exports.estGraphData = estGraphData;
}