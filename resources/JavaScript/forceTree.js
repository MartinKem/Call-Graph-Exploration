/* BSD 2-Clause License - see ./LICENSE for details. */


/**
* (only for testing)
* IMPORT:
* *******
*/
if (typeof module !== 'undefined') {
    var d3 = require('d3');
}

var force = initForce(svgCont, nodes, links);

/*
initialized the force graph throw declaring a link selection, a node selection and the d3-force-layout
also starts the force-layouting

svg: svg container to plot the graph in
nodeArr: array of nodes:{index: a, x: b, y:c, id: d}
linkArr: array of links:{source: nodeA, target: nodeB}

returns: [force, nodeSelection, linkSelection] initialized force instance and d3-selection of nodes and links
*/
function initForce(svg, nodeArr, linkArr){
	width = d3.select("svg").attr("width");
	height = d3.select("svg").attr("height");
	
	var force = d3.layout.force()
		.charge(forceCharge)
		.linkDistance(forceLinkDistance)
		.gravity(forceGravity)
		.linkStrength(forceLinkStrength)
		.size([width, height])
		.nodes(nodeArr)
		.links(linkArr)
		.on("end", function(e){ fix(); })
		.start();

	for(var i = 0; i < 298; i++){
		force.tick();
	}
	force.stop();

	return force;
}

/*
fixes all plotted nodes

returns: void
*/
function fix(){
	links.forEach(function(d){
		d.source.fixed = true;
		d.target.fixed = true;
	});
}

/*
adds several nodes to the current force graph and calculates their positions

sourceNodeID: id of the source node
targetNodeIDs: array of ids of all the target nodes

returns: positions: array of positions:{x: number, y: number, index: number} for each of the target nodes
*/
function addNodeToForceTree(sourceNodeID, targetNodeIDs){
	// in this case a new node is generated through the node search
    if(!targetNodeIDs){
        nodes.push({index: nodes.length, id: sourceNodeID});
        force.gravity(0.1);
        restartForceLayouting();
        force.gravity(0.005);
        nodes[nodes.length-1].fixed = true;
        return {x: nodes[nodes.length-1].x, y: nodes[nodes.length-1].y, index: nodes.length-1};
    }
    // we need to find the nodes-array element of the source node
	sourceNode = 0;
	for(let i = 0; i < nodes.length; i++){
		if(sourceNodeID == nodes[i].id){
			sourceNode = i;
			break;
		}
	}
	
	var firstIdx = nodes.length;
	var count = targetNodeIDs.length;
	// all new links and nodes are added to the corresponding array
	do {
		var idx = nodes.length;
		nodes.push({index: idx, id: targetNodeIDs[targetNodeIDs.length - count]});
		links.push({source: sourceNode, target: idx});
	} while(--count > 0);
	restartForceLayouting();
	var positions = [];
	// in the end we build an array with the new positions of the nodes, that have been placed
	for(let i = firstIdx; i < nodes.length; i++){
		positions.push({x: nodes[i].x, y: nodes[i].y, index: i});
	}
	return positions;
}

/*
updates the node- and link-selection for the arrays "nodes" and "links"
also starts the force-layouting

returns: void
*/
function restartForceLayouting(){
	force.nodes(nodes)
		.links(links)
		.on("end", function(e){ fix(); })
		.start();

	for(var i = 0; i < 298; i++){
		force.tick();
	}
	force.stop();
}


/**
* (only for testing)
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {
	module.exports.addNodeToForceTree = addNodeToForceTree;
}