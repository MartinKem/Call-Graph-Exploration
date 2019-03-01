/**
* (only for testing)
* IMPORT:
* *******
*/
if (typeof module !== 'undefined') {

}



var strJson = "";
var arr = [];
var parsedJsonMap;
var isLoading = false;
var autocompleteMode;



/**
 * 
 * @param {string} percent - a string or number from 0 to 100, that is to be set
 */
function setProgBar(percent) {
	//get progress element from html
	let progress = document.getElementById("progress");
	progress.style.width = percent + '%';
	progress.textContent = percent + '%';
}


var setString = function (str) {
	strJson += str;
	if (strJson.length >= 132217728) {//128MB
		arr.push(strJson);
		strJson = "";
	}
}


function loadFile() {
	if (typeof window.FileReader !== 'function') {
		alert("The file API isn't supported on this browser yet.");
		return;
	}

	if (isLoading) {
		alert("Please reload page for new load.");
		return;
	}

	isLoading = true;
	setProgBar(0);
	let input = document.getElementById('fileinput').files[0];
	parseFile(input, setString);
}

function parseString() {
	let rest = "";
	let finalarray;

	arr.push(strJson);
	arr.forEach(function (a) {
		a = rest + a;
		let first = a.indexOf("\n    \"method\" : {") - 1;
		let last = a.lastIndexOf("\n    \"method\" : {") - 3;

		if (finalarray == null) { finalarray = JSON.parse("{\n  \"reachableMethods\" : [ " + a.slice(first, last) + " ]\n}").reachableMethods; }
		else { Array.prototype.push.apply(finalarray, JSON.parse("{\n  \"reachableMethods\" : [ " + a.slice(first, last) + " ]\n}").reachableMethods) }

		rest = a.slice(last);


	});

	//console.log(finalarray)
	// console.log(JSON.parse("{\n  \"reachableMethods\" : [ "+rest.slice(rest.indexOf("\n    \"method\" : {")-1,-3)+" ]\n}"));
	Array.prototype.push.apply(finalarray, JSON.parse("{\n  \"reachableMethods\" : [ " + rest.slice(rest.indexOf("\n    \"method\" : {") - 1, -3) + " ]\n}").reachableMethods);
	let parsedJson = { reachableMethods: finalarray };

	return parsedJson;

}

function correctClassNames(methods) {
	for (let i = 0; i < methods.reachableMethods.length; i++) {
		correctSingleMethod(methods.reachableMethods[i].method);
		methods.reachableMethods[i].callSites.forEach(function (site) {
			correctSingleMethod(site.declaredTarget);
			site.targets.forEach(correctSingleMethod);
		});
	}

	function correctSingleMethod(method) {
		method.declaringClass = truncateString(method.declaringClass);
		method.returnType = truncateString(method.returnType);
		method.parameterTypes = method.parameterTypes.map(truncateString);
	}

	function truncateString(str) {
		if (str[0] === 'L' && str[str.length - 1] === ';') { return str.substring(1, str.length - 1); }
		else if (str[1] === 'L') { return str.substring(2, str.length - 1); }
		else return str;
	}
}

function resetFileRead() {
	arr = [];
	strJson = "";
	isLoading = false;
	setProgBar(0);
}


function parseFile(file, callback) {
	var fileSize = file.size;
	var chunkSize = 16 * 4 * 1024 * 1024; // bytes
	var offset = 0;
	var chunkReaderBlock = null;

	var readEventHandler = function (evt) {
		if (evt.target.error == null) {
			offset += evt.target.result.length;
			callback(evt.target.result); // callback for handling read chunk
		} else {
			console.log("Read error: " + evt.target.error);
			return;
		}
		if (offset >= fileSize) {
			console.log("Done reading file");

			let parsedJson;
			try {
				parsedJson = parseString();
			} catch (e) {
				if (e instanceof SyntaxError) {
					alert("File could not be read. \n-Is the Json-File saved as UNIX (LF)? \n-Is the Json-File properly formatted? \n" + e);
					resetFileRead();
					return;
				} else {
					resetFileRead();
					return;
				}
			}


			correctClassNames(parsedJson); // remove 'L' and ';' out of the class names
			console.log("Done parsing file");
			console.log(parsedJson);
			//map rechableMethods to HashMap
			parsedJsonMap = new Map();
			parsedJson.reachableMethods.forEach(function (element) {
				parsedJsonMap.set(idString(element.method), element);
			});
			console.log("Done map json");

			//progress to 100%
			setProgBar('100');
			isLoading = false;

			changeDiv();
			(function reset() {
				strJson = "";
				arr = [];
				parsedJson = undefined;
			})();

			document.getElementById("search").removeAttribute("disabled");

			var fullMethods = getStructuredMethodList();

			autocomplete(document.getElementById("searchInput"), fullMethods);
			return;

		}

		// of to the next chunk

		chunkReaderBlock(offset, chunkSize, file);
	};

	chunkReaderBlock = function (_offset, length, _file) {
		var r = new FileReader();
		var blob = _file.slice(_offset, length + _offset);
		r.onload = readEventHandler;
		r.onprogress = function (evt) {
			// evt is an ProgressEvent.
			if (evt.lengthComputable) {
				var percentLoaded = Math.round(((offset + evt.loaded) / fileSize) * 100);
				// Increase the progress bar length.
				if (percentLoaded < 100) {
					setProgBar(percentLoaded);
				}
			}
		};
		r.readAsText(blob);
	};



	// now let's start the read with the first block
	chunkReaderBlock(offset, chunkSize, file);

	function getStructuredMethodList() {
		return Array.from(parsedJsonMap.keys());
	}
}
function changeDiv() {
	$("#load_page").addClass("invis");
	$("#graph_page").removeClass("invis");

}

//Eingabe bei gegebenem Texteingabefeld mit gegebenem Stringarray autovervollständigen 
function autocomplete(inp, arr) {
	//2 Parameter, Textfeld und Array mit Vervollständigungsdaten

	var currentFocus = 0;

	//Texteingabe erkennen
	inp.addEventListener("input", function (e) { autocompleteEvent(e, this); });
	inp.addEventListener("focus", function (e) { autocompleteEvent(e, this); });

	document.addEventListener("click", function (e) {
		if (e.srcElement.id !== "searchInput" && e.srcElement.id !== "targetSearch") {
			// console.log(mode);
			closeAllLists(e.target);
			if (e.srcElement.parentNode && e.srcElement.parentNode.id === "targetSearchautocomplete-list") {
				inp.focus();
			}
		}
	});

	function autocompleteEvent(e, inputElem) {
		var div, items, otherValue, thisArray, reducedArray = [], value = inputElem.value;

		//Alle offenen Listen schließen
		closeAllLists();
		//Unterbrechen, wenn das Textfeld leer ist
		currentFocus = -1;
		//DIV Element erstellen, das alle Vervollständigungsvorschläge enthält
		div = document.createElement("DIV");
		div.setAttribute("id", inputElem.id + "autocomplete-list");
		div.setAttribute("class", "autocomplete-items");
		//Füge das DIV Element dem Container als Kindelement hinzu
		inputElem.parentNode.appendChild(div);

		Loop1:
		for (let i = 0; i < arr.length; i++) {
			//Prüfe, ob die eingegebenen Zeichen mit beliebigem Teilstring des Vorschlags übereinstimmen
			Loop2:
			for (let j = 0; j < arr[i].length - value.length + 1; j++) {
				if (arr[i].substr(j, value.length).toUpperCase() === value.toUpperCase()) {
					arr[i] = escapeSG(arr[i]);
					//Erstelle DIV Element für jeden übereinstimmenden Vorschlag
					items = document.createElement("DIV");
					//Hebe übereinstimmende Zeichen als fettgedruckt hervor
					items.innerHTML = arr[i].substr(0, j);
					items.innerHTML += "<strong>" + arr[i].substr(j, value.length) + "</strong>";
					items.innerHTML += arr[i].substr(value.length + j);
					//Erstelle INPUT Feld, das den aktuellen Wert der Vorschlags enthält
					items.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
					//Führe die übergebene Funktion bei Knopfdruck des Elements aus
					items.addEventListener("click", function (e) {
						if (autocompleteMode === "callSite") {
							// Das Call-Site-Menü soll nur durch die eigenen Buttons und andere Call-Site-Menüs schließbar sein
							//Füge den Vervollständigungsvorschlag in das Textfeld ein
							inp.value = this.getElementsByTagName("input")[0].value;
							addTargetToSelected();
							inp.value = "";
						} else {
							//Füge den Vervollständigungsvorschlag in das Textfeld ein
							inp.value = this.getElementsByTagName("input")[0].value;
							//Alle offenen Listen schließen
							closeAllLists();
						}

					});
					div.appendChild(items);

					//Schleife unterbrechen wenn 10 Elemente gefunden wurden
					if (div.childElementCount >= 10) { break Loop1; }
					break Loop2;
				}
			}
		}
	}
	//Führe eine Funktion aus, wenn die Tastatur betätigt wird
	inp.addEventListener("keydown", function (e) {
		let x = document.getElementById(this.id + "autocomplete-list");
		if (x) x = x.getElementsByTagName("div");
		if (e.keyCode === 40) {
			//Erhöhe aktuellen Fokus bei Pfeiltaste UNTEN
			currentFocus++;
			//Hebe aktuelles Listenelement hervor
			addActive(x);
		} else if (e.keyCode === 38) {
			//Verringere aktuellen Fokus bei Pfeiltaste HOCH
			currentFocus--;
			//Hebe aktuelles Listenelement hervor
			addActive(x);
		} else if (e.keyCode === 13) {
			//Verhindere, dass ein Formular gesendet wird, wenn ENTER gedrückt wird
			if (currentFocus > -1) {
				//Simuliere Klick auf Listenelement
				e.preventDefault();
				if (x) x[currentFocus].click();
				currentFocus = -1;
			} else if (this.value) {
				document.getElementById("search").click();
			}
		}
	});
	function addActive(x) {
		//Funktion um Listenelement als aktiv zu klassifizieren
		if (!x) return false;
		//Entferne die "aktiv" Klasse von allen anderen Elementen
		removeActive(x);
		if (currentFocus >= x.length) currentFocus = 0;
		if (currentFocus < 0) currentFocus = (x.length - 1);
		//Füge Klasse "autocomplete-active" hinzu
		x[currentFocus].classList.add("autocomplete-active");
	}
	function removeActive(x) {
		//Entferne die "aktiv" Klasse von allen Listenelementen
		for (let i = 0; i < x.length; i++) {
			x[i].classList.remove("autocomplete-active");
		}
	}
	function closeAllLists(elmnt) {
		//Schließe alle offenen Autovervollständigungslisten mit Ausnahme der übergebenen
		let x = document.getElementsByClassName("autocomplete-items");
		for (let i = 0; i < x.length; i++) {
			if (elmnt != x[i] && elmnt != inp) {
				x[i].parentNode.removeChild(x[i]);
			}
		}
	}
}

/**
 * creates a new node object, if there didn't exist one with given class and name before
 *
 * @param {string} declaringClass - package and class of the method
 * @param {string} name - name of the method
 * @param {node} parentNode - node object the new node shall become a child of
 * @param {number} index - call-site-index of the child
 * @returns {node | null} - returns null, if node already existed, returns the new node otherwise
 */
function createNodeInstance(nodeData, parentNode, index) {
	var existingNode = nodeMap.get(idString(nodeData));
	var newNode;

	if (existingNode) {
		/* The node has already been created before, so it is just added as child to the parent node.
         */
		newNode = parentNode.addChild(index, nodeData, null);
		return undefined;
	}
	var jsonData = parsedJsonMap.get(idString(nodeData));
	if (!jsonData) {
		// If there doesn't exist an entry in the json-map, the function just creates an empty node without call-sites.
		if (!parentNode) {
			// In case that parentNode doesn't exist too, the user tries to find a not existing node through the search field.
			alert("\"" + rootNodeString + "\" does not exist in the JSON-file!");
			return;
		}
		newNode = parentNode.addChild(index, nodeData, []);
	}
	else {
		// In else case, the jsonData exists and the function always creates a new node. Now the call-site-information is copied for the new node.
		let callSites = [];
		let callSiteStats = [];
		for (let i = 0; i < jsonData.callSites.length; i++) {
			callSites.push(jsonData.callSites[i].declaredTarget.declaringClass + '.' + jsonData.callSites[i].declaredTarget.name);
			callSiteStats.push({ numberOfTargets: jsonData.callSites[i].targets.length, line: jsonData.callSites[i].line });
		}
		if (!parentNode) {
			// If parentNode doesn't exist, the user generates a new node through the search field.
			newNode = new node(nodeData, callSites, callSiteStats);
		}
		else {
			newNode = parentNode.addChild(index, nodeData, callSites, callSiteStats);
		}
	}
	if (newNode) nodeMap.set(idString(nodeData), newNode); // now the node object is added to the nodeMap
	return newNode;
}

/**
 * builds a graph of node objects based on the information of the json file
 *
 * @param {node} node - node object, where the creating build starts
 */
function createChildNodes(node) {
	let nodeData = node.getNodeData();
	let jsonData = parsedJsonMap.get(idString(nodeData));
	let callSites = [];
	if (jsonData) callSites = jsonData.callSites;

	// for all targets of all call sites this function is called recursively, to create the nodes of the lower children generations too
	for (let i = 0; i < callSites.length; i++) {
		for (let j = 0; j < callSites[i].targets.length; j++) {
			let target = callSites[i].targets[j];
			let childNode = createNodeInstance(target, node, i);
			if (childNode) createChildNodes(childNode);
		}
	}
}

/**
 * initiates the generation of the graph through parsing the input of the search field and starting the node creation
 */
function createGraph() {
	let rootNodeString = document.getElementById("searchInput").value;
	let rootNode = nodeMap.get(rootNodeString);
    if (!rootNode) rootNode = createNodeInstance(getNodeDataFromString(rootNodeString));
	if (rootNode) {
		if (!rootNode.getSizes().x) rootNode.placeCentrally();
		rootNode.showNode();
		rootNode.focus();
		rootNodes.push(rootNode);
		createChildNodes(rootNode);
		console.log(createdNodes + " additional nodes created");
		//update createdNodes in Graph Data
		estGraphData();
		createdNodes = 0;
	}
}


/**
* (only for testing)
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {
	module.exports.setProgBar = setProgBar;
}