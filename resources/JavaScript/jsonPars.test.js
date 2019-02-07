
const $ = require('jquery');
const d3 = require('d3');

document.body.innerHTML =
    '<div id="load_page"><form id="jsonFile" name="jsonFile" enctype="multipart/form-data" method="post"><fieldset>	<h2>Json File</h2> 	<div id="dropZone">You can Drop files here <br />' +
    '<input type="file" id="fileinput" onchange="loadFile()"></div> <br /><div id="progress_bar"><div id="progress" class="percent">0%</div></div> <br/>' +
    '</fieldset></form></div>' +
    '<div id="graph_page" class="invis"><div id="graph" style="position: relative; font-family: Helvetica"></div><div id="top_fixed" style="position: fixed; top: 10px; left: 10px">' +
    '<form autocomplete="off" onsubmit="return false" style="overflow: auto;"><div class="autocomplete" style="float: left; margin-right: 10px"><input type="text" name="searchClass" id="classInput" placeholder="Class-Path">' +
    '</div><div class="autocomplete" style="float: left; margin-right: 10px"><input type="text" name="searchMethod" id="methodInput" placeholder="Method"></div>' +
    '<input type="submit" id="search" disabled value="Find" onclick="callSearch(); createGraph()"></form><button id="btn" onclick="open_close()" style="margin-top: 10px">Hide Details</button>' +
    '</div><div id="bottom_fixed" style="position: fixed; bottom: 10px; left 10px; margin-left: 5px"><div id="totalNodes";>Total Nodes:</div><div id="totalEdges">Total Edges:' +
    '</div><div id="currentVisibleNodes">Current Nodes:</div><div id="currentVisibleEdges">Current Edges:</div></div></div>';

const jsonPars = require('./jsonPars');

//beforeEach(() => {
//    // Set up our document body
//    document.body.innerHTML =
//        '<div id="load_page"><form id="jsonFile" name="jsonFile" enctype="multipart/form-data" method="post"><fieldset>	<h2>Json File</h2> 	<div id="dropZone">You can Drop files here <br />' +
//        '<input type="file" id="fileinput" onchange="loadFile()"></div> <br /><div id="progress_bar"><div id="progress" class="percent">0%</div></div> <br/>' +
//        '</fieldset></form></div>' +
//        '<div id="graph_page" class="invis"><div id="graph" style="position: relative; font-family: Helvetica"></div><div id="top_fixed" style="position: fixed; top: 10px; left: 10px">' +
//        '<form autocomplete="off" onsubmit="return false" style="overflow: auto;"><div class="autocomplete" style="float: left; margin-right: 10px"><input type="text" name="searchClass" id="classInput" placeholder="Class-Path">' +
//        '</div><div class="autocomplete" style="float: left; margin-right: 10px"><input type="text" name="searchMethod" id="methodInput" placeholder="Method"></div>' +
//        '<input type="submit" id="search" disabled value="Find" onclick="callSearch(); createGraph()"></form><button id="btn" onclick="open_close()" style="margin-top: 10px">Hide Details</button>' +
//        '</div><div id="bottom_fixed" style="position: fixed; bottom: 10px; left 10px; margin-left: 5px"><div id="totalNodes";>Total Nodes:</div><div id="totalEdges">Total Edges:' +
//        '</div><div id="currentVisibleNodes">Current Nodes:</div><div id="currentVisibleEdges">Current Edges:</div></div></div>';
//
//})


test('Test setProgBar()', () => {
    jsonPars.setProgBar("100");
    expect(document.getElementById("progress").textContent).toBe("100%");
    expect(document.getElementById("progress").style.width).toEqual("100%");
});

