
class node{
	constructor(nodeID, parentID, container, xVal, yVal, nameVal, contentVal){
		this.nodeID = nodeID;
		this.parentID = parentID;
		this.container = container;
		this.x = xVal;
		this.y = yVal;
		this.name = nameVal;
		this.content = contentVal;
		this.children = [];
	}
	
	/*
	adds a child node to the current node
	
	nodeID: id of the child node
	xVal: left distance
	yVal: right distance
	nameVal: child's title
	contentVal: child's list of methods
	
	returns: created instance of the node
	*/
	addChild(nodeID, xVal, yVal, nameVal, contentVal){
		var parentID = this.nodeID + "#" + this.children.length;
		this.children.push(new node(nodeID, parentID, this.container, xVal, yVal, nameVal, contentVal));
		return this.children[this.children.length-1];
	}
	
	/*
	plottes one of the child nodes and an edge to it
	
	childID: id of the child node
	
	returns: void
	*/
	showChild(childID){
		var i = 0;
		for (i; i < this.children.length; i++){
			if(childID == this.children[i].getID()) {
				this.children[i].showNode();
				break;
			}
		}
		method2nodeEdge(this.nodeID + '#' + i, childID);
	}
	
	/*
	plottes this node
	
	return: void
	*/
	showNode(){
		createSingleNode(this.nodeID, this.container, this.x, this.y, this.name, this.content);
		this.visible = true;
	}
	
	/*
	sets all the child nodes, this node and the edge to this node (if it exists) to invisible
	
	returns: void
	*/
	hideNode(){
		this.children.forEach(function (elem){elem.hideNode()});
		if(parseInt(this.parentID) >= 0){
			var node = document.getElementById(this.nodeID);
			var edge = document.getElementById(this.parentID + '->' + this.nodeID);
			node.style.display = "none";
			edge.style.display = "none";
		}
	}
	
	/*
	returns the id of this node
	*/
	getID(){ return this.nodeID; }
	
	getChildNodes(){ return this.children; }
	
}


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

/*
plottes a single node with some given attributes

nodeID: id of the node
cont: foreignObject container
x: left distance
y: top distance
name: node title
content: list of methods

returns: void
*/
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


