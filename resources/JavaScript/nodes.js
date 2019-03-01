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
     * @param {{declaringClass: string, name: string, parameterTypes: string[], returnType: string}} data - signature of this node
     * @param {string[]} callSites - string array with the name of the call sites
     * @param {{numberOfTargets: number, line: number}[]} callSiteStats - holds for each callsite to number of targets and the line, where the site is called
     */
    constructor(data, callSites, callSiteStats){
        this.parents = [];
        this.nodeData = data;
        this.callSites = callSites;
        this.sizes = {x: undefined, y: undefined, width: nodeWidth, height: nodeHeightEmpty + callSiteHeight*this.callSites.length};
        this.children = [];		// target nodes
        this.callSiteStats = callSiteStats;
        this.detailed = true;
        this.visible = null;	// this.visible == null: node has never been placed or displayed;
                                // this.visible == false: this node has valid x- and y-values, but is currently invisible
                                // this.visible == true: node has valid x- and y-values and is currently displayed

        // this is only for logging
        createdNodes++;
        if(createdNodes % 1000 === 0) console.log(createdNodes + " nodes created");
    }

    /**
     * sets the x and y values of this node
     *
     * @param {number} x - new x-value
     * @param {number} y - new y-value
     */
    setPosition(x, y){
        this.sizes.x = x;
        this.sizes.y = y;
    }

    /**
     * adds a child node to the current node where parent and container are given by this node
     * this node also updates its own children and callSiteStats
     *
     * @param {{declaringClass: string, name: string, parameterTypes: string[], returnType: string}} nodeData - signature of this node
     * @param {string[]} callSites - string array with the name of the call sites
     * @param {{numberOfTargets: number, line: number}[]} callSiteStats - holds for each callsite to number of targets and the line, where the site is called
     *
     * @returns {node} - child node instance
     */
    addChild(callsiteIndex, nodeData, callSites, callSiteStats){
        for(let i = 0; i < this.children.length; i++){	// child-node may only be created, if there doesn't exist a child with the given name yet
            if(idString(this.children[i].node.getNodeData()) === idString(nodeData)) return undefined;
        }
        let child = nodeMap.get(idString(nodeData));

        if(!child){		// new node-instance is only created, if it didn't exist yet
            child = new node(nodeData, callSites, callSiteStats);
        }
        let edge = new Edge(this, child, callsiteIndex);
        child.addParent(this, callsiteIndex, edge);

        this.children.push({node: child, index: callsiteIndex, edge: edge});
		estGraphData();
        // this.reloadCallSites();
        return this.children[this.children.length-1].node;
    }

    /**
     * shows all child nodes of a single call site and displays an edge to them
     *
     * @param {number} index - index of the call-site-array
     * @param {string[] | undefined} names - only these targets shall be shown, shows all children if undefined
     */
    showChildNodes(index, names){
        let childArrayIndices = [];
        if(!names){
            for(let i = 0; i < this.children.length; i++) childArrayIndices.push(i);
        }
        else{
            for(let i = 0; i < this.children.length; i++){
                if(names.includes(idString(this.children[i].node.getNodeData()))) childArrayIndices.push(i);
            }
        }

        // if there exists a child-node with the given source index, that has never been placed, it must be placed with respect on the existing force tree
        let lock = false;
        let thisNode = this;
        childArrayIndices.forEach(function(i){
            if(thisNode.children[i].index == index && !lock){
                // console.log(i, thisNode.children[i].node.getVisibility());
                if(thisNode.children[i].node.getVisibility() == null){ // if null, child-node has never been placed
                    thisNode.placeChildNodes(index, childArrayIndices);
                    lock = true;  // we break here, because the place-function places all child-nodes for the given index
                }
            }
        });
        // all child-nodes must be displayed right now
        childArrayIndices.forEach(function(i){
            if(thisNode.children[i].index == index){
                //only call showNode if node is not already visible
                if(!thisNode.children[i].node.visible) {
                    thisNode.children[i].node.showNode();
                }
                if(thisNode.children[i].edge.visible === null){
                    thisNode.children[i].edge.create();
                }
                else if(thisNode.children[i].edge.visible === false){
                    thisNode.children[i].edge.reload();
                }
            }
        });
		
    }

    /**
     * sets x and y values of all child nodes to a given call site index, but doesn't show these nodes yet
     *
     * @param {number} index - index of the call-site-array
     */
    placeChildNodes(index, childArrayIndices){
        let childArray = [];
        let idArray = [];	// first an array with all the child-ids is created
        let thisNode = this;
        childArrayIndices.forEach(function(i){
            let childIndex = thisNode.children[i].index;
            if(childIndex == index && thisNode.children[i].node.getVisibility() == null){
                childArray.push(thisNode.children[i]);
                idArray.push(idString(thisNode.children[i].node.getNodeData()));
            }
        });
        let positions = addNodeToForceTree(idString(this.nodeData), idArray);	// this function from the ForceTree.js file extends for each node in
        // the idArray the invisible force graph and returns their positions

        for(let i = 0; i < childArray.length; i++){		// in the end the affected child-nodes are placed at the calculated positions
            let centerX = positions[i].x - nodeWidth/2;
            let centerY = positions[i].y - (nodeHeightEmpty + callSiteHeight*childArray[i].node.getCallSites().length)/2;
            childArray[i].node.setPosition(centerX, centerY);
            childArray[i].node.setForceNodeIndex(positions[i].index);
        }
    }

    /**
     * places this node in the center of the svg container, but takes care of existing nodes
     */
    placeCentrally(){
        let position = addNodeToForceTree(idString(this.nodeData));
        this.sizes.x = position.x - this.sizes.width/2;
        this.sizes.y = position.y - this.sizes.height/2;
        this.forceNodeIndex = position.index;
    }

    /**
     * displays this node
     */
    showNode(){
        placedNodesMap.set(idString(this.nodeData), this);
        if(this.visible != null){	// just changes the css-display property if the node was already placed before
            document.getElementById(idString(this.nodeData)).style.display = "block";
        }
        else createSingleNode(this.sizes.x, this.sizes.y, this.nodeData, this.callSites, this.callSiteStats);	// creates a new node otherwise
        this.visible = true;
		// updates the graph data with new number of shown nodes
		currentNodes++;
		refreshGraphData();
        resizeSVGCont(this);
    }



    /**
     * hides this node, if it was already displayed before
     * also hides all child-nodes of this node, if they don't have another visible parent
     */
    hideNode(){
        if(this.visible === true){

            let node = document.getElementById(idString(this.nodeData));	// now this node itself becomes hidden
            node.style.display = "none";
            this.visible = false;
			//updates number of current shown nodes and edges
			currentNodes--;
			refreshGraphData();
        }
        this.reloadEdges();
		//updates the graph data with new number of shown nodes
    }

    /**
     * repositions all in- and outgoing edges of this node.
     */
    reloadEdges(){
        this.children
            .filter(child => child.edge.visible !== null)
            .forEach(function(child){
            child.edge.reload();
        });
        this.parents
            .filter(parent => parent.edge.visible !== null)
            .forEach(function(parent){
            parent.edge.reload();
        });
    }

    /**
     * toggles this detailed-attribute to true and reloads this node's edges
     */
    toggleToDetailed(){
        this.detailed = true;
        this.children.forEach(function (c) {
            c.edge.reload();
        })
    }

    /**
     * toggles this detailed attribute to false and reloads this node's edges
     */
    toggleToAbstract(){
        this.detailed = false;
        this.children.forEach(function (c) {
            c.edge.reload();
        })
    }

    /**
     * add a parent to the parent-array
     *
     * @param {node} parent - new parent
     * @param {number} index - call-site-index
     * @param {edge} edge - references the edge from the parent node to this node
     */
    addParent(parent, index, edge){
        this.parents.push({node: parent, index: index, edge: edge});
    }

    /**
     * @returns {{declaringClass: string, name: string, parameterTypes: string[], returnType: string}} - all the data that identifies this single node
     */
    getNodeData(){ return this.nodeData; }

    /**
     * @returns {{x: number, y: number, width: number, height: number}} - sizes of this node
     */
    getSizes(){ return this.sizes; }

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
    getCallSites(){ return this.callSites; }

    /**
     * @returns {string[]} - call sites stats
     */
    getCallSiteStats(){ return this.callSiteStats; }

    /**
     * @returns {node[]} - array of node-instances of the child-nodes
     */
    getChildNodes(){ return this.children; }

    /**
     * @returns {boolean | null} - null: node has never been placed or displayed;
     * 								false: this node has valid x- and y-values, but is currently invisible;
     *								true: node has valid x- and y-values and is currently displayed
     */
    getVisibility(){ return this.visible; }

    /**
     * @returns {boolean} - true if this node is currently showing call sites
     */
    getDetailed(){ return this.detailed; }

    /**
     * reloads all call site numbers of this node
     */
    reloadCallSites(){
        if(this.visible){
            var methodDivs = document.getElementById(idString(this.nodeData)).childNodes[2].childNodes;
            for(var i = 0; i < methodDivs.length; i++){
                methodDivs[i].childNodes[1].textContent = "(" + this.callSiteStats[i].numberOfTargets + ")";
            }
        }
    }

    /**
     * sets scrollbar that this node is in the center of the display
     */
    focus(){
        let xCenter = this.sizes.x + this.sizes.width/2;
        let yCenter = this.sizes.y + this.sizes.height/2;
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
 * @param {number} x - left distance
 * @param {number} y - top distance
 * @param {{declaringClass: string, name: string, parameterTypes: string[], returnType: string}} nodeData - signature of this method
 * @param {string[]} callSites - string array with the name of the call sites
 * @param {{numberOfTargets: number, line: number}} callSiteStats - some information about each call-site
 */
function createSingleNode(x, y, nodeData, callSites, callSiteStats){
    let lock = false;
    let nodeHeight = nodeHeightEmpty + callSiteHeight * callSites.length;

    var drag = d3.behavior.drag()
        .on("dragstart", function(){
            if(d3.event.sourceEvent.path[0].nodeName === "BUTTON"
                || d3.event.sourceEvent.path[1].nodeName === "BUTTON"
                || d3.event.sourceEvent.which != 1) {
                lock = true;
            }
        })
        .on("dragend", function() {
            if (!lock){
                let node = nodeMap.get(this.childNodes[0].id);
                let xCenter = node.getSizes().x + node.getSizes().width / 2;
                let yCenter = node.getSizes().y + node.getSizes().height / 2;

                nodes[node.getForceNodeIndex()].x = xCenter;
                nodes[node.getForceNodeIndex()].y = yCenter;
                nodes[node.getForceNodeIndex()].px = xCenter;
                nodes[node.getForceNodeIndex()].py = yCenter;

                resizeSVGCont(node);
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

    let foreignObjectCont = svgCont.append("foreignObject")
        .attr("x", x)
        .attr("y", y)
        .call(drag);

    let node = foreignObjectCont.append("xhtml:div")
        .attr("id", idString(nodeData))
        .attr("class","div_node")
        .style("width", nodeWidth + "px")
        .style("padding", "20px")
        .style("border-width", "5px");	// sizes must stay in js-file for later calculations;

    var packageStr = nodeData.declaringClass.substring(0, nodeData.declaringClass.lastIndexOf('/'));
    var classStr = nodeData.declaringClass.substring(nodeData.declaringClass.lastIndexOf('/')+1, nodeData.declaringClass.length);
    var methodStr = nodeData.name;

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

    for(var i=0; i < callSites.length; i++){
        var entry = node.append("xhtml:button")
            .attr("id", idString(nodeData) + "#" + i)
            .attr("class", "methodButton")
            .on("click", function(){
                let index = this.getAttribute("id").split('#')[1];
                var node = nodeMap.get(idString(nodeData));
                if(node.getCallSiteStats()[index].numberOfTargets < callSiteThreshold) node.showChildNodes(index); })
            .style("border-width", "2px")
            .style("border-top-width", (i === 0 ? "2px" : "0px"))
            .style("border-radius", "5px")
            .style("padding", "5px");
        entry.append("xhtml:div")
            .attr("class", "callSite")
            .text(callSiteStats[i].line + ": " + callSites[i])
            .style("float", "left");
        entry.append("xhtaml:div")
            .text("(" + callSiteStats[i].numberOfTargets + ")")
            .style("float", "right")
            .style("color", "#b0b0b0");
    }

    foreignObjectCont
        .attr("width", foreignObjectCont[0][0].childNodes[0].offsetWidth+50)
        .attr("height", foreignObjectCont[0][0].childNodes[0].offsetHeight);
}


/**
* (only for testing)
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {
	module.exports.node = node;
}