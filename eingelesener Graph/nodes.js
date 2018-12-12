
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
		this.visible = null;
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
	plottes all child nodes of a single called method and an edge to them
	
	index: method index in cententVal
	
	returns: void
	*/
	showChildNodes(index){
		for(var i = 0; i < this.children.length; i++){
			var childIndex = this.children[i].getParentID().split('#')[1];
			if(childIndex == index){
				this.children[i].showNode();
				var edgeID = this.children[i].getParentID() + '->' + this.children[i].getID();
				if(!document.getElementById(edgeID)) method2nodeEdge(this.children[i].getParentID(), this.children[i].getID());
				else document.getElementById(edgeID).style.display = "block";
			}
		}
	}
	
	/*
	plottes this node
	
	return: void
	*/
	showNode(){
		if(this.visible != null){
			document.getElementById(this.nodeID).style.display = "block";
		}
		else createSingleNode(this.nodeID, this.container, this.x, this.y, this.name, this.content, this.declaredTargets);
		this.visible = true;
	}
	
	/*
	sets all the child nodes, this node and the edge to this node (if it exists) to invisible
	
	returns: void
	*/
	hideNode(){
		if(this.visible != null){
			this.children.forEach(function (elem){elem.hideNode()});
			if(parseInt(this.parentID) >= 0){
				var node = document.getElementById(this.nodeID);
				var edge = document.getElementById(this.parentID + '->' + this.nodeID);
				node.style.display = "none";
				edge.style.display = "none";
			}
			this.visible = false
		}
	}
	
	// returns the id of this node
	getID(){ return this.nodeID; }
	
	// return the parentID of this node
	getParentID(){ return this.parentID; }
	
	// returns the array of children of this node
	getChildNodes(){ return this.children; }
	
	// returns visibility of this node
	getVisibility(){ return this.visible; }
	
	// reloads all call site numbers of this node
	reloadContent(){
		if(this.visible){
			var methodDivs = document.getElementById(this.nodeID).childNodes[1].childNodes;
			for(var i = 0; i < methodDivs.length; i++){
				var text = methodDivs[i].childNodes[1].textContent = "(" + this.declaredTargets[i] + ")";
			}
		}
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
			.style("width", "300px")
			.style("padding", "20px")
			.style("border-width", "5px") // sizes must stay in js-file for later calculations
						
	node.append("xhtml:h3")
		.text(name)
		.style("text-align", "center");
		
	node = node.append("xhtml:div")
				.attr("class","node_inhalt");
	
	for(var i=0; i < content.length; i++){
		var entry = node.append("xhtml:button")
			.attr("id", nodeID + "#" + i)
			.attr("class", "methodButton")
			.on("click", function(){
				index = this.getAttribute("id").split('#')[1];
				getNodeById(nodeID, testNode).showChildNodes(index); })
			.style("width", "100%")
			.style("border-width", "2px")
			.style("border-top-width", (i == 0 ? "2px" : "0px"))
			.style("border-radius", "5px")
			.style("padding", "5px")
		entry.append("xhtaml:div")
			.text(i + ": " + content[i])
			.style("float", "left");
		entry.append("xhtaml:div")
			.text("(" + declaredTargets[i] + ")")
			.style("float", "right")
			.style("color", "#b0b0b0");
	}
	
	//on rightclick in this node calls rightclickmenu and deactivates normal contextmenu
	$("#" + nodeID).contextmenu(function(e) {
	console.log("Hallo");
	console.log(this);
    if(menuIsOpen){
        $("#main-rightclick").remove();
        menuIsOpen = false;
    }
    clickedDiv = this;
    rightclickmenu(e);
    return false;
});
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
