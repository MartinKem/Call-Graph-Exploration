

// geht leider nicht mit Chrome, Außer über http(andere Server oder localhost server)
//function init(){
//    document.getElementById("demo").innerHTML = "Start";
//var xmlhttp = new XMLHttpRequest();
//xmlhttp.overrideMimeType("application/json");
//xmlhttp.onreadystatechange = function() {
//    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//        var graphJ = JSON.parse(xmlhttp.response);
//        document.getElementById("demo").innerHTML = graphJ.reachableMethods[0].method.declaringClass;
//    }
//};
//xmlhttp.open("GET", "cg.json", true);
//xmlhttp.send();
//
//}


/**
 * is loading a JSON file
 * and returns a FileLoad Object with a parst file in it.
 * @param {JSON input file from <input type='file'>} input 
 */
function loadJsonFile(input) {
    var file, fr;
    var fileIsLoaded = false;
    var returnFile = new FileLoad(fileIsLoaded);

    //get progress element from html and set it to 0
    var progress = document.getElementById("progress");
    progress.style.width = '0%';
    progress.textContent = '0%';

    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
    }
    else {
      file = input.files[0];
      fr = new FileReader();
      fr.onprogress = updateProgress;
      fr.onload = receivedText;
      fr.onerror = fileError;
      fr.readAsText(file);
      return returnFile;
    }


    function updateProgress(evt) {
      // evt is an ProgressEvent.
      if (evt.lengthComputable) {
        var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
        // Increase the progress bar length.
        if (percentLoaded < 100) {
          progress.style.width = percentLoaded + '%';
          progress.textContent = percentLoaded + '%';
        }
      }
    }

    //get result, parse and set it in the returnt object
    function receivedText(e) {
      let lines = e.target.result;
      if (lines === ""){
        alert("File is empty");
        return;
      }
      returnFile.file = JSON.parse(lines);
      returnFile.isLoaded = true;
      //set progress to 100%
      progress.style.width = '100%';
      progress.textContent = '100%';
	  
    }

    // if an error occurs on the file load
    function fileError(e){
      alert("Error on file read");
    }

  }

  /**
   * Object with a file and a boolen
   * @param {boolean if the file is set} isLoaded 
   */
  function FileLoad(isLoaded){
    this.file = undefined;
    this.isLoaded = isLoaded;
  }