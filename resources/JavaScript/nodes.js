/**
* (only for testing)
* IMPORT:
* *******
*/
if (typeof module !== 'undefined') {
    var index = require("./index");
	var createdNodes = index.createdNodes;
	var svgCont = index.svgCont;
	var defsCont = index.defsCont;
	var rootNodeString = index.rootNodeString;
	var rootNodes = index.rootNodes;
	var nodeMap = index.nodeMap;
	var open_close = index.open_close;
    var i = index.i;
    var d3 = index.d3;

    var refresh = require("./refresh");
    var createdEdges = refresh.createdEdges;
    var currentNodes = refresh.currentNodes;
    var currentEdges = refresh.currentEdges;
    var refreshGraphData = refresh.refreshGraphData;
    var estGraphData = refresh.estGraphData;

    var forceTree = require("./forceTree");
    var addNodeToForceTree = forceTree.addNodeToForceTree;

    var edges = require("./edges");
    var method2nodeEdge = edges.method2nodeEdge;
}


//---------------------------------------------------------------------------------------
//----------------------------------- model section -------------------------------------
//---------------------------------------------------------------------------------------
let container = svgCont;
const nodeWidth = 400;
const nodeHeightEmpty = 144;
const callSiteWidth = nodeWidth-53;
const callSiteHeight = 27;
const callSiteTopOffset = 120;

/**
 * models the methods as nodes in a directed graph
 */
class node{
    /**
     *
     * @param {{node: node, index: number}} parent - parent-node, callsite-index of parent-node
     * @param {string} nameVal - name of the method name
     * @param {string[]} contentVal - string array with the name of the targets
     * @param {{numberOfTargets: number, line: number}[]} callSiteStats - holds for each callsite to number of targets and the line, where the site is called
     * @param {string[]} parameterTypes - string array with the types of the parameters
     * @param {string} returnType - name of the returnType
     */
    constructor(parent, data, callSites, callSiteStats){
        this.parents = [];
        this.nodeData = data;
        this.callSites = callSites;
        if(parent) this.parents.push(parent);
        this.children = [];		// target nodes
        this.callSiteStats = callSiteStats;
        this.detailed = true;
        this.visible = null;	// this.visible == null: node has never been placed or displayed;
                                // this.visible == false: this node has valid x- and y-values, but is currently invisible
                                // this.visible == true: node has valid x- and y-values and is currently displayed

        // this is only for logging
        createdNodes++;
        if(createdNodes % 1000 == 0) console.log(createdNodes + " nodes created");
    }

    /**
     * sets the x and y values of this node
     *
     * @param {number} x - new x-value
     * @param {number} y - new y-value
     */
    setPosition(x, y){
        // var width = 300;
        // var height = 108 + 27 * this.content.length;
        //
        // this.x = x - width/2;
        // this.y = y - height/2;
        this.x = x;
        this.y = y;
    }

    /**
     * adds a child node to the current node where parent and container are given by this node
     * this node also updates its own children and callSiteStats
     *
     * @param {number} index - call-site-index-index of parent-node
     * @param {string} nameVal - child's title
     * @param {string[]} contentVal - string array with the name of the targets
     * @param {{numberOfTargets: number, line: number}[]} callSiteStats - holds an array with the number of targets and the line number for each call site
     * @param {string[]} parameterTypes - string array with the types of the parameters
     * @param {string} returnType - name of the returnType
     *
     * @returns {node} - child node instance
     */
    addChild(index, nodeData, callSites, callSiteStats){
        for(var i = 0; i < this.children.length; i++){	// child-node may only be created, if there doesn't exist a child with the given name yet
            if(this.children[i].node.getName() == nameVal) return;
        }
        if(index == null) console.log("null:", nameVal);

        let child = nodeMap.get(idString(nodeData));

        if(!child){		// new node-instance is only created, if it didn't exist yet
            child = new node({node: this, index: index}, data, callSites, callSiteStats);
        }
        else child.addParent(this, index);		// if the child-node already existed, it just adds this as new parent
        this.children.push({node: child, index: index});
		estGraphData();
        this.reloadContent();
        return this.children[this.children.length-1].node;
    }

    /**
     * shows all child nodes of a single call site and displays an edge to them
     *
     * @param {number} index - index of the content array
     */
    showChildNodes(index){
        // if there exists a child-node with the given source index, the has never been placed, it must be placed with respect on the existing force tree
        for(var i = 0; i < this.children.length; i++){
            if(this.children[i].index == index){
                if(this.children[i].node.getVisibility() == null){ // if null, child-node has never been placed
                    this.placeChildNodes(index);
                    break;  // we break here, because the place-function places all child-nodes for the given index
                }
            }
        }
        // all child-nodes must be displayed right now
        for(var i = 0; i < this.children.length; i++){
            if(this.children[i].index == index){
				//only call showNode if node is not already visible
				if(!this.children[i].node.visible){
					this.children[i].node.showNode();
				}
            }
        }
        this.reloadEdges("showChildNodes", index);
		
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
            var childIndex = this.children[i].index;
            if(childIndex == index && !this.children[i].node.getVisibility()){
                childArray.push(this.children[i]);
                idArray.push(this.children[i].node.getName());
            }
        }
        var positions = addNodeToForceTree(this.name, idArray);	// this function from the ForceTree.js file axtends for each node in
        // the idArray the invisible force graph and returns their positions

        for(var i = 0; i < childArray.length; i++){		// in the end the affected child-nodes are placed at the calculated positions
            let centerX = positions[i].x - nodeWidth/2;
            let centerY = positions[i].y - (nodeHeightEmpty + callSiteHeight*childArray[i].node.getContent().length)/2;
            childArray[i].node.setPosition(centerX, centerY);
            childArray[i].node.setForceNodeIndex(positions[i].index);
        }
    }

    /**
     * places this node in the center of the svg container, but takes care of existing nodes
     */
    placeCentrally(){
        let position = addNodeToForceTree(this.name);
        this.x = position.x - nodeWidth/2;
        this.y = position.y - (nodeHeightEmpty + callSiteHeight*this.content.length)/2;
        this.forceNodeIndex = position.index;
    }

    /**
     * displays this node
     */
    showNode(){
        if(this.visible != null){	// just changes the css-display property if the node was already placed before
            document.getElementById(this.name).style.display = "block";
        }
        else createSingleNode(this.x, this.y, this.name, this.content, this.callSiteStats);	// creates a new node otherwise
        this.visible = true;
		// updates the graph data with new number of shown nodes
		currentNodes++;
		refreshGraphData();
    }



    /**
     * hides this node, if it was already displayed before
     * also hides all child-nodes of this node, if they don't have another visible parent
     */
    hideNode(){
        if(this.visible === true){

            let node = document.getElementById(this.name);	// now this node itself becomes hidden
            node.style.display = "none";
            this.visible = false;
			//updates number of current shown nodes and edges
			currentNodes--;
			refreshGraphData();
            // this.visibleParentNodes = 0;	// visibleParentNodes is set to 0 because there is no node anymore with an edge to this node
            for(var i = 0; i < this.children.length; i++){
                let edgeID = this.name + '#' + this.children[i].index + '->' + this.children[i].node.getName();
                let edge = document.getElementById(edgeID);
                if(edge != undefined
                    && edge.style.display == 'block'
                    && this.children[i].node.getName() !== this.name){
						this.children[i].node.hideNode();
						//updates number of current shown nodes
					}
            }
        }
        this.reloadEdges("hideNode", null);
		//updates the graph data with new number of shown nodes
    }

    /**
     * repositions all in- and outgoing edges of this node.
     * if in "showChildNodes"-mode, only handles outgoing edges for a given call-site-index
     *
     * @param{string} mode - declares which and how edges shall be reloaded
     * @param{number} callSiteIndex - function will only outgoing edges of the given call site
     */
    reloadEdges(mode, callSiteIndex){
        let thisNode = this;
        this.children.forEach(function(child){
            let edgeID = thisNode.name + '#' + child.index + '->' + child.node.getName();
            if(mode !== "showChildNodes" || callSiteIndex == child.index){  // if mode is "showChildNodes", the child must have the correct call-site-index
                handleSingleEdge(edgeID, thisNode, child.node, child.index, mode);
				
            }
        });

        if(mode !== "showChildNodes"){  // if mode is "showChildNodes" parent nodes are not affected
            this.parents.forEach(function(parent){
                // if edges shall just change their positions, it is necessary to adapt the mode to the parent's current detailed value
                if(mode === "toDetailed" || mode === "toAbstract"){ mode = parent.node.getDetailed() ? "toDetailed" : "toAbstract"}
                let edgeID = parent.node.getName() + '#' + parent.index + '->' + thisNode.name;
                handleSingleEdge(edgeID, parent.node, thisNode, parent.index, mode);
            });
        }

        /**
         * handles a single edge for reloadEdges()
         *
         * @param{string} edgeID - id of the affected edge
         * @param{node} parentNode - start of the edge
         * @param{node} childNode - destination of the edge
         * @param{number} index - child's call-site-index
         * @param{string} mode - declares how the edge shall be manipulated
         */
        function handleSingleEdge(edgeID, parentNode, childNode, index, mode){
            let edge = document.getElementById(edgeID);

            if(mode === "showChildNodes"){
                //  a new edge is only created, if it didn't exist yet
                if(!edge){
                    method2nodeEdge(edgeID.split('->')[0], edgeID.split('->')[1]);
                    toggleToDetailed(edgeID, {source: divPosition(parentNode, index), dest: divPosition(childNode)});
                    edge = document.getElementById(edgeID);
					currentEdges++;   //updating Graph stats
					refreshGraphData();
                }
				if(edge.style.display !== "block"){ 		//updating Graph stats
					currentEdges++;
					refreshGraphData();
				}
				edge.style.display = 'block';
            }
            else if(mode === "hideNode"){
                if(edge){
					if(edge.style.display !== "none"){
						currentEdges--;
						refreshGraphData();
					}
					edge.style.display = 'none';
				}
            }
            else if(mode === "toDetailed"){
                if(edge){
                    toggleToDetailed(edgeID, {source: divPosition(parentNode, index), dest: divPosition(childNode)});
                }
            }
            else if(mode === "toAbstract"){
                if(edge){
                    toggleToAbstract(edgeID, {source: divPosition(parentNode), dest: divPosition(childNode)});
                }
            }

        }

        /**
         * calculates the sizes of a given div, which can be a whole node or just a single call site
         *
         * @param{node} node - node instance, that represents the div
         * @param{number} index - call-site-index
         * @returns {{x: number, width: number, y: number, height: number}} sizes of the given div
         */
        function divPosition(node, index){
            if(index === undefined){    // if undefined the sizes of the whole node shall be returned
                let height = nodeHeightEmpty;
                // height variates, if node is currently in detailed mode or not
                if(node.getDetailed()) height += callSiteHeight*node.getContent().length;
                return {x: node.x, y: node.y, width: nodeWidth, height: height};
            }
            else{   // in else block, the size of a single call site shall be returned
                return {x: node.x + (nodeWidth-callSiteWidth)/2,
                            y: node.y + callSiteTopOffset + callSiteHeight*index,
                            width: callSiteWidth,
                            height: callSiteHeight};
            }
        }
    }

    /**
     * toggles this detailed-attribute to true and reloads this node's edges
     */
    toggleToDetailed(){
        this.detailed = true;
        this.reloadEdges("toDetailed", null);
    }

    /**
     * toggles this detailed attribute to false and reloads this node's edges
     */
    toggleToAbstract(){
        this.detailed = false;
        this.reloadEdges("toAbstract", null);
    }

    /**
     * uses toggleToDetailed() for this and all child nodes
     */
    allToDetailed(){
        this.toggleToDetailed();
        this.children.forEach(function(child){
            if(!child.node.getDetailed()) child.node.allToDetailed();
        });
    }

    /**
     * uses toggleToAbstract() for this and all child nodes
     */
    allToAbstract(){
        this.toggleToAbstract();
        this.children.forEach(function(child){
            if(!child.node.getDetailed()) child.node.allToAbstract();
        });
    }

    /**
     * add a parent to the parent-array
     *
     * @param {node} parent - new parent
     * @param {number} index - call-site-index
     */
    addParent(parent, index){
        this.parents.push({node: parent, index: index});
    }

    /**
     * @returns {number} - this nodes's x position
     */
    getX(){ return this.x; }

    /**
     * @returns {number} - this nodes's y position
     */
    getY(){ return this.y; }

    /**
     * @param {number} index - array index of the corresponding node in the force-graph
     */
    setForceNodeIndex(index){ this.forceNodeIndex = index; }

    /**
     * @returns {number} - array index of the corresponding node in the force-graph
     */
    getForceNodeIndex(){ return this.forceNodeIndex; }

    /**
     * @returns {[node, number][]} - array of [parent, call-site-index]
     */
    getParents(){ return this.parents; }

    /**
     * @returns {string[]} - call sites
     */
    getContent(){ return this.content; }

    /**
     * @returns {node[]} - array of node-instances of the child-nodes
     */
    getChildNodes(){ return this.children; }

    /**
     * @returns {boolean or null} - null: node has never been placed or displayed;
     * 								false: this node has valid x- and y-values, but is currently invisible;
     *								true: node has valid x- and y-values and is currently displayed
     */
    getVisibility(){ return this.visible; }

    /**
     * @returns {boolean} - true if this node is currently showing call sites
     */
    getDetailed(){ return this.detailed; }

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
    // getVisibleParentNodes(){ return this.visibleParentNodes; }

    /**
     * sets visibleParentNodes of this node
     *
     * @param {number} - new number of visible parent nodes
     */
    // setVisibleParentNodes(number){ this.visibleParentNodes = number; }

    /**
     * reloads all call site numbers of this node
     */
    reloadContent(){
        if(this.visible){
            var methodDivs = document.getElementById(this.name).childNodes[2].childNodes;
            for(var i = 0; i < methodDivs.length; i++){
                methodDivs[i].childNodes[1].textContent = "(" + this.callSiteStats[i].numberOfTargets + ")";
            }
        }
    }

    /**
     * sets scrollbar that this node is in the center of the display
     */
    focus(){
        let xCenter = this.x + nodeWidth/2;
        let yCenter = this.y + (nodeHeightEmpty + callSiteHeight*this.content.length)/2;
        document.getElementsByTagName('html')[0].scrollLeft = parseInt(xCenter - window.innerWidth/2);
        document.getElementsByTagName('html')[0].scrollTop = parseInt(yCenter - window.innerHeight/2);
    }
}

//---------------------------------------------------------------------------------------
//------------------------------- view/control section ----------------------------------
//---------------------------------------------------------------------------------------

/**
 * plots a single node with some given attributes
 *
 * @param {SVG-foreignObject element} cont - foreignObject-container
 * @param {number} x - left distance
 * @param {number} y - top distance
 * @param {string} name - node title
 * @param {string[]} content - array of call sites
 * @param {{numberOfTargets: number, line: number}} callSiteStats - some information about each call-site
 */
function createSingleNode(x, y, nodeData, content, callSiteStats){

    let lock = false;

    var drag = d3.behavior.drag()
        .on("dragstart", function(){
            // closeAllContextmenus();
            if(d3.event.sourceEvent.path[0].nodeName === "BUTTON"
                || d3.event.sourceEvent.path[1].nodeName === "BUTTON") {
                lock = true;
            }
        })
        .on("dragend", function() {
            if (!lock){
                let node = nodeMap.get(this.childNodes[0].id);
                let xCenter = parseInt(node.getX()) + nodeWidth / 2;
                let yCenter = parseInt(node.getY()) + (nodeHeightEmpty + callSiteHeight * node.getContent().length) / 2;

                nodes[node.getForceNodeIndex()].x = xCenter;
                nodes[node.getForceNodeIndex()].y = yCenter;
                nodes[node.getForceNodeIndex()].px = xCenter;
                nodes[node.getForceNodeIndex()].py = yCenter;

                // nodeSelection.attr("cx", xCenter);
                // nodeSelection.attr("cy", yCenter);

                // restartForceLayouting(1);
            }

            lock = false;
        })
        .on("drag", function() {
            if(!lock){
                let newX = parseInt(this.getAttribute("x")) + parseInt(d3.event.dx);
                let newY = parseInt(this.getAttribute("y")) + parseInt(d3.event.dy);

                this.setAttribute("x", newX);
                this.setAttribute("y", newY);

                let node = nodeMap.get(this.childNodes[0].id);
                node.setPosition(newX, newY);
                node.reloadEdges(node.getDetailed() ? "toDetailed" : "toAbstract");

            }
        });

    var node = svgCont.append("foreignObject")
        .attr("x", x)
        .attr("y", y)
        .attr("width", nodeWidth)
        .call(drag)
        .append("xhtml:div")
        .attr("id", name)
        .attr("class","div_node")
        .style("width", nodeWidth + "px")
        .style("padding", "20px")
        .style("border-width", "5px");	// sizes must stay in js-file for later calculations;

    var packageStr = name.substring(0, name.lastIndexOf('/'));
    var classStr = name.substring(name.lastIndexOf('/')+1, name.indexOf('.'));
    var methodStr = name.substring(name.indexOf('.')+1, name.length);

    node.append("xhtml:h3")
        .text(packageStr)
        .style("text-align", "center")
        .style("word-wrap", "break-word");
    node.append("xhtml:h3")
        .text(classStr + "." + methodStr)
        .style("text-align", "center")
        .style("word-wrap", "break-word");

    node = node.append("xhtml:div")
        .attr("class","node_inhalt");

    for(var i=0; i < content.length; i++){
        var entry = node.append("xhtml:button")
            .attr("id", name + "#" + i)
            .attr("class", "methodButton")
            .on("click", function(){
                let index = this.getAttribute("id").split('#')[1];
                var node = nodeMap.get(idString(nodeData));
                node.showChildNodes(index); })
            .style("border-width", "2px")
            .style("border-top-width", (i === 0 ? "2px" : "0px"))
            .style("border-radius", "5px")
            .style("padding", "5px");
        entry.append("xhtml:div")
            .attr("class", "contentElem")
            .text(callSiteStats[i].line + ": " + content[i])
            .style("float", "left");
        entry.append("xhtaml:div")
            .text("(" + callSiteStats[i].numberOfTargets + ")")
            .style("float", "right")
            .style("color", "#b0b0b0");
    }

    //on rightclick in this node calls rightclickmenu and deactivates normal contextmenu
/*    $("[id='" + name + "']").contextmenu(function(e) {
        if(nodeMenuIsOpen){
            $("#contextmenuNode").remove();
            nodeMenuIsOpen = false;
        }
        clickedNode = this;
        createNodeContextmenu(e);
        return false;
    });*/
}


/**
* (only for testing)
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {
	module.exports.node = node;
}