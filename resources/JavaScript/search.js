// ------------- functions in this file not used anymore -----------------------

//Rufe Suchfunktion mit gegebenen Eingaben aus
function callSearch(){
}
//Suche nach Knoten mit gegebenem Methoden- und Klassennamen und gebe diesen Knoten zurück
function search(methodName, className) {
	return parsedJsonMap.get(className + '.' + methodName);
}