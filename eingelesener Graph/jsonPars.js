var strJson = "";
var arr = [];
var parsedJson;

var mapUsed = 0;

//Add the events for the drop zone
var dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);


function setProgBarToZero() {
	//get progress element from html and set it to 0
	var progress = document.getElementById("progress");
	progress.style.width = '0%';
	progress.textContent = '0%';
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; //shows it is a copy
}

function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer.files; // FileList object.

	document.getElementById('fileinput').files = files; // set new file
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

	let input = document.getElementById('fileinput').files[0];
	//graphJ = loadJsonFile(input);
	parseFile(input, setString);
}

function parseString() {
	var rest = "";
	var finalarray;

	var correctJsonStr = correctDeclaredClass(strJson);
	arr.push(correctJsonStr);
	strJson = correctJsonStr;
	arr.forEach(function (a) {
		a = rest + a;
		var first = a.indexOf("\n    \"method\" : {") - 1;
		var last = a.lastIndexOf("\n    \"method\" : {") - 3;

		if (finalarray == null) { finalarray = JSON.parse("{\n  \"reachableMethods\" : [ " + a.slice(first, last) + " ]\n}").reachableMethods; }
		else { Array.prototype.push.apply(finalarray, JSON.parse("{\n  \"reachableMethods\" : [ " + a.slice(first, last) + " ]\n}").reachableMethods) }

		rest = a.slice(last);


	});
	
	//console.log(finalarray)
	// console.log(JSON.parse("{\n  \"reachableMethods\" : [ "+rest.slice(rest.indexOf("\n    \"method\" : {")-1,-3)+" ]\n}"));
	Array.prototype.push.apply(finalarray, JSON.parse("{\n  \"reachableMethods\" : [ " + rest.slice(rest.indexOf("\n    \"method\" : {") - 1, -3) + " ]\n}").reachableMethods);
	parsedJson = { reachableMethods: finalarray };

	//Initialisiere Autovervollständigung
    // var jsonQObject = jsonQ(parsedJson);
    // var methodList = jsonQ.sort(jsonQObject.find("name").unique());
    // var classList = jsonQ.sort(jsonQObject.find("declaringClass").unique());

    // autocomplete(document.getElementById("classInput"), classList);
	// autocomplete(document.getElementById("methodInput"), methodList);
	
	return parsedJson;

}

function correctDeclaredClass(str){
	str = str.replace(/\"declaringClass\" : \"L/g, "\"declaringClass\" : \"");
	str = str.replace(/;\",\n/g, "\",\n");
	return str;
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
			var parsedJson = parseString();

			//progress to 100%
			var progress = document.getElementById("progress");
			progress.style.width = '100%';
			progress.textContent = '100%';
			
			changeDiv();
			(function reset() {
				strJson = "";
				arr = [];
			})();

			console.log(parsedJson);
			return;

		}

		// of to the next chunk
		
		chunkReaderBlock(offset, chunkSize, file);
	}

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
					progress.style.width = percentLoaded + '%';
					progress.textContent = percentLoaded + '%';
				}
			}
		};
		r.readAsText(blob);
	}



	// now let's start the read with the first block
	chunkReaderBlock(offset, chunkSize, file);
}
function changeDiv() {
	$("#load_page").addClass("invis");
	//$("#search_page").removeClass("invis");
	$("#graph_page").removeClass("invis");

}

//Eingabe bei gegebenem Texteingabefeld mit gegebenem Stringarray autovervollständigen 
function autocomplete(inp, arr) {
    //2 Parameter, Textfeld und Array mit Vervollständigungsdaten
    var currentFocus = 0;
    //Texteingabe erkennen
    inp.addEventListener("input", function(e) {
        var div, items, i, value = this.value;
        //Alle offenen Listen schließen
        closeAllLists();
        //Unterbrechen, wenn das Textfeld leer ist
        if (!value) { return false;}
        currentFocus = -1;
        //DIV Element erstellen, das alle Vervollständigungsvorschläge enthält
        div = document.createElement("DIV");
        div.setAttribute("id", this.id + "autocomplete-list");
        div.setAttribute("class", "autocomplete-items");
        //Füge das DIV Element dem Container als Kindelement hinzu
        this.parentNode.appendChild(div);
        for (i = 0; i < arr.length; i++) {
          //Prüfe, ob die eingegebenen Zeichen mit dem Anfang des Vorschlags übereinstimmen
          if (arr[i].substr(0, value.length).toUpperCase() == value.toUpperCase()) {
            //Erstelle DIV Element für jeden übereinstimmenden Vorschlag
            items = document.createElement("DIV");
            //Hebe übereinstimmende Zeichen als fettgedruckt hervor
            items.innerHTML = "<strong>" + arr[i].substr(0, value.length) + "</strong>";
            items.innerHTML += arr[i].substr(value.length);
            //Erstelle INPUT Feld, das den aktuellen Wert der Vorschlags enthält
            items.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            //Führe die übergebene Funktion bei Knopfdruck des Elements aus
                items.addEventListener("click", function(e) {
                //Füge den Vervollständigungsvorschlag in das Textfeld ein
                inp.value = this.getElementsByTagName("input")[0].value;
                //Alle offenen Listen schließen
                closeAllLists();
            });
            div.appendChild(items);
            //Schleife unterbrechen wenn 10 Elemente gefunden wurden
            if (div.childElementCount >= 10) {break;}
          }
        }
    });
    //Führe eine Funktion aus, wenn die Tastatur betätigt wird
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          //Erhöhe aktuellen Fokus bei Pfeiltaste UNTEN
          currentFocus++;
          //Hebe aktuelles Listenelement hervor
          addActive(x);
        } else if (e.keyCode == 38) {
          //Verringere aktuellen Fokus bei Pfeiltaste HOCH
          currentFocus--;
          //Hebe aktuelles Listenelement hervor
          addActive(x);
        } else if (e.keyCode == 13) {
          //Verhindere, dass ein Formular gesendet wird, wenn ENTER gedrückt wird
          e.preventDefault();
          if (currentFocus > -1) {
            //Simuliere Klick auf Listenelement
            if (x) x[currentFocus].click();
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
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      //Schließe alle offenen Autovervollständigungslisten mit Ausnahme der übergebenen
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}


function waitForJsonFinishedParsing(){
	var timeoutCounter = 0;
	var intvl = setInterval(function() {
		if (parsedJson == undefined){
			console.log("Waiting for Json getting parsed");
			timeoutCounter++;
			if(timeoutCounter == 1000){
				console.log("Waiting for json parsing timed out! (100s)");
				clearInterval(intvl);
			}
		}
		else{	// ONLY in this else-block json file has finished parsing
			console.log("finished parsing");
			clearInterval(intvl);
			rootNode = createNodeInstance("tmr/Demo", "main");
			//rootNode = createNodeInstance("org/apache/xalan/xslt/Process", "main");
			// rootNode = createNodeInstance("Lsun/tools/jar/Main$1;", "add");
			rootNode.showNode();
			document.getElementsByTagName('html')[0].scrollLeft = parseInt(vis.attr('width'))/2 - window.innerWidth/2;
			document.getElementsByTagName('html')[0].scrollTop = parseInt(vis.attr('height'))/2 - window.innerHeight/2;
			console.log("start creating child nodes");
			createChildNodes(rootNode, 0);
			console.log("finished creating child nodes");
			console.log(createdNodes);
			console.log("hashmap was used", mapUsed, "times");
		}
	}, 100);	
}

function getJsonNodeByName(declaringClass, name){	
	var jsonData;
	for(var i = 0; i < parsedJson.reachableMethods.length; i++){
		if(parsedJson.reachableMethods[i].method.declaringClass == declaringClass
			&& parsedJson.reachableMethods[i].method.name == name){
			
			jsonData = parsedJson.reachableMethods[i];
			break;
		}
	}
	return jsonData;
}

function createNodeInstance(declaringClass, name, parentNode, source){
	var existingNode = nodeMap.get(declaringClass+'.'+name);
	var newNode;
	if(existingNode){
		newNode = parentNode.addChild(source, declaringClass + '.' + name, []);
		mapUsed++;
		return newNode;
	}
	var jsonData = getJsonNodeByName(declaringClass, name);
	if(!jsonData) newNode = parentNode.addChild(source, declaringClass + '.' + name, []);
	else{
		var callSites = [];
		for(var i = 0; i < jsonData.callSites.length; i++){
			callSites.push(jsonData.callSites[i].declaredTarget.declaringClass + '.' + jsonData.callSites[i].declaredTarget.name);
		}
		if(!parentNode) newNode = new node(null, declaringClass + '.' + name, callSites);
		else newNode = parentNode.addChild(source, declaringClass + '.' + name, callSites);
	}
	if(newNode) nodeMap.set(declaringClass + '.' + name, newNode);
	return newNode;
}

function createChildNodes(node, depth){
	// if(depth > 2) return;
	var declaringClass = node.getName().split(".")[0];
	var name = node.getName().split(".")[1];
	var jsonData = getJsonNodeByName(declaringClass, name);
	var callSites = [];
	if(jsonData) callSites = jsonData.callSites;
	for(var i = 0; i < callSites.length; i++){
		for(var j = 0; j < callSites[i].targets.length; j++){
			var target = callSites[i].targets[j];
			var childNode = createNodeInstance(target.declaringClass, target.name, node, i);
			if(childNode) createChildNodes(childNode, depth+1);
		}
	}
	// console.log("created child-nodes for: ", node.getName());
}