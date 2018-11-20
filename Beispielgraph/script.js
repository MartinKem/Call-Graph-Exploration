//creates a div with header and functioncalls for each nodeelement
//nodes = node objects
//foreign = foreignObject (needed to create html objects inside)
function createNodes(nodes,foreign) {
    nodes.forEach(foo);
    function foo(n) {
        console.log(n.name + "-" + n.inhalt);
        var x=foreign
            .append("xhtml:div")
            .attr("class","div_node")
            .style("left", n.x + "px")
            .style("top", n.y + "px")
            .style("width", n.width + "px")
            .style("height", n.height + "px")
            .append("xhtml:h3")
            .text(n.name)
            .append("xhtml:div")
            .attr("class","node_inhalt")
            .append("xhtml:ul")

            for(var i=0;i!=n.inhalt.length;i++){
            x
                .append("xhtml:li")
                .text(i+ ": " + n.inhalt[i])
            }

    }
}

