//creates a div with header and functioncalls for each nodeelement
//nodes = node objects
//foreign = foreignObject (needed to create html objects inside)
function createNodes(nodes,foreign) {
    var NodeNr = 0;
	nodes.forEach(foo);
    function foo(n) {
        var node = foreign.append("xhtml:div")
                .attr("class","div_node")
                .attr("id", NodeNr)
                .style("left", n.x + "px")
                .style("top", n.y + "px")
                .style("min-width", "300px")
                .style("padding", "20px")
				.style("border-width", "5px") // sizes must stay in js-file for later calculations
							
        node.append("xhtml:h3")
            .text(n.name)
			.style("text-align", "center");
			
        node = node.append("xhtml:div")
					.attr("class","node_inhalt")
		var methodNr = 0;
		for(var i=0; i!=n.inhalt.length; i++){
			node.append("xhtml:div")
				.text(i + ": " + n.inhalt[i])
				.attr("id", NodeNr + "#" + methodNr)
				.style("width", "100%")
				.style("border", "solid")
				.style("box-sizing", "border-box")
				.style("border-width", "2px")
				.style("border-top-width", (i == 0 ? "2px" : "0px"))
				.style("border-radius", "5px")
				.style("padding", "5px");
			methodNr++;
		}

		NodeNr++;
    }

}

function createSingleNode(nodeID, cont, x, y, name, content){
	var node = cont.append("xhtml:div")
			.attr("id", nodeID)
			.attr("class","div_node")
			.style("left", x + "px")
			.style("top", y + "px")
			.style("min-width", "300px")
			.style("padding", "20px")
			.style("border-width", "5px") // sizes must stay in js-file for later calculations
						
	node.append("xhtml:h3")
		.text(name)
		.style("text-align", "center");
		
	node = node.append("xhtml:div")
				.attr("class","node_inhalt")
	var methodNr = 0;
	for(var i=0; i < content.length; i++){
		node.append("xhtml:div")
			.text(i + ": " + content[i])
			.attr("id", nodeID + "#" + methodNr)
			.style("width", "100%")
			.style("border", "solid")
			.style("box-sizing", "border-box")
			.style("border-width", "2px")
			.style("border-top-width", (i == 0 ? "2px" : "0px"))
			.style("border-radius", "5px")
			.style("padding", "5px");
		methodNr++;
	}
}


