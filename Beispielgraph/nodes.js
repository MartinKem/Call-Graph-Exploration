
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
		this.declaredTargets = [];
		var length = contentVal.length;
		while(length-- > 0) this.declaredTargets.push(0);
	}
	
	/*
	adds a child node to the current node
	
	nodeID: id of the child node
	xVal: left distance
	yVal: right distance
	source: index of contentVal of parentNode
	nameVal: child's title
	contentVal: child's list of methods
	
	returns: created instance of the node
	*/
	addChild(nodeID, xVal, yVal, source, nameVal, contentVal){
		var parentID = this.nodeID + "#" + source;
		this.children.push(new node(nodeID, parentID, this.container, xVal, yVal, nameVal, contentVal));
		this.declaredTargets[source]++;
		this.reloadContent();
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
		method2nodeEdge(this.children[i].parentID, childID);
	}
	
	/*
	plottes this node
	
	return: void
	*/
	showNode(){
		createSingleNode(this.nodeID, this.container, this.x, this.y, this.name, this.content, this.declaredTargets);
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
	
	// returns the id of this node
	getID(){ return this.nodeID; }
	
	// returns the array of children of this node
	getChildNodes(){ return this.children; }
	
	// reloads all call site numbers of this node
	reloadContent(){
		var methodDivs = document.getElementById(this.nodeID).childNodes[1].childNodes;
		for(var i = 0; i < methodDivs.length; i++){
			var text = methodDivs[i].childNodes[1].textContent = "(" + this.declaredTargets[i] + ")";
		}
	}
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
					
		for(var i=0; i!=n.inhalt.length; i++){
			node.append("xhtml:div")
				.text(i + ": " + n.inhalt[i])
				.attr("id", NodeNr + "#" + i)
				.style("width", "100%")
				.style("border", "solid")
				.style("box-sizing", "border-box")
				.style("border-width", "2px")
				.style("border-top-width", (i == 0 ? "2px" : "0px"))
				.style("border-radius", "5px")
				.style("padding", "5px");
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
function createSingleNode(nodeID, cont, x, y, name, content, declaredTargets){
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
				
	for(var i=0; i < content.length; i++){
		var entry = node.append("xhtml:div")
			.attr("id", nodeID + "#" + i)
			.style("width", "100%")
			.style("border", "solid")
			.style("box-sizing", "border-box")
			.style("border-width", "2px")
			.style("border-top-width", (i == 0 ? "2px" : "0px"))
			.style("border-radius", "5px")
			.style("padding", "5px")
			.style("overflow", "auto");
		entry.append("xhtaml:div")
			.text(i + ": " + content[i])
			.style("float", "left");
		entry.append("xhtaml:div")
			.text("(" + declaredTargets[i] + ")")
			.style("float", "right")
			.style("color", "#b0b0b0");
	}
}

/*
returns the node instance to a given id

id: id of the searched node
sourceNode: node instance to start the search on

returns: node instance
*/
function getNodeById(id, sourceNode){
	if(sourceNode.getID() == id){
		return sourceNode;
	}
	var result;
	sourceNode.getChildNodes().forEach(function(element){
		if(getNodeById(id, element)) result = getNodeById(id, element);
	});
	return result;
}
