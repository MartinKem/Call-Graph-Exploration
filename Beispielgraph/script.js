//creates a div with header and functioncalls for each nodeelement
//nodes = node objects
//foreign = foreignObject (needed to create html objects inside)
function createNodes(nodes,foreign) {
    nodes.forEach(foo);
    function foo(n) {
        var node = foreign.append("xhtml:div")
							.attr("class","div_node")
							.attr("id", n.name)
							.style("left", n.x + "px")
							.style("top", n.y + "px")
							.style("min-width", "300px")
							.style("padding", "20px");
							
        node.append("xhtml:h3")
            .text(n.name)
			.style("text-align", "center");
			
        node = node.append("xhtml:div")
					.attr("class","node_inhalt")
					.append("xhtml:div");
            for(var i=0; i!=n.inhalt.length; i++){
            node.append("xhtml:div")
                .text(i + ": " + n.inhalt[i])
				.attr("id", n.name + "#" + n.inhalt[i])
				.style("width", "100%")
				.style("border", "solid")
				.style("box-sizing", "border-box")
				.style("border-width", "2px")
				.style("border-top-width", (i == 0 ? "2px" : "0px"))
				.style("border-radius", "4px")
				.style("padding", "5px");
            }

    }
}


