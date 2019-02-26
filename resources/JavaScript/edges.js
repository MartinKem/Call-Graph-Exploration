/**
* (only for testing)
* IMPORT:
* *******
*/
if (typeof module !== 'undefined') {
    var index = require("./index");
	var svgCont = index.svgCont;
	var d3 = index.d3;
}



/*
insertes an arrow from (xStart, yStart) to (xDest, yDest) into an svg-container

svg: svg-container to insert the arrow in
xStart: x-value of the start point
yStart: y-value of the start point
xDest: x-value of the destination point
yDest: y-value of the destination point
edgeID: id of the constructed edge
label: declared target as arrow index

returns: void
*/
function createEdge(svg, xStart, yStart, xDest, yDest, edgeID, label, curved){
    var marker = svg;

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

    if(label != null){
        var marker = d3.select("#definitions")
            .append("svg:marker")
            .attr("id", label)
            .attr("markerWidth", "200")
            .attr("markerHeight", "100")
            .attr("refX", "100")
            .attr("refY", "50");

        marker.append("svg:rect")
            .attr("id", label + "_background")
            .attr("y", "45")
            .attr("height", "10")
            .style("fill", "white")
            .style("stroke-width", "1")
            .style("stroke", "black");

        marker.append("svg:text")
            .attr("id", label + "_text")
            .attr("y", "52")
            .style("font-family", "Helvetica")
            .style("font-size", "5")
            .text(label);

        var textWidth = document.getElementById(label + "_text").getBBox().width;

        d3.select("#" + label + "_text").attr("x", 100-textWidth/2);
        d3.select("#" + label + "_background").attr("x", 96-textWidth/2).attr("width", textWidth+6);
    }

    var path = "M" + xStart + "," + yStart + "L" + xDest + "," + yDest;
    if(curved) path = getCurvedPath(xStart, yStart, xStart-27, yStart-50);

    svg.append("svg:path")
        .attr("d", path)
        .attr("id", edgeID)
        .attr("class", "edge")
        .style("fill", "none")	// necessary for recursive arrows
        .style("marker-end", "url(#markerArrow)")
        .style("marker-mid", "url(#" + label + ")")
        .style("opacity", "0.5")
        .style("display", "block")
        .style("visibility", "visible");
}

function getCurvedPath(xStart, yStart, xDest, yDest){
    return "M " + xStart + " " + (yStart+15).toString() +
        " C " + (xStart-150).toString() + " " + (yStart+50).toString() +
        ", " + (xDest-120).toString() + " " + (yDest-50).toString() +
        ", " + (xDest).toString() + " " + (yDest).toString();
}
 
/*
 returns the intersection between a center-to-center line of two rectangles
 (given as an origin, width and height) and the border of the first rectangle
 
 node1{x, y, width, height}: first rectangle with result point on its border
 node2{x, y, width, height}: second rectangle (but only center is relevant)
 
 returns: {x, y} as intersection
*/


/*
 returns the border point on the left or the right border
 
 node1{x, y, width, height}: first rectangle with result point on its border
 node2{x, y, width, height}: second rectangle (but only center is relevant)
 
 returns: {x, y} as side point
*/
function sidePoint(node1, node2){
	var xRes;
	if(node2.x + node2.width/2 > node1.x + node1.width){
		xRes = node1.x + node1.width;
	}
	else if(node2.x + node2.width/2 < node1.x){
		xRes = node1.x;
	}
	else{
		return borderPoint(node1, node2);
	}
	return {x: xRes, y: node1.y + node1.height/2};
}


/*
creates border-to-borer edge on an imaginary center-to-center edge between two rectangles
(available as link) into an svg-container

svg: svg-container to insert the edge in
link{source, dest}: source node and destination node
edgeID: id of the constructed edge

returns: void
*/
function center2centerEdge(svg, link, edgeID){
	var n1 = borderPoint(link.source, link.dest);
	var n2 = borderPoint(link.dest, link.source);
	createEdge(svg, n1.x, n1.y, n2.x, n2.y, edgeID);
}

/*
creates borde-to-border edge from the left or the right side of the source node to the center
of the destination node

svg: svg-container to insert the edge in
link{source, dest}: source node and destination node
edgeID: id of the constructed edge

returns: void
*/
function side2centerEdge(svg, link, edgeID){
	var n1 = sidePoint(link.source, link.dest);
	var n2 = borderPoint(link.dest, link.source);
	createEdge(svg, n1.x, n1.y, n2.x, n2.y, edgeID, "declaredTarget");
}

/*
returns the absolute dimensions of an element anywhere in the graph

id: id of the element

returns: {xPos, yPos, width, height}
*/
function absPosition(id){
	[nodeString, index] = id.split('#');
	let node = nodeMap.get(nodeString);
	let offsetX = 0;
	let offsetY = 0;
	let width = node.getSizes().width;
	let height = node.getSizes().height;
	if(index){
		index = parseInt(index);
		offsetX = (node.getSizes().width - callSiteWidth)/2;
		offsetY = callSiteTopOffset + index*callSiteHeight;
		width = callSiteWidth;
		height = callSiteHeight;
	}
	let x = node.getSizes().x + offsetX;
	let y = node.getSizes().y + offsetY;
	return {x: x, y: y, width: width, height: height};
}

/*
creates a center2centerEdge from one element to another
nodes must exist in the graph before edges can be created

id1: id of the source element
id2: id of the destination element

returns: void
*/
function node2nodeEdge(id1, id2){
	var link = {source: absPosition(id1), dest: absPosition(id2)}
	center2centerEdge(svgCont, link, id1 + "->" + id2);
}

/*
creates a side2centerEdge from one element to another
nodes must exist in the graph before edges can be created

id1: id of the source element
id2: id of the destination element

returns: void
*/
function method2nodeEdge(id1, id2){
	var link = {source: absPosition(id1), dest: absPosition(id2)};

	if(id1.split("#")[0] == id2) createEdge(svgCont, link.source.x, link.source.y, -1, -1, id1 + "->" + id2, null, true);
	else side2centerEdge(svgCont, link, id1 + "->" + id2);
}

/*
changes the path of a given edge so that it starts from the outer border of it's source node

id: id of the edge

returns: void
*/
function toggleToAbstract(id, link){
	var edge = document.getElementById(id);
	let destID = id.split("->")[1];
	let sourceID = id.split("#")[0];
	if(!link) link = {source: absPosition(sourceID), dest: absPosition(destID)};
	if(sourceID == destID) edge.setAttribute("d", getCurvedPath(link.source.x, link.source.y+60, link.source.x, link.source.y+30));
	else{
		var n1 = borderPoint(link.source, link.dest);
		var n2 = borderPoint(link.dest, link.source);
		if(n1.x && n2.x) edge.setAttribute("d", "M" + n1.x + "," + n1.y + "L" + n2.x + "," + n2.y);
	}
		
	/* uncomment this to activate edge labeling
	var xMid = (n2.x+n1.x)/2;
	var yMid = (n2.y+n1.y)/2;
	var mid = "L" + xMid + "," + yMid;
		
	edge.setAttribute("d", "M" + n1.x + "," + n1.y + mid + "L" + n2.x + "," + n2.y);*/
}

/*
changes the path of a given edge so that it starts from the border of it's source nodes's inner mathod div

id: id of the edge

returns: void
*/
function toggleToDetailed(id, link){
	var edge = document.getElementById(id);
	[sourceID, destID] = id.split("->");
	if(!link) link = {source: absPosition(sourceID), dest: absPosition(destID)};
	var n1 = sidePoint(link.source, link.dest);
	if(n1.x && sourceID.split('#')[0] == destID){
		n1 = {x: link.source.x, y: link.source.y + link.source.height/2};
		edge.setAttribute("d", getCurvedPath(n1.x, n1.y-15, n1.x-27, n1.y-65));
	}
	else{
		var n2 = borderPoint(link.dest, link.source);
		if(n1.x && n2.x) edge.setAttribute("d", "M" + n1.x + "," + n1.y + "L" + n2.x + "," + n2.y);
	}
}


/**
* (only for testing)
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {
	module.exports.method2nodeEdge = method2nodeEdge;
}