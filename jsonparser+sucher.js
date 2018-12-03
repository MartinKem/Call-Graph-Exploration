//Javascript Objekt FileLoad, das die JSON Datei enthält
var fileObj;

//Add the events for the drop zone
var dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);


function setProgBarToZero(){
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

//Aktionen die beim drücken von "Load" ausgeführt werden 
function loadFile() {
    var input, file, fr;

    if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('fileinput');
    fileObj = loadJsonFile(input);
}

// Suchfunktion die den im Browser eingegebenen Text in den Klassennamen sucht. Sehr schlechte Performanz
function setElement() {

    if(fileObj === undefined || !fileObj.isLoaded){
        alert("File is not loaded yet.");
        return;
    }

    var text = document.getElementById("text").value;
    var json = jsonQ(fileObj.file);
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

    if(fileObj === undefined || !fileObj.isLoaded){
        alert("File is not loaded yet.");
        return;
    }

    var text2 = document.getElementById("text").value;
    var json2 = jsonQ(fileObj.file);
    classes2 = json2.find("declaringClass");

    document.getElementById("demo").innerHTML = classes2.value();

    //var searchedClass = jsonQ.contains(json2, {"declaringClass": text}, true);
    //document.getElementById("demo").innerHTML = searchedClasses;
}