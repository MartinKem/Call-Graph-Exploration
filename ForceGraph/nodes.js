
//---------------------------------------------------------------------------------------
//----------------------------------- model section -------------------------------------
//---------------------------------------------------------------------------------------

/**
 * models the methods as nodes in a directed graph
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
			this.parentIDs = [];	// parentIDs must be set to [], to potentially allow methods call the root node
		}
		else{
			this.parentIDs = [parentID];
		}
		this.nodeID = nodeID;
		this.container = container;
		this.name = nameVal;
		this.content = contentVal;
		this.declaringClass = declaringClass;
		this.parameterTypes = parameterTypes;
		this.returnType = returnType;
		this.children = [];		// target nodes
		this.declaredTargets = [];
		var length = contentVal.length;
		while(length-- > 0) this.declaredTargets.push(0);	// declaredTargets holds the number of child nodes to a given content element
		this.visible = null;	// this.visible == null: node has never been placed or displayed;
								// this.visible == false: this node has valid x- and y-values, but is currently invisible
								// this.visible == true: node has valid x- and y-values and is currently displayed
		this.visibleParentNodes = 0;	// visible parent-nodes must be counted, because if one parent-node becomes hidden, this node must still be shown,
										// if there exists another visible parent-node
	}
	
	/**
	 * sets the x and y values of this node
	 *
	 * @param {number} x - new x-value
	 * @param {number} y - new y-value
	 */
	setPosition(x, y){
		var width = 300;
		var height = 108 + 27 * this.content.length;
		
		this.x = x - width/2;
		this.y = y - height/2;
	}
	
	/**
	 * adds a child node to the current node where parentID and container are given by this node
	 * this node also sets the child's rootNode, it's generation and updates his own children and declaredTargets
	 *
	 * @param {string} nodeID - id of the child node
	 * @param {number} source - index of contentVal of parentNode
	 * @param {string} nameVal - child's title
	 * @param {string[]} contentVal - string array with the name of the targets
	 * @param {string} declaringClass - dclaring class of the mehtod
	 * @param {string[]} parameterTypes - string array with the types of the parameters
	 * @param {string} returnType - name of the returnType
	 *
	 * @returns {node object} - child node instance
	 */
	addChild(nodeID, source, nameVal, contentVal, declaringClass, parameterTypes, returnType){
		var parentID = this.nodeID + "#" + source;
		var child = getNodeByName(nameVal, this.rootNode);
		var alreadyExisting = true;
		if(!child){		// new node-instance is only created, if it didn't exist yet
			child = new node(nodeID, parentID, this.container, nameVal, contentVal, declaringClass, parameterTypes, returnType);
		}
		else child.addParent(parentID);		// if the child-node already existed, it just adds this as new parent
		child.setRootNode(this.rootNode);
		child.setGeneration(this.generation + 1);
		this.children.push([child, source]);
		this.declaredTargets[source]++;
		this.reloadContent();
		return this.children[this.children.length-1][0];
	}
	
	/**
	 * shows all child nodes of a single call site and displays an edge to them
	 *
	 * @param {number} index - index of the content array
	 */
	showChildNodes(index){
		// if there exists a child-node with the given source index, the has never been placed, it must be placed with respect on the existing force tree
		for(var i = 0; i < this.children.length; i++){
			if(this.children[i][1] == index){
				if(this.children[i][0].getVisibility() == null){ // if true, child-node has never been placed
					this.placeChildNodes(index);
					break;
				}
			}
		}
		// all child-nodes must be displayed right now
		for(var i = 0; i < this.children.length; i++){
			if(this.children[i][1] == index){
				this.children[i][0].showNode();
				var parentID = this.nodeID + '#' + this.children[i][1];
				var edge = document.getElementById(parentID + '->' + this.children[i][0].getID());
				if(!edge){	// if child-node hasen't been placed before, a new edge must be created
					method2nodeEdge(parentID, this.children[i][0].getID());
					this.children[i][0].setVisibleParentNodes(this.children[i][0].getVisibleParentNodes() + 1);	// visibleParents of child-node must be incremented
				}
				else if(edge.style.display != 'block'){		// if child-node has already been placed, the affected edge is just turned on visible
					this.children[i][0].setVisibleParentNodes(this.children[i][0].getVisibleParentNodes() + 1);	// visibleParents of child-node must be incremented
					edge.style.display = "block";
				}
			}
		}
	}

	/**
	 * sets x and y values of all child nodes to a given call site index, but doesn't show these nodes yet
	 *
	 * @param {number} index - index of the content array
	 */
	placeChildNodes(index){
		var childArray = [];
		var idArray = [];	// first an array with all the child-ids is created
		for(var i = 0; i < this.children.length; i++){
			var childIndex = this.children[i][1];
			if(childIndex == index && !this.children[i][0].getVisibility()){
				childArray.push(this.children[i]);
				idArray.push(this.children[i][0].getID());
			}
		}
		var positions = addNodeToForceTree(this.nodeID, idArray);	// this function from the ForceTree.js file axtends for each node in
																	// the idArray the invisible force graph and returns their positions
		
		for(var i = 0; i < childArray.length; i++){		// in the end the affected child-nodes are placed at the calculated positions
			childArray[i][0].setPosition(positions[i].x, positions[i].y);
		}
	}
	
	/**
	 * displays this node
	 */
	showNode(){
		if(this.visible != null){	// just changes the css-display property if the node was already placed before
			document.getElementById(this.nodeID).style.display = "block";
		}
		else createSingleNode(this.nodeID, this.container, this.x, this.y, this.name, this.content, this.declaredTargets);	// creates a new node otherwise
		this.visible = true;
	}
	
	/**
	 * hides this node, if it was already displayed before
	 * also hides all child-nodes of this node, if they don't have another visible parent
	 */
	hideNode(){
		if(this.visible != null){
			for(var i = 0; i < this.parentIDs.length; i++){		// first all edges to this node become hidden
				var edge = document.getElementById(this.parentIDs[i] + '->' + this.nodeID);
				edge.style.display = "none";
			}
			
			var node = document.getElementById(this.nodeID);	// now this node itself becomes hidden
			node.style.display = "none";
			this.visible = false;
			this.visibleParentNodes = 0;	// visibleParentNodes is set to 0 because there is no node anymore with an edge to this node
			
			for(var i = 0; i < this.children.length; i++){
				if(this.children[i][0].getVisibleParentNodes() == 1) this.children[i][0].hideNode();	// if this was the last visible parent-node
																										// of a child-node, the child-node becomes hidden
				else if(this.children[i][0].getVisibleParentNodes() > 1){	// otherwise only the edge to the child-node becomes hidden and visibleParentNodes of the child is decremented
					var edge = document.getElementById(this.nodeID + '#' + this.children[i][1] + '->' + this.children[i][0].getID());
					edge.style.display = 'none';
					this.children[i][0].setVisibleParentNodes(this.children[i][0].getVisibleParentNodes() - 1);
				}
			}
			this.rootNode.showNode();	// the root-node shall always be visible
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
	
	/**
	 * @returns {string} - node-id
	 */
	getID(){ return this.nodeID; }
	
	/**
	 * @returns {string[]} - array of parent-ids
	 */
	getParentIDs(){ return this.parentIDs; }
	
	/**
	 * @returns {number} - generation = shortest path to root node
	 */
	getName(){ return this.name; }
	
	/**
	 * @returns {node_object[]} - array of node-instances of the child-nodes
	 */
	getChildNodes(){ return this.children; }
	
	/**
	 * @returns {boolean or null} - null: node has never been placed or displayed; 
	 * 								false: this node has valid x- and y-values, but is currently invisible;
	 *								true: node has valid x- and y-values and is currently displayed
	 */
	getVisibility(){ return this.visible; }

	/**
	 * @returns {string} - declaring class of the method
	 */
	getDeclaringClass(){ return this.declaringClass; }

	/**
	 * @returns {string[]} - string array with the types of the parameters
	 */
	getParameterTypes(){ return this.parameterTypes; }

	/**
	 * @returns {string} - name of the returnType
	 */
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
	
	/**
	 * reloads all call site numbers of this node
	 */
	reloadContent(){
		if(this.visible){
			var methodDivs = document.getElementById(this.nodeID).childNodes[1].childNodes;
			for(var i = 0; i < methodDivs.length; i++){
				var text = methodDivs[i].childNodes[1].textContent = "(" + this.declaredTargets[i] + ")";
			}
		}
	}
}

//---------------------------------------------------------------------------------------
//------------------------------- view/control section ----------------------------------
//---------------------------------------------------------------------------------------

/**
 * plottes a single node with some given attributes
 *
 * @param {string} nodeID - HTML-id of the node-div
 * @param {SVG-foreignObject element} cont - foreignObject-container
 * @param {number} x - left distance
 * @param {number} y - top distance
 * @param {string} name - node title
 * @param {string[]} content - array of call sites
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
				var node = getNodeById(nodeID, testNode);
				node.showChildNodes(index); })
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

/**
 * returns the node instance to a given id
 * 
 * @param {string} id - id of the searched node
 * @param {node object} sourceNode - node instance to start the search on
 *
 * @returns {node object} - node instance with the given id
 */
function getNodeById(id, sourceNode){
	if(sourceNode.getID() == id){
		return sourceNode;
	}
	var result = false;
	for(var i = 0; i < sourceNode.getChildNodes().length; i++){
		if(sourceNode.getGeneration() < sourceNode.getChildNodes()[i][0].getGeneration() && getNodeById(id, sourceNode.getChildNodes()[i][0])){
			result = getNodeById(id, sourceNode.getChildNodes()[i][0]);
		}
	}
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
function getNodeByName(name, sourceNode){
	if(sourceNode.getName() == name){
		return sourceNode;
	}
	var result;
	sourceNode.getChildNodes().forEach(function(element){
		if(sourceNode.getGeneration() < element[0].getGeneration() && getNodeByName(name, element[0])) result = getNodeByName(name, element[0]);
	});
	return result;
}
