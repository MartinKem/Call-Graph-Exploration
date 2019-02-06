let f = d3.layout.force;
		
		var createdNodes = 0;
		var svgCont = d3.select("#graph")
			.append("svg")
			.attr("width", 40000)
			.attr("height", 40000);
			
		var defsCont = svgCont.append("defs").attr("id", "definitions");
		
		var rootNodeString;
		var rootNode;	// initialized in jsonPars.js and referenced in node.js
		var rootNodes = [];
		
        var nodeMap = new Map();
        




        var i = 0;
		function open_close() {

			if (i===0){
				d3.selectAll(".node_inhalt").classed("invis",true);
				rootNodes.forEach(allToAbstract);
				document.getElementById("btn").innerText = "Show details";
				i++;
			}else {

				d3.selectAll(".node_inhalt").classed("invis",false);
				rootNodes.forEach(allToDetailed);
				document.getElementById("btn").innerText = "Hide details";
				i=0;
			}
			return;
		}