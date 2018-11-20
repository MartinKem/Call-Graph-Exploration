//Javascript Objekt, das die JSON Datei enthält
var newArr;

//Aktionen die beim drücken von "Load" ausgeführt werden (Code aus dem Internet)
function loadFile() {
    var input, file, fr;

    if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('fileinput');
    if (!input) {
        alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
        alert("This browser doesn't seem to support the files property of file inputs.");
    }
    else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load'");
    }
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedText;
        fr.readAsText(file);
    }

    function receivedText(e) {
        let lines = e.target.result;
        //Parsen der JSON Struktur in Javascript variable
        newArr = JSON.parse(lines);
    }
}

// Suchfunktion die den im Browser eingegebenen Text in den Klassennamen sucht. Sehr schlechte Performanz
function setElement() {
    var text = document.getElementById("text").value;
    var json = jsonQ(newArr);
    classes = json.find("declaringClass");


    for (var i = 0; i < classes.length; i++) {
        if (classes.value()[i].includes(text)) {
            document.getElementById("demo").innerHTML = "true";
        }
        console.log(i);
    }
}

//Alternative Suchfunktion mit gleichem Zweck die allerdings jsonQ benutzt für bessere Performanz
//Läuft aktuell noch nicht so wie gewollt. Wir können lediglich alle Klassennamen anzeigen
function setElement2() {
    var text2 = document.getElementById("text").value;
    var json2 = jsonQ(newArr);
    classes2 = json2.find("declaringClass");

    document.getElementById("demo").innerHTML = classes2.value();

    //var searchedClass = jsonQ.contains(json2, {"declaringClass": text}, true);
    //document.getElementById("demo").innerHTML = searchedClasses;
}