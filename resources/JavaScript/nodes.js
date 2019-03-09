/**
* (only for testing)
* IMPORT:
* *******
*/
if (typeof module !== 'undefined') {
    //var global = require('./global');

    var index = require('./index');
    var idString = index.idString;

    var refresh = require("./refresh");
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
const nodeHeightEmpty = 247;
const callSiteWidth = nodeWidth-53;
const callSiteHeight = 27;
const callSiteTopOffset = 220;

/**
 * models the methods as nodes in a directed graph
 */
class node{
    /**
     * @param {{declaringClass: string, name: string, parameterTypes: string[], returnType: string}} data - signature of this node
     * @param {{declaredTarget: {name: string, declaringClass: string, returnType: string, parameterTypes: string},
     *          line: number,
     *          targets: {name: string, declaringClass: string, returnType: string, parameterTypes: string}[]}[]} callSites - array with callSite information
     *
     */
    constructor(data, callSites){
        this.parents = [];
        this.nodeData = data;
        this.callSites = callSites;
        this.sizes = {x: undefined, y: undefined, width: nodeWidth, height: nodeHeightEmpty + callSiteHeight*this.callSites.length};
        this.children = [];		// target nodes
        this.detailed = true;
        this.visible = null;	// this.visible == null: node has never been placed or displayed;
                                // this.visible == false: this node has valid x- and y-values, but is currently invisible
                                // this.visible == true: node has valid x- and y-values and is currently displayed

        // this is for the graph data
        generatedNodes++;
        estGraphData();
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
     * this node also updates its own children and callSites
     *
     * @param {number} callSiteIndex - index of the call site this node was called by
     * @param {{declaringClass: string, name: string, parameterTypes: string[], returnType: string}} nodeData - signature of this node
     * @param {{declaredTarget: {name: string, declaringClass: string, returnType: string, parameterTypes: string},
     *          line: number,
     *          targets: {name: string, declaringClass: string, returnType: string, parameterTypes: string}[]}[]} callSites - array with callSite information
     *
     * @returns {node} - child node instance
     */
    addChild(callSiteIndex, nodeData, callSites){
        let alreadyExisting = this.children
            .filter(child => child.index === callSiteIndex)
            .filter(child => idString(child.node.nodeData) === idString(nodeData))
            .length;
        if(alreadyExisting) return undefined;

        let child = nodeMap.get(idString(nodeData));

        if(!child){		// new node-instance is only created, if it didn't exist yet
            child = new node(nodeData, callSites);
        }

        this.children.push({node: child, index: callSiteIndex, edge: undefined});
        return this.children[this.children.length-1].node;
    }

    /**
     * shows all child nodes of a single call site and displays an edge to them
     *
     * @param {number} index - index of the call-site-array
     * @param {string[] | undefined} names - only these targets shall be shown, shows all children if undefined
     */
    showChildNodes(index, names){
        let childrenToBeShown = [];
        let thisNode = this;

        if(!names){
            this.callSites[index].targets.forEach(function(target){
                childrenToBeShown.push(target);
            });
        }
        else{
            this.callSites[index].targets
                .filter(target => names.includes(idString(target)))
                .forEach(function(target){ childrenToBeShown.push(target); });
        }

        childrenToBeShown.forEach(function(target){
            createNodeInstance(target, thisNode, index);
        });

        for(let i = 0; i < childrenToBeShown.length; i++){
            if(!nodeMap.get(childrenToBeShown[i])){
                this.placeChildNodes(index, childrenToBeShown);
                break;
            }
        }

        childrenToBeShown.forEach(function(target){
            let child = nodeMap.get(idString(target));
            let childArrayElem = getChildArrayElement(target);

            if(!child.visible) child.showNode();
            if(childArrayElem.edge === undefined){
                childArrayElem.edge = new Edge(thisNode, child, index);
                childArrayElem.edge.create();
                // child.edge = edge;
                child.addParent(thisNode, childArrayElem.index, childArrayElem.edge);
            }
            else if(childArrayElem.edge.visible === false){
                childArrayElem.edge.reload();
            }
        });

        function getChildArrayElement(target){
            for(let i = 0; i < thisNode.children.length; i++){
                if(idString(target) === idString(thisNode.children[i].node.nodeData)) return thisNode.children[i];
            }
        }
        // if(!names){
        //     for(let i = 0; i < this.children.length; i++) childArrayIndices.push(i);
        // }
        // else{
        //     for(let i = 0; i < this.children.length; i++){
        //         if(names.includes(idString(this.children[i].node.getNodeData()))) childArrayIndices.push(i);
        //     }
        // }

        // if there exists a child-node with the given source index, that has never been placed, it must be placed with respect on the existing force tree
        // let lock = false;
        // let thisNode = this;
        // childArrayIndices.forEach(function(i){
        //     if(thisNode.children[i].index == index && !lock){
        //         if(thisNode.children[i].node.getVisibility() == null){ // if null, child-node has never been placed
        //             thisNode.placeChildNodes(index, childArrayIndices);
        //             lock = true;  // we break here, because the place-function places all child-nodes for the given index
        //         }
        //     }
        // });
        // all child-nodes must be displayed right now
        // childArrayIndices.forEach(function(i){
        //     if(thisNode.children[i].index == index){
        //         //only call showNode if node is not already visible
        //         if(!thisNode.children[i].node.visible) {
        //             thisNode.children[i].node.showNode();
        //         }
        //         if(thisNode.children[i].edge === undefined){
        //             let edge = new Edge(thisNode, thisNode.children[i].node, thisNode.children[i].index);
        //             edge.create();
        //             thisNode.children[i].edge = edge;
        //             thisNode.children[i].node.addParent(thisNode, thisNode.children[i].index, edge);
        //         }
        //         else if(thisNode.children[i].edge.visible === false){
        //             thisNode.children[i].edge.reload();
        //         }
        //     }
        // });
		
    }

    /**
     * sets x and y values of all child nodes to a given call site index, but doesn't show these nodes yet
     *
     * @param {number} index - index of the call-site-array
     */
    placeChildNodes(index, childrenToBeShown){
        let childArray = [];
        let idArray = [];	// first an array with all the child-ids is created
        let thisNode = this;
        childrenToBeShown.forEach(function(target){
            let child = nodeMap.get(idString(target));
            if(child.getVisibility() == null){
                childArray.push(child);
                idArray.push(idString(target));
            }
        });
        let positions = addNodeToForceTree(idString(this.nodeData), idArray);	// this function from the ForceTree.js file extends for each node in
        // the idArray the invisible force graph and returns their positions

        for(let i = 0; i < childArray.length; i++){		// in the end the affected child-nodes are placed at the calculated positions
            let centerX = positions[i].x - nodeWidth/2;
            let centerY = positions[i].y - (nodeHeightEmpty + callSiteHeight*childArray[i].callSites.length)/2;
            childArray[i].setPosition(centerX, centerY);
            childArray[i].setForceNodeIndex(positions[i].index);
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
        else createSingleNode(this.sizes.x, this.sizes.y, this.nodeData, this.callSites);	// creates a new node otherwise
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
            this.marked = true;
            this.visible = false;
            var markedArr = [];
            markChildren(this);
            markedArr.forEach(function(n){
                unmark(n);
            });

            markedArr.push(this);
            markedArr.forEach(function (n) {
                document.getElementById(idString(n.nodeData)).style.display = "none";
                n.visible = false;
                //updates number of current shown nodes and edges
                currentNodes--;
                refreshGraphData();
                n.reloadEdges();
                n.marked = false;
            });
        }

        function markChildren(n){

            if(n.children.length > 0) {
                n.children
                    .filter(child => child.node.visible && !child.node.marked)
                    .forEach(function (c) {
                        c.node.marked = true;
                        markedArr.push(c.node);
                        markChildren(c.node);
                });
            }
        }

        function unmark(n) {
            if(n.parents.length){
                for(let i = 0; i < n.parents.length; i++){
                    let p = n.parents[i];
                    if(p.node.visible && !p.node.marked && p.edge !== undefined && p.edge.visible !== false){
                        n.marked = false;
                        markedArr.splice(markedArr.indexOf(n), 1);
                        if (n.children) {
                            n.children.forEach(function (c) {
                                if (c.node.marked === true && c.node.visible) {
                                    unmark(c.node);
                                }
                            })
                        }
                        break;
                    }
                }
            }

        }
    }

    /**
     * repositions all in- and outgoing edges of this node.
     */
    reloadEdges(){
        this.children
            .filter(child => child.edge !== undefined)
            .filter(child => child.edge.visible !== null)
            .forEach(function(child){
            child.edge.reload();
        });
        this.parents
            .filter(parent => parent.edge !== undefined)
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
        this.reloadEdges();
    }

    /**
     * toggles this detailed attribute to false and reloads this node's edges
     */
    toggleToAbstract(){
        this.detailed = false;
        this.reloadEdges();
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
     * @returns {{declaredTarget: {name: string, declaringClass: string, returnType: string, parameterTypes: string}, line: number, targets: {name: string, declaringClass: string, returnType: string, parameterTypes: string}[]}[]} - call sites
     */
    getCallSites(){ return this.callSites; }

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
                methodDivs[i].childNodes[1].textContent = "(" + this.callSites[i].targets.length + ")";
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
 * @param {{declaredTarget: {name: string, declaringClass: string, returnType: string, parameterTypes: string}, line: number, targets: {name: string, declaringClass: string, returnType: string, parameterTypes: string}[]}[]} callSites - array with callSite information
 */
function createSingleNode(x, y, nodeData, callSites){
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
                let node = nodeMap.get(this.id);
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
                let newX = parseInt(this.parentNode.getAttribute("x")) + parseInt(d3.event.dx);
                let newY = parseInt(this.parentNode.getAttribute("y")) + parseInt(d3.event.dy);

                this.parentNode.setAttribute("x", newX);
                this.parentNode.setAttribute("y", newY);

                let node = nodeMap.get(this.id);
                node.setPosition(newX, newY);
                node.reloadEdges();

            }
        });

    let foreignObjectCont = svgCont.append("foreignObject")
        .attr("x", x)
        .attr("y", y);

    let node = foreignObjectCont.append("xhtml:div")
        .attr("id", idString(nodeData))
        .attr("class","div_node")
        .call(drag)
        .style("width", nodeWidth + "px")
        .style("padding", "20px")
        .style("border-width", "5px");	// sizes must stay in js-file for later calculations;

    // let idStr = idString(nodeData);
    // let packageStr = nodeData.declaringClass.substring(0, nodeData.declaringClass.lastIndexOf('/'));
    // let signatureStr = idStr.substring(idStr.lastIndexOf('/')+1, idStr.length);
    let packageStr = nodeData.declaringClass;
    let nameStr = nodeData.name;
    let parameterStr = "";
    for(let i = 0; i < nodeData.parameterTypes.length; i++){
        if(i > 0) parameterStr += ", ";
        parameterStr += nodeData.parameterTypes[i];
    }
    let returnStr = nodeData.returnType;

    node.append("xhtml:h2")
        .on("mouseover", function(){ foreignObjectCont.attr("width", 2000); })
        .on("mouseout", function(){ foreignObjectCont.attr("width", 400); })
        .style("text-align", "center")
        .append("u")
        .text(nameStr);
    let header = node.append("xhtml:div")
        .attr("class", "nodeHeader")
        .on("mouseover", function(){ foreignObjectCont.attr("width", 2000); })
        .on("mouseout", function(){ foreignObjectCont.attr("width", 400); });
    let headerline = header.append("xhtml:h3");
    headerline.append("span")
        .text("Package:  ")
        .style("font-size", "12px");
    headerline.append("span")
        .text(packageStr);
    headerline = header.append("xhtml:h3");
    headerline.append("span")
        .text("Parameter Types:  ")
        .style("font-size", "12px");
    headerline.append("span")
        .text(parameterStr);
    headerline = header.append("xhtml:h3");
    headerline.append("span")
        .text("Return Type:  ")
        .style("font-size", "12px");
    headerline.append("span")
        .text(returnStr);

    node = node.append("xhtml:div")
        .attr("class","node_inhalt")
        .on("mouseover", function(){ foreignObjectCont.attr("width", 2000); })
        .on("mouseout", function(){ foreignObjectCont.attr("width", 400); });

    for(let i=0; i < callSites.length; i++){
        var entry = node.append("xhtml:button")
            .attr("id", idString(nodeData) + "#" + i)
            .attr("class", "methodButton")
            .on("click", function(){
                let index = this.getAttribute("id").split('#')[1];
                var node = nodeMap.get(idString(nodeData));
                if(node.callSites[i].targets.length < callSiteThreshold) node.showChildNodes(index); })
            .style("border-width", "2px")
            .style("border-top-width", (i === 0 ? "2px" : "0px"))
            .style("border-radius", "5px")
            .style("padding", "5px");
        entry.append("xhtml:div")
            .attr("class", "callSite")
            .text(callSites[i].line + ": " + idString(callSites[i].declaredTarget))
            .style("float", "left");
        entry.append("xhtaml:div")
            .text("(" + callSites[i].targets.length + ")")
            .style("float", "right")
            .style("color", "#b0b0b0");
    }

    foreignObjectCont
        .attr("width", foreignObjectCont[0][0].childNodes[0].offsetWidth)
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