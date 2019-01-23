//Rufe Suchfunktion mit gegebenen Eingaben aus
function callSearch(){
    search(document.getElementById("methodInput").value,document.getElementById("classInput").value);
}
//Suche nach Knoten mit gegebenem Methoden- und Klassennamen und gebe diesen Knoten zurück
function search(methodName, className) {
    var json = jsonQ(parsedJson).find("method");
    var index = json.index({"name": methodName, "declaringClass": className}, true);
    document.getElementById("demo").innerHTML = index != -1 ? "Knoten an Index " + index + " gefunden" : "Knoten nicht gefunden";
    if (index != -1) {
        return json.nthElm(index);
    }
}