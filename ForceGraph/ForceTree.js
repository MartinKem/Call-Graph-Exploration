
function initForce(nodeArr, linkArr){

	var link = svg.selectAll("line")
		.data(linkArr)
		.enter().append("line");

	var node = svg.selectAll("circle")
		.data(nodeArr)
		.enter().append("circle")
		.attr("r", radius - .75)
		.style("fill", function(d) { return fill(d.group); })
		.style("stroke", function(d) { return d3.rgb(fill(d.group)).darker(); });

	var force = d3.layout.force()
		.charge(-200)
		.linkDistance(50)
		.size([width, height])
		.nodes(nodeArr)
		.links(linkArr)
		.on("tick", function(e){ tick(e, link, node); })
		.on("end", function(e){ fix(e, link); })
		.start();

	for(var i = 0; i < 1000; i++){
		force.tick();
	}
	force.stop();
	return [force, node, link];
}

function tick(e, link, node) {
	var k = 0.15 * e.alpha;
	// push targets away from center
	link.each(function(d) {
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

	node
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; });

}

function fix(e, link){
	link.each(function(d) {
		d.source.fixed = true;
		d.target.fixed = true;
	});
}

function addNode(sourceNode, count){
	do {
		idx = nodes.length;
		nodes.push({index: idx})
		links.push({source: sourceNode, target: idx})
	} while(--count > 0);
	restart();
}


function restart() {
	node = node.data(nodes);

	node.enter().insert("circle", ".cursor")
		.attr("r", radius - .75)
		.style("fill", function(d) { return fill(d.group); })
		.style("stroke", function(d) { return d3.rgb(fill(d.group)).darker(); })
		.call(force.drag);

	link = link.data(links);

	link.enter().insert("line", ".node")
		.attr("class", "link");

	force.nodes(nodes)
		.links(links)
		.on("tick", function(e){ tick(e, link, node); })
		.on("end", function(e){ fix(e, link); })
		.start();
	for(var i = 0; i < 1000; i++){
		force.tick();
	}
	force.stop();
}