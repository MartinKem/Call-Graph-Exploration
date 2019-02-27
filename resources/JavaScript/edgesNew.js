class Edge{

    /**
     * @param source : node
     * @param target : node
     * @param callsiteIndex : int
     */
    constructor(source, target, callsiteIndex){
        this.source = source;
        this.target = target;
        this.callsiteIndex = callsiteIndex;
        this.id = idString(source.getNodeData()) + '#' + callSiteIndex + '->' + idString(target.getNodeData());
        this.visible = null;
        this.curved = idString(source.getNodeData()) === idString(target.getNodeData());
    }

    getNodeSizes(){
        let node1,node2;
        let source = this.source;
        let target = this.target;
        if(source.detailed){
            node1 = {x: source.getSizes().x + (nodeWidth-callSiteWidth)/2,
                y: source.getSizes().y + (callSiteTopOffset + callSiteHeight * this.callsiteIndex),
                width: callSiteWidth, height: callSiteHeight}
        }else{
            node1 = {x: source.getSizes().x, y: source.getSizes().y, width: nodeWidth, height: nodeHeightEmpty};

        }
        if(target.detailed){
            node2 = target.getSizes();
        } else {
            node2 = {x: target.getSizes().x, y: target.getSizes().y, width: nodeWidth, height: nodeHeightEmpty};
        }
        return {n1: node1, n2: node2};
    }

    getBorderPoints(){
        let nodeSizes = this.getNodeSizes();
        let node1 = nodeSizes.n1;
        let node2 = nodeSizes.n2;

        let center1 = {x: node1.x + node1.width/2, y: node1.y + node1.height/2};
        let center2 = {x: node2.x + node2.width/2, y: node2.y + node2.height/2};

        function f1(x){
            return (node1.height/node1.width) * (x - center1.x) + center1.y;
        }

        function f2(x){
            return -(node1.height/node1.width) * (x - center1.x) + center1.y;
        }

        function lineFunction(value, ret){ // f(x) = m*x + b -> center-to-center line function
            let m;
            if(center2.x-center1.x === 0){
                m = (center2.y - center1.y) / 0.0000000000001
            } else {
                m = (center2.y - center1.y) / (center2.x - center1.x);

            }
            let b = (center2.y) - m*(center2.x);
            if(ret === "y") return m*value + b; // return y-value of given x-value (= m*x + b)
            if(ret === "x") return (value - b)/m; // return x-value of given y-value (= (f(x) - b)/m)
        }
        function singlePoint(node) {
            let x1Res = 0, y1Res = 0;
            if(center2.y >= f1(center2.x)){
                if(center2.y >= f2(center2.x)){
                    y1Res = node.y + node.height;	// case bottom
                    x1Res = lineFunction(y1Res, "x");
                } else {
                    x1Res = node.x;					// case left
                    y1Res = lineFunction(x1Res, "y");
                }
            } else {
                if(center2.y >= f2(center2.x)){
                    x1Res = node.x + node.width;	// case right
                    y1Res = lineFunction(x1Res, "y");
                } else {
                    y1Res = node.y;					// case top
                    x1Res = lineFunction(y1Res, "x");
                }
            }
            return {x: x1Res, y: y1Res};
        }
        let res1 = singlePoint(node1);
        let temp = center1;
        center1 = center2;
        center2 = temp;
        let res2 = singlePoint(node2);
        return {xSource: res1.x, ySource: res1.y, xTarget: res2.x, yTarget: res2.y}
    }

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
        else{

            return bp;
        }
        return {xSource: xRes, ySource: node1.y + node1.height/2, xTarget:bp.xTarget, yTarget:bp.yTarget};
    }

    reload(){
        let edge = document.getElementById(this.id);
        if(edge){
            if(this.visible === false){
                edge.style.display = "none";
            }
            let path = this.getPathString();
            edge.setAttribute("d", path);
        }
    }
    hide(){
        this.visible = false;
        let edge = document.getElementById(this.id);
        edge.style.display = "none";
    }
    show(){
        this.visible = true;
        let edge = document.getElementById(this.id);
        edge.style.display = "block";
    }

    /**
     * insertes an arrow from (xStart, yStart) to (xDest, yDest) into an svg-container
     */
    create(){
        if(this.visible !== null){
            this.reload();
            return;
        }
        let positions;
        if(this.source.detailed){
            positions = this.sidePoint();
        }else{
            positions = this.getBorderPoints();
        }

        let edgeID = this.id;
        let xStart = positions.xSource;
        let yStart = positions.ySource;
        let xDest = positions.xTarget;
        let yDest = positions.yTarget;

        if(document.getElementById("markerArrow") == null){
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

        let path = "M" + xStart + "," + yStart + "L" + xDest + "," + yDest;
        if(this.curved) path = this.getCurvedPath();

        svgCont.append("svg:path")
            .attr("d", path)
            .attr("id", edgeID)
            .attr("class", "edge")
            .style("fill", "none")	// necessary for recursive arrows
            .style("marker-end", "url(#markerArrow)")
            .style("opacity", "0.5")
            .style("display", "block")
            .style("visibility", "visible");
    }

    getPathString(){
        let positions;
        if(this.source.detailed){
            positions = this.sidePoint();
        }else{
            positions = this.getBorderPoints();
        }
        let path = "M" + positions.xSource + "," + positions.ySource + "L" + positions.xTarget + "," + positions.yTarget;

        if(this.curved){
            path = getCurvedPath();
        }

        function getCurvedPath(){
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

        return path;
    }
}