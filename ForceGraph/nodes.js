
/**
 * 
 */
class node{
	/**
	 * 
	 * @param {string} nodeID - id of this node
	 * @param {string[]} parentIDs - id of the parent node
	 * @param {HTML svg object} container - svg
	 * @param {string} nameVal - name of the method name
	 * @param {string[]} contentVal - string array with the name of the targets
	 * @param {string} declaringClass - dclaring Class of the mehtod
	 * @param {string[]} parameterTypes - string array with the types of the parameters
	 * @param {string} returnType - name of the returnType
	 */
	constructor(nodeID, parentID, container, nameVal, contentVal, declaringClass, parameterTypes, returnType){
		// Only if this is the root node, this node is placed right now. Otherwise it is placed by setPosition(x, y).
		// Also generation is set to 0
		if(parentID == '-1'){
			var width = 300;
			var height = 108 + 27 * contentVal.length;	// node-width, node-hight, and content-height are still hard coded
			
			this.x = container.attr("width")/2 - width/2;
			this.y = container.attr("height")/2 - height/2;
			
			this.generation = 0;
			this.rootNode = this;
		}
		this.nodeID = nodeID;
		this.parentIDs = [parentID];
		this.container = container;
		this.name = nameVal;
		this.content = contentVal;
		this.declaringClass = declaringClass;
		this.parameterTypes = parameterTypes;
		this.returnType = returnType;
		this.children = []; //targets
		this.declaredTargets = [];
		var length = contentVal.length;
		while(length-- > 0) this.declaredTargets.push(0);	// declaredTargets holds the number of child nodes to a given content element
		this.visible = null;
		this.visibleParentNodes = 0;
	}
	
	/*
	sets the x and y values of this node
	
	x: new x-value
	y: new y-value
	
	returns: void
	*/
	setPosition(x, y){
		var width = 300;
		var height = 108 + 27 * this.content.length;
		
		this.x = x - width/2;
		this.y = y - height/2;
	}
	
	/*
	adds a child node to the current node
	
	nodeID: id of the child node
	source: index of contentVal of parentNode
	nameVal: child's title
	contentVal: child's list of methods
	
	returns: created instance of the node
	*/
	addChild(nodeID, source, nameVal, contentVal, declaringClass, parameterTypes, returnType){
		var parentID = this.nodeID + "#" + source;
		var child = getNodeByName(nameVal, this.rootNode);
		var alreadyExisting = true;
		if(!child){
			child = new node(nodeID, parentID, this.container, nameVal, contentVal, declaringClass, parameterTypes, returnType);
		}
		else child.addParent(parentID);
		child.setRootNode(this.rootNode);
		child.setGeneration(this.generation + 1);
		this.children.push([child, source]);
		this.declaredTargets[source]++;
		this.reloadContent();
		return this.children[this.children.length-1][0];
	}
	
	/*
	plottes all child nodes of a single called method and an edge to them
	
	index: method index in cententVal
	
	returns: void
	*/
	showChildNodes(index){
		for(var i = 0; i < this.children.length; i++){
			if(this.children[i][1] == index){
				if(this.children[i][0].getVisibility() == null){
					this.placeChildNodes(index);
					break;
				}
			}
		}
		for(var i = 0; i < this.children.length; i++){
			if(this.children[i][1] == index){
				this.children[i][0].showNode();
				var parentID = this.nodeID + '#' + this.children[i][1];
				var edge = document.getElementById(parentID + '->' + this.children[i][0].getID());
				if(!edge){
					method2nodeEdge(parentID, this.children[i][0].getID());
					this.children[i][0].setVisibleParentNodes(this.children[i][0].getVisibleParentNodes() + 1);
				}
				else if(edge.style.display != 'block'){
					this.children[i][0].setVisibleParentNodes(this.children[i][0].getVisibleParentNodes() + 1);
					edge.style.display = "block";
				}
				edge = document.getElementById(parentID + '->' + this.children[i][0].getID());
			}
		}
	}
	
	/*
	sets x and y values of all child nodes to a given content index but doesn't show these nodes yet
	*/
	placeChildNodes(index){
		var childArray = [];
		var idArray = [];
		for(var i = 0; i < this.children.length; i++){
			var childIndex = this.children[i][1];
			if(childIndex == index && !this.children[i][0].getVisibility()){
				childArray.push(this.children[i]);
				idArray.push(this.children[i][0].getID());
			}
		}
		var positions = addNodeToForceTree(this.nodeID, idArray);
		
		for(var i = 0; i < childArray.length; i++){
			childArray[i][0].setPosition(positions[i].x, positions[i].y);
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
			for(var i = 0; i < this.children.length; i++){
				if(this.children[i][0].getVisibleParentNodes() == 1) this.children[i][0].hideNode();
				else if(this.children[i][0].getVisibleParentNodes() > 1){
					var edge = document.getElementById(this.nodeID + '#' + this.children[i][1] + '->' + this.children[i][0].getID());
					edge.style.display = 'none';
					this.children[i][0].setVisibleParentNodes(this.children[i][0].getVisibleParentNodes() - 1);
				}
			}
			for(var i = 0; i < this.parentIDs.length; i++){
				if(parseInt(this.parentIDs[i]) >= 0){
					var node = document.getElementById(this.nodeID);
					var edge = document.getElementById(this.parentIDs[i] + '->' + this.nodeID);
					node.style.display = "none";
					edge.style.display = "none";
				}
			}
			this.visible = false;
			if(this.visibleParentNodes >= 1) this.visibleParentNodes = 0;
		}
	}
	
	/**
	 * add a parentID to the parentID array
	 *
	 * @param {string} parentID - new parent id
	 */
	addParent(parentID){
		this.parentIDs.push(parentID);
	}
	
	/**
	 * updates generation if new generation is smaller then current one
	 *
	 * @param {number} newGen - new possible generation value
	 */
	setGeneration(newGen){
		if(this.generation == undefined || this.generation > newGen) this.generation = newGen;
	}
	
	/**
	 * sets this root node
	 *
	 * @param {node object} rootNode - new root node
	 */
	setRootNode(rootNode){
		this.rootNode = rootNode;
	}
	
	/**
	 * @returns {number} - generation = shortest path to root node
	 */
	getGeneration(){ return this.generation; }
	
	// returns the id of this node
	getID(){ return this.nodeID; }
	
	// return the parentID of this node
	getParentIDs(){ return this.parentIDs; } // ++++++++++++++++++++++++++++++++++++++++++++ TODO: alle dependencies zu getParentID() anpassen ++++++++++++++++++++++++++++++++++++++++
	
	/**
	 * @returns {number} - generation = shortest path to root node
	 */
	getName(){ return this.name; }
	
	// returns the array of children of this node
	getChildNodes(){ return this.children; }
	
	// returns visibility of this node
	getVisibility(){ return this.visible; }

	/**
	 * @returns {string} - declaring class of the method
	 */
	getDeclaringClass(){ return this.declaringClass; }

	/**
	 * @returns {string[]} - string array with the types of the parameters
	 */
	getParameterTypes(){ return this.parameterTypes; }

	// returns the returnType of this node
	getReturnType(){ return this.returnType; }
	
	/**
	 * @returns {number} - number of visible parent nodes
	 */
	getVisibleParentNodes(){ return this.visibleParentNodes; }
	
	/**
	 * sets visibleParentNodes of this node
	 *
	 * @param {number} - new number of visible parent nodes
	 */
	setVisibleParentNodes(number){ this.visibleParentNodes = number; }
	
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
function getNodeById(id, sourceNode){ // circle beheben
	if(sourceNode.getID() == id){
		return sourceNode;
	}
	var result;
	sourceNode.getChildNodes().forEach(function(element){
		if(getNodeById(id, element[0])) result = getNodeById(id, element[0]);
	});
	return result;
}

/**
 * returns the node instance to a given name
 * 
 * @param {string} name - name of the searched node
 * @param {node object} sourceNode - node instance to start the search on
 *
 * @returns {node object} - node instance with the given name
 */
function getNodeByName(name, sourceNode){ // circle beheben
	if(sourceNode.getName() == name){
		return sourceNode;
	}
	var result;
	sourceNode.getChildNodes().forEach(function(element){
		if(getNodeByName(name, element[0])) result = getNodeByName(name, element[0]);
	});
	return result;
}
