
var links = [];
var nodes = [{index: 0, x: svgCont.attr('width')/2, y: svgCont.attr('height')/2, fixed: true, id: "0"}];
[force, nodeSelection, linkSelection] = initForce(svgCont, nodes, links);

/*
initialized the force graph throw declaring a link selection, a node selection and the d3-force-layout
also starts the force-layouting

svg: svg container to plot the graph in
nodeArr: array of nodes:{index: a, x: b, y:c, id: d}
linkArr: array of links:{source: nodeA, target: nodeB}

returns: [force, nodeSelection, linkSelection] initialized force instance and d3-selection of nodes and links
*/
function initForce(svg, nodeArr, linkArr){

	var linkSelection = svg.selectAll("line")
		.data(linkArr)
		.enter().append("line");

	var nodeSelection = svg.selectAll("circle")
		.data(nodeArr)
		.enter().append("circle")
		.attr("r", 10 - .75)
		.style("fill", "rgb(31, 119, 180)");
	
	width = d3.select("svg").attr("width");
	height = d3.select("svg").attr("height");
	
	var force = d3.layout.force()
		.charge(-50000)
		.linkDistance(1500)
		.size([width, height])
		.nodes(nodeArr)
		.links(linkArr)
		.on("tick", function(e){ tick(e, linkSelection, nodeSelection); })
		.on("end", function(e){ fix(e, linkSelection); })
		.start();

	for(var i = 0; i < 1000; i++){
		force.tick();
	}
	force.stop();

	return [force, nodeSelection, linkSelection];
}

/*
defines the distribution of child nodes in the graph

e: tick instance given by on tick function
linkSelection: d3-selection of links
nodeSelection: d3-selection of nodes

returns void
*/
function tick(e, linkSelection, nodeSelection) {
	var k = 0.1 * e.alpha;
	// push targets away from center
	linkSelection.each(function(d) {
		if(!d.target.fixed || !d.source.fixed){
			var diffx = d.target.x - nodes[0].x;
			var diffy = d.target.y - nodes[0].y;
			d.target.x += k*diffx;
			d.target.y += k*diffy;
		}
		})
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });

	nodeSelection
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; });

}

/*
fixes all plotted nodes

e: tick instance given by on tick function
linkSelection: d3 selection of links

returns: void
*/
function fix(e, linkSelection){
	linkSelection.each(function(d) {
		d.source.fixed = true;
		d.target.fixed = true;
	});
}

/*
adds several nodes to the current force graph and calculates their positions

sourceNodeID: id of the source node
targetNodeIDs: array of ids of all the target nodes

returns: positions: array of positions:{x: a, y: b} for each of the target nodes
*/
function addNodeToForceTree(sourceNodeID, targetNodeIDs){
	sourceNode = 0;
	for(var i = 0; i < nodes.length; i++){
		if(sourceNodeID == nodes[i].id){
			sourceNode = i;
			break;
		}
	}
	
	var firstIdx = nodes.length;
	var count = targetNodeIDs.length;
	do {
		var idx = nodes.length;
		nodes.push({index: idx, id: targetNodeIDs[targetNodeIDs.length - count]})
		links.push({source: sourceNode, target: idx})
	} while(--count > 0);
	restartForceLayouting();
	var positions = [];
	for(var i = firstIdx; i < nodes.length; i++){
		positions.push({x: nodes[i].x, y: nodes[i].y, index: i});
	}
	return positions;
}

/*
updates the node- and link-selection for the arrays "nodes" and "links"
also starts the force-layouting

returns: void
*/
function restartForceLayouting(ticks){
	nodeSelection = nodeSelection.data(nodes);

	nodeSelection.enter().insert("circle", ".cursor")
		.attr("r", 10 - .75)
		.style("fill", "rgb(31, 119, 180)");

	linkSelection = linkSelection.data(links);

	linkSelection.enter().insert("line", ".node")
		.attr("class", "link");

	force.nodes(nodes)
		.links(links)
		.on("tick", function(e){ tick(e, linkSelection, nodeSelection); })
		.on("end", function(e){ fix(e, linkSelection); })
		.start();

	for(var i = 0; i < (ticks ? ticks : 500); i++){
		force.tick();
	}
	force.stop();
}