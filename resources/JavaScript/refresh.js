/* BSD 2-Clause License - see ./LICENSE for details. */


//used to refresh the number of current nodes and edges in the bottom left corner; called every time either is changed
function refreshGraphData(){
document.getElementById("currentVisibleNodes").innerHTML = "Current Nodes: " + String(currentNodes);
document.getElementById("currentVisibleEdges").innerHTML = "Current Edges: " + String(currentEdges);
}

//used to establish the number of total nodes and edges, as well as the number of generated nodes;
//called once after the Graph is first parsed and whenever new nodes are generated
function estGraphData(){
document.getElementById("totalNodes").innerHTML = "Total Nodes: " + String(totalNodes);
document.getElementById("totalEdges").innerHTML = "Total Edges: " + String(totalEdges);
document.getElementById("generatedNodes").innerHTML = "Generated Nodes: " + String(generatedNodes);
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