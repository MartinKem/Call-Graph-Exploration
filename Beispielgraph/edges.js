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
function createEdge(svg, xStart, yStart, xDest, yDest, edgeID, label){
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
				 .attr("d", "M5,4 L3,1 L10,4 L3,7 L5,4")
				 .style("fill", "black");
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
	 
	 svg.append("svg:path") 
		 .attr("d", "M" + xStart + "," + yStart + "L" + xDest + "," + yDest)
		 .attr("id", edgeID)
		 .attr("class", "edge")
		 .style("stroke", "black") 
		 .style("stroke-width", "3px") 
		 .style("fill", "none") 
		 .style("marker-end", "url(#markerArrow)")
		 .style("marker-mid", "url(#" + label + ")");
 }
 
/*
 returns the intersection between a center-to-center line of two rectangles
 (given as an origin, width and height) and the border of the first rectangle
 
 node1{x, y, width, height}: first rectangle with result point on its border
 node2{x, y, width, height}: second rectangle (but only center is relevant)
 
 returns: {x, y} as intersection
*/
function borderPoint(node1, node2){
	var center1 = {x: node1.x + node1.width/2, y: node1.y + node1.height/2};
	var center2 = {x: node2.x + node2.width/2, y: node2.y + node2.height/2};
	
	var xRes = 0, yRes = 0;
	
	var f1 = function(x){
		return (node1.height/node1.width) * (x - center1.x) + center1.y;
	}
	
	var f2 = function(x){
		return -(node1.height/node1.width) * (x - center1.x) + center1.y;
	}
		
	var lineFunction = function(value, ret){ // f(x) = m*x + b -> center-to-center line function
		if(center2.x-center1.x == 0){
		    var m = (center2.y - center1.y) / 0.0000000001
        } else {
            var m = (center2.y - center1.y) / (center2.x - center1.x);

        }
		var b = (center2.y) - m*(center2.x);
		if(ret === "y") return m*value + b; // return y-value of given x-value (= m*x + b)
		if(ret === "x") return (value - b)/m; // return x-value of given y-value (= (f(x) - b)/m)
	}
	
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
	return {x: xRes, y: yRes};
}

/*
 returns the border point on the left or the right border
 
 node1{x, y, width, height}: first rectangle with result point on its border
 node2{x, y, width, height}: second rectangle (but only center is relevant)
 
 returns: {x, y} as side point
*/
function sidePoint(node1, node2){
	var xRes;
	if(node2.x + node2.width/2 < node1.x){
		xRes = node1.x;
	}
	else if(node2.x + node2.width/2 > node1.x + node1.width){
		xRes = node1.x + node1.width;
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
	var element = document.getElementById(id);
	var widthVal = element.offsetWidth;
	var heightVal = element.offsetHeight;
	var xVal = 0, yVal = 0;
    do {
		var borderwidth = 0;
		if(element != document.getElementById(id)) borderwidth = parseInt(element.style.borderWidth, 10) || 0;
        yVal += element.offsetTop + borderwidth || 0;
        xVal += element.offsetLeft + borderwidth || 0;
        element = element.offsetParent;
    } while(element);
	return {x: xVal, y: yVal, width: widthVal, height: heightVal}
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
	var link = {source: absPosition(id1), dest: absPosition(id2)}
	side2centerEdge(svgCont, link, id1 + "->" + id2);
}

/*
changes the path of a given edge so that it starts from the outer border of it's source node

id: id of the edge

returns: void
*/
function toggleToAbstract(id){
	var edge = document.getElementById(id);
	[sourceID, destID] = id.split("->");
	[sourceID, __] = sourceID.split("#");
	var link = {source: absPosition(sourceID), dest: absPosition(destID)};
	var n1 = borderPoint(link.source, link.dest);
	var n2 = borderPoint(link.dest, link.source);
	
	/*
	var xMid = (n2.x+n1.x)/2;  // use this to activate edge label
	var yMid = (n2.y+n1.y)/2;
	var mid = "L" + xMid + "," + yMid;
		
	edge.setAttribute("d", "M" + n1.x + "," + n1.y + mid + "L" + n2.x + "," + n2.y);*/
	edge.setAttribute("d", "M" + n1.x + "," + n1.y + "L" + n2.x + "," + n2.y);
}

/*
changes the path of a given edge so that it starts from the border of it's source nodes's inner mathod div

id: id of the edge

returns: void
*/
function toggleToDetailed(id){
	var edge = document.getElementById(id);
	[sourceID, destID] = id.split("->");
	var link = {source: absPosition(sourceID), dest: absPosition(destID)};
	var n1 = sidePoint(link.source, link.dest);
	var n2 = borderPoint(link.dest, link.source);
	edge.setAttribute("d", "M" + n1.x + "," + n1.y + "L" + n2.x + "," + n2.y);
}


