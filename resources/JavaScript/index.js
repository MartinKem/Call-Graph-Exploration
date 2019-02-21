/**
* (only for testing)
* IMPORT:
* *******
*/
if (typeof module !== 'undefined') {
	var $ = require('jquery');
	var d3 = require('d3');
}

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

		/*
		maps from following string:	TODO: für alle Zugriffe auf nodeMap ändern, außerdem für jene auf parsedJsonMap
		declaringClass.name(parameterTypes[0],...,parameterTypes[n]):returnType
		to:
		node object
		 */
        var nodeMap = new Map();

        var i = 0;

        function idString(nodeData){
            if(!nodeData) return;
            let result = nodeData.declaringClass + '.' + nodeData.name + '(';
        	for(let i = 0; i < nodeData.parameterTypes.length; i++){
        		result += nodeData.parameterTypes[i];
        		if(i < nodeData.parameterTypes.length-1) result += ',';
			}
        	result += '):' + nodeData.returnType;
        	return result;
		}

		function getNodeDataFromString(idString){
        	if(idString.split('(').length > 2) console.log("Identification error, multiple '(' in idString");
            [declaringClass, rest] = idString.split('.');
            if(!rest) return;
            [name, rest] = rest.split('(');
            if(!rest) return;
            [parameterString, returnType] = rest.split('):');
            if(!returnType) return;
            let parameterTypes = parameterString.split(',');

            return {declaringClass: declaringClass, name: name, parameterTypes: parameterTypes, returnType: returnType};
        }

        function escapeSG(string){
        	return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}

		function open_close() {

			if (i===0){
				d3.selectAll(".node_inhalt").classed("invis",true);
				rootNodes.forEach(function(rootNode){ rootNode.allToAbstract(); });
				document.getElementById("btn").innerText = "Show details";
				i++;
			}else {

				d3.selectAll(".node_inhalt").classed("invis",false);
				rootNodes.forEach(function(rootNode){ rootNode.allToDetailed(); });
				document.getElementById("btn").innerText = "Hide details";
				i=0;
			}
			return;
		}



/**
* EXPORT:
* *******
*/
if(typeof module !== 'undefined'){
	//module.exports.f = f;
	module.exports.createdNodes = createdNodes;
	module.exports.svgCont = svgCont;
	module.exports.defsCont = defsCont;
	module.exports.rootNodeString = rootNodeString;
	module.exports.rootNode = rootNode;
	module.exports.rootNodes = rootNodes;
	module.exports.nodeMap = nodeMap;
	module.exports.open_close = open_close;
	module.exports.i = i;
	module.exports.d3 = d3;
}