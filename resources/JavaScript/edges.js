/**
* (only for testing)
* IMPORT:
* *******
*/
if (typeof module !== 'undefined') {
    var index = require('./index');
    var idString = index.idString;

    var refresh = require("./refresh");
    var refreshGraphData = refresh.refreshGraphData;
    var estGraphData = refresh.estGraphData;
}

/**
 * Is needed for testing, to be compatible with node and chrome
 * @param {node} source : source node
 * @param {node} target : target node
 * @param {int} callSiteIndex : callSiteIndex
 */
function edgeConstructor(source, target, callSiteIndex){
    return new Edge(source, target, callSiteIndex);
}

class Edge{

    /**
     * @param {node} source - source node, which the edge starts from
     * @param {node} target - target node, which the edge points to
     * @param {number} callSiteIndex - source nodes index of the call site, where this node is called from
     */
    constructor(source, target, callSiteIndex){
        this.source = source;
        this.target = target;
        this.callsiteIndex = callSiteIndex;
        this.id = idString(source.getNodeData()) + '#' + callSiteIndex + '->' + idString(target.getNodeData());
        this.visible = null;
        this.curved = idString(source.getNodeData()) === idString(target.getNodeData());
    }

    /**
     * returns x, y, width and height of the source and the target node
     *
     * @returns {{n1: ({x: number, width: number, y: number, height: number}|{x: (number|*), width: number, y: (number|*), height: number}), n2: ({x: number, width: number, y: number, height: number}|{x: number, y: number, width: number, height: number})}}
     */
    getNodeSizes(){
        let node1,node2;
        let source = this.source;
        let target = this.target;
        // the height of the detailed and the abstract node are usually different
        // in addition if the source node is detailed, the sizes shall belong to the call site
        if(source.detailed){
            let callSiteDiv = document.getElementById(idString(this.source.nodeData) + '#' + this.callsiteIndex);
            let position = getGlobalOffset(callSiteDiv);
            node1 = {
                x: position.left,
                y: position.top,
                width: callSiteWidth,
                height: callSiteHeight
            }
        }else{
            node1 = {x: source.getSizes().x, y: source.getSizes().y, width: nodeWidth, height: nodeHeightEmpty};

        }
        if(target.detailed){
            node2 = target.getSizes();
        } else {
            node2 = {x: target.getSizes().x, y: target.getSizes().y, width: nodeWidth, height: nodeHeightEmpty};
        }
        return {n1: node1, n2: node2};

        /**
         * returns the x- and y-value of an html element in global context
         *
         * @param {HTML-Element} el - html element
         * @returns {{top: number, left: number}}
         */
        function getGlobalOffset(el) {
            var x = 0, y = 0;
                // if the element is the foreignObject of the node, this loop shall break and finally add the x- and y-value of the node to the offsets
                while (el.nodeName !== "foreignObject") {
                    x += el.offsetLeft;
                    y += el.offsetTop;
                    el = el.offsetParent;
                    if(!el) break;
                }
                if(el){
                    x += parseInt(el.getAttribute("x")) + 4;
                    y += parseInt(el.getAttribute("y")) + 4;
                }
                return { left: x, top: y };
        }
    }

    /**
     * returns the two points, where a line from the center of rect1 to the center of rect2 would cross the rect's borders
     *
     * @returns {{xSource: number, ySource: number, xTarget: number, yTarget: number}}
     */
    getBorderPoints(){
        /**
         * returns the crossing point of the line from the center of rect1 to the center of rect2 with the border of rect1
         *
         * @param {{x: number, y: number, width: number, height: number}} node1 - rect1
         * @param {{x: number, y: number, width: number, height: number}} node2 - rect2
         * @returns {{x: (*|number), y: (*|number)}}
         */
        function singlePoint(node1, node2){
            let center1 = {x: node1.x + node1.width/2, y: node1.y + node1.height/2};
            let center2 = {x: node2.x + node2.width/2, y: node2.y + node2.height/2};

            let xRes = 0, yRes = 0;

            if(center2.y >= f1(center2.x)){
                if(center2.y >= f2(center2.x)){
                    yRes = node1.y + node1.height;	// case bottom
                    xRes = lineFunction(yRes, "x");
                } else {
                    xRes = node1.x;					// case left
                    yRes = lineFunction(xRes, "y");
                }
            } else {
                if(center2.y >= f2(center2.x)){
                    xRes = node1.x + node1.width;	// case right
                    yRes = lineFunction(xRes, "y");
                } else {
                    yRes = node1.y;					// case top
                    xRes = lineFunction(yRes, "x");
                }
            }

            /**
             * returns the y value of the diagonal line from the top left corner to the bottom right corner of node1 to a given x-value
             *
             * @param {number} x - x-value
             * @returns {number}
             */
            function f1(x){
                return (node1.height/node1.width) * (x - center1.x) + center1.y;
            }

            /**
             * returns the y value of the diagonal line from the top right corner to the bottom left corner of node1 to a given x-value
             *
             * @param {number} x - x-value
             * @returns {number}
             */
            function f2(x){
                return -(node1.height/node1.width) * (x - center1.x) + center1.y;
            }

            /**
             * function of the line from center1 to center2
             *
             * @param {number} value - x-value to get the corresponding y-value for or y-value to get the corresponding x-value for
             * @param {"y"|"x"} ret - tells, which value shall be returned
             * @returns {number}
             */
            function lineFunction(value, ret){ // f(x) = m*x + b -> center-to-center line function
                let m;
                if(center2.x-center1.x === 0){
                    m = (center2.y - center1.y) / 0.0000000001
                } else {
                    m = (center2.y - center1.y) / (center2.x - center1.x);

                }
                var b = (center2.y) - m*(center2.x);
                if(ret === "y") return m*value + b; // return y-value of given x-value (= m*x + b)
                if(ret === "x") return (value - b)/m; // return x-value of given y-value (= (f(x) - b)/m)
            }

            return {x: xRes, y: yRes};
        }
        let nodeSizes = this.getNodeSizes();
        let res1 = singlePoint(nodeSizes.n1, nodeSizes.n2);
        let res2 = singlePoint(nodeSizes.n2, nodeSizes.n1);

        return {xSource: res1.x, ySource: res1.y, xTarget: res2.x, yTarget: res2.y};
    }

    /**
     * If the edge starts from a call site, it shall start at the left or right border if possible.
     *
     * @returns {{xSource: number, ySource: number, xTarget: number, yTarget: number}}
     */
    sidePoint(){
        let nodeSizes = this.getNodeSizes();
        let node1 = nodeSizes.n1;
        let node2 = nodeSizes.n2;
        let bp = this.getBorderPoints();

        let xRes;
        let x2Center = node2.x + node2.width/2;
        let x1LeftBorder = node1.x;
        let x1RightBorder = node1.x + node1.width;

        if(x2Center > x1RightBorder){
            xRes = x1RightBorder;
        }
        else if(x2Center < x1LeftBorder){
            xRes = x1LeftBorder;
        }
        // if the center of the target rect is between the two sides of the source rect, the border point is returned instead
        else{
            return bp;
        }
        return {xSource: xRes, ySource: node1.y + node1.height/2, xTarget: bp.xTarget, yTarget: bp.yTarget};
    }

    /**
     * reprints this edge according to if the nodes are visible and if they are detailed or not
     */
    reload(){
        let edge = document.getElementById(this.id);
        if(edge){
            if(!this.source.visible || !this.target.visible){
                this.hide();
            }
            else{
                this.show();
            }
            let path = this.getPathString();
            edge.setAttribute("d", path);
        }
    }

    /**
     * hides this edge
     */
    hide(){
        //update graph data
        if (this.visible) currentEdges--;
        refreshGraphData();
        this.visible = false;
        let edge = document.getElementById(this.id);
        edge.style.display = "none";
    }

    /**
     * shows this edge
     */
    show(){
        //update graph data
        if (!this.visible) currentEdges++;
        refreshGraphData();
        this.visible = true;
        let edge = document.getElementById(this.id);
        edge.style.display = "block";
    }

    /**
     * insertes an arrow from (xStart, yStart) to (xDest, yDest) into an svg-container
     */
    create() {
        this.visible = true;
        //update graph data
        currentEdges++;
        refreshGraphData();
        
        let positions;
        if (this.source.detailed) {
            positions = this.sidePoint();
        } else {
            positions = this.getBorderPoints();
        }

        let edgeID = this.id;
        let xStart = positions.xSource;
        let yStart = positions.ySource;
        let xDest = positions.xTarget;
        let yDest = positions.yTarget;

        if (document.getElementById("markerArrow") == null) {
            d3.select("#definitions").append("svg:marker")
                .attr("id", "markerArrow")
                .attr("class", "arrowHead")
                .attr("markerWidth", "13")
                .attr("markerHeight", "13")
                .attr("refX", "9") // distance to line
                .attr("refY", "4")
                .attr("orient", "auto")
                .append("svg:path")
                .attr("d", "M5,4 L3,1 L10,4 L3,7 L5,4");
        }

        let path = this.getPathString();
        let thisEdge = this;

        svgCont.append("svg:path")
            .attr("d", path)
            .attr("id", edgeID)
            .attr("class", "edge")
            .style("fill", "none")	// necessary for recursive arrows
            .style("marker-end", "url(#markerArrow)")
            .style("opacity", "0.5")
            .style("display", "block")
            .style("visibility", "visible");

        $("[id='" + edgeID + "']").dblclick(function () {
            thisEdge.target.focus();
        });
        $("[id='" + edgeID + "']").click(function () {
            if(keyPressed === 17 ) {
                focusWindowTo(this.getPointAtLength(0));
            }
        });

    }

    /**
     * returns the string to the d-attribute of the path-element
     *
     * @returns {string}
     */
    getPathString(){
        let path;
        if(this.curved){
            path = this.getCurvedPath();
        } else {
            let positions;
            if(this.source.detailed){
                positions = this.sidePoint();
            }else{
                positions = this.getBorderPoints();
            }
            path = "M" + positions.xSource + "," + positions.ySource + "L" + positions.xTarget + "," + positions.yTarget;
        }

        return path;
    }

    /**
     * this is used for recursive edges
     *
     * @returns {string}
     */
    getCurvedPath(){
        let sourceSize = this.source.getSizes();
        let xStart = sourceSize.x;
        let yStart = sourceSize.y + 60;
        let xDest = xStart;
        let yDest = sourceSize.y + 30;
        if(this.source.detailed) {
            let ns = this.getNodeSizes();
            xStart = ns.n1.x;
            yStart = ns.n1.y + callSiteHeight/2;
            xDest = ns.n2.x;
            yDest = ns.n1.y - 65;
        }
        return "M " + xStart + " " + (yStart).toString() +
            " C " + (xStart-150).toString() + " " + (yStart+50).toString() +
            ", " + (xDest-120).toString() + " " + (yDest-50).toString() +
            ", " + (xDest).toString() + " " + (yDest).toString();
    }
}

/**
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {
	module.exports.edgeConstructor = edgeConstructor;
}