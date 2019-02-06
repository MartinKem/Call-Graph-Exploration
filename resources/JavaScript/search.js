//Rufe Suchfunktion mit gegebenen Eingaben aus
function callSearch(){
	rootNodeString = [document.getElementById("classInput").value, document.getElementById("methodInput").value];
    // rootNodeString = search(document.getElementById("methodInput").value, document.getElementById("classInput").value);
	// console.log(rootNodeString);
}
//Suche nach Knoten mit gegebenem Methoden- und Klassennamen und gebe diesen Knoten zurück
function search(methodName, className) {
	return parsedJsonMap.get(className + '.' + methodName);
    // var json = jsonQ(parsedJson).find("method");
    // var index = json.index({"name": methodName, "declaringClass": className}, true);
    // document.getElementById("demo").innerHTML = index != -1 ? "Knoten an Index " + index + " gefunden" : "Knoten nicht gefunden";
    // if (index != -1) {
		// console.log(json.Elm(index));
        // return json.nthElm(index);
    // }
}