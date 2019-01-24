
var links = [];
var nodes = [{index: 0, x: svgCont.attr('width')/2, y: svgCont.attr('height')/2, fixed: false, id: "0"}];
// [force, nodeSelection, linkSelection] = initForce(svgCont, nodes, links);

// -----------------------------------------------------------------------------------------------------
// ---------------------------------- gesamten Call Graphen im voraus berechnen ------------------------
// -----------------------------------------------------------------------------------------------------

/*
1. alle Knoten in nodes- und links-Array einfügen
2. svgCont vergrößern
3. Force-Graph berechnen lassen
4. in node-Instanzen die x,y-Werte einfügen
5. Positionsberechnung bei addChild auskommentieren
*/

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
		.attr("r", 10 - .25)
		.style("fill", "rgb(31, 119, 180)");
	
	width = d3.select("svg").attr("width");
	height = d3.select("svg").attr("height");
	
	var force = d3.layout.force()
		.charge(-10000)
		.linkDistance(1000)
		.gravity(0.1)
		.size([width, height])
		.nodes(nodeArr)
		.links(linkArr)
		// .on("tick", function(e){ tick(e, linkSelection, nodeSelection); })
		// .on("end", function(e){ fix(e, linkSelection); })
		.on("end", function(e) { endFunction(e, linkSelection, nodeSelection); })
		.start();

	for(var i = 0; i < 200; i++){
		if(i % 20 == 0) console.log("Force calculation: " + i/2 + "%");
		force.tick();
	}
	force.stop();
	
	nodeArr.forEach(function(node){ 
		node.fixed = true;
		var nodeInstance = nodeMap.get(node.id);
		nodeInstance.setPosition(node.px, node.py);
		});
	
	nodeSelection.call(force.drag);
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

function endFunction(e, linkSelection, nodeSelection) {
    nodeSelection.attr('r', 10)
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });

    linkSelection.attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

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
	restart();
	var positions = [];
	for(var i = firstIdx; i < nodes.length; i++){
		positions.push({x: nodes[i].x, y: nodes[i].y});
	}
	return positions;
}

/*
updates the node- and link-selection for the arrays "nodes" and "links"
also starts the force-layouting

returns: void
*/
function restart() {
	nodeSelection = nodeSelection.data(nodes);

	nodeSelection.enter().insert("circle", ".cursor")
		.attr("r", 10 - .75)
		.style("fill", "rgb(31, 119, 180)")
		.call(force.drag);

	linkSelection = linkSelection.data(links);

	linkSelection.enter().insert("line", ".node")
		.attr("class", "link");

	force.nodes(nodes)
		.links(links)
		.on("tick", function(e){ tick(e, linkSelection, nodeSelection); })
		.on("end", function(e){ fix(e, linkSelection); })
		.start();
	for(var i = 0; i < 500; i++){
		force.tick();
	}
	force.stop();
}

function calcFullForceGraph(rootNode){
	for(var i = 0; i < rootNode.getChildNodes().length; i++){
		nodes.push({index: ++nextFreeNodeIndex, 
					x: svgCont.attr('width')/2, 
					y: svgCont.attr('height')/2, 
					fixed: false, 
					id: rootNode.getChildNodes()[i][0].getID()});
	}
}
