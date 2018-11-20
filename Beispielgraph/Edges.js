/*
insertes an arrow from (xStart, yStart) to (xDest, yDest) into an svg-container

svg: svg-container to insert the arrow in
xStart: x-value of the start point
yStart: y-value of the start point
xDest: x-value of the destination point
yDest: y-value of the destination point

returns: void
*/
var createEdge = function(svg, xStart, yStart, xDest, yDest){
	 var marker = svg.append("svg:defs"); 
	
	 marker.append("svg:marker") 
		 .attr("id", "markerArrow") 
		 .attr("markerWidth", "13") 
		 .attr("markerHeight", "13")
		 .attr("refX", "9") // distance to line
		 .attr("refY", "4") 
		 .attr("orient", "auto") 
		 .append("svg:path") 
			 .attr("d", "M5,4 L3,1 L10,4 L3,7 L5,4")
			 .style("fill", "black");
	
	 svg.append("svg:path") 
		 .attr("d", "M" + xStart + "," + yStart + "L" + xDest + "," + yDest) 
		 .style("stroke", "black") 
		 .style("stroke-width", "3px") 
		 .style("fill", "none") 
		 .style("marker-end", "url(#markerArrow)");
 }
 
 /*
 returns the intersection between a center-to-center line of two rectangles
 (given as an origin, width and height) and the border of the first rectangle
 
 node1{x, y, width, height}: first rectangle with result point on its border
 node2{x, y, width, height}: second rectangle (but only center is relevant)
 
 returns: {x, y} as intersection
 */
 var borderPoint = function(node1, node2){
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
		var m = (center2.y - center1.y) / (center2.x - center1.x);
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
	return {x: xRes,y: yRes};
 }
 
/*
creates border-to-borer edge on an imaginary center-to-center edge between two rectangles
(available as link) into an svg-container

svg: svg-container to insert the edge in
link{source, dest}: source node and destination node

returns: void
*/
var center2centerEdge = function(svg, link){
	var n1 = borderPoint(link.source, link.dest);
	var n2 = borderPoint(link.dest, link.source);
	createEdge(svg, n1.x, n1.y, n2.x, n2.y);
}