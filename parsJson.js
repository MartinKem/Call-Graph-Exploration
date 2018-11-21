

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

//var graphJ;
//
//function loadJSON(callback) {   
//
//    var xobj = new XMLHttpRequest();
//        xobj.overrideMimeType("application/json");
//    xobj.open('GET', 'test.json', true); // Replace 'my_data' with the path to your file
//    xobj.onreadystatechange = function () {
//          if (xobj.readyState == 4 && xobj.status == "200") {
//            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
//            callback(xobj.responseText);
//          }
//    };
//    xobj.send(null);  
// }
//
//
// function init() {
//    document.write("Start");
//    loadJSON(function(response) {
//     // Parse JSON string into object
//       graphJ = JSON.parse(response);
//       document.write(graphJ);
//    });
//    document.write("End");
//    document.write(graphJ.reachableMethods[0].method.declaringClass);
//    document.write("Test" + graphJ.reachableMethods[0]);
//    document.write("2End2");
//   }


function loadJsonFile(input) {
    var file, fr;
    var fileIsLoaded = false;
    var returnFile = new FileLoad(fileIsLoaded);


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
      fr.onload = receivedText;
      fr.readAsText(file);
      return returnFile;
    }

    function receivedText(e) {
      let lines = e.target.result;
      returnFile.file = JSON.parse(lines);
      returnFile.isLoaded = true;

    }


  }

  function FileLoad(isLoaded){
    this.file = undefined;
    this.isLoaded = isLoaded;
  }