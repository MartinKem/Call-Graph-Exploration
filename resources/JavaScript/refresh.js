function refreshGraphData(){
document.getElementById("totalNodes").innerHTML = "Total Nodes: " + String(createdNodes);
document.getElementById("totalEdges").innerHTML = "Total Edges: " + "placeholder";
document.getElementById("currentVisibleNodes").innerHTML = "Current Nodes: " + String(currentNodes);
document.getElementById("currentVisibleEdges").innerHTML = "Current Edges: " + String(currentEdges);
}

var currentNodes = 0;
var currentEdges = 0;

refreshGraphData();