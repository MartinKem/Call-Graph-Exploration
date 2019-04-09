/* BSD 2-Clause License - see ./LICENSE for details. */


document.body.innerHTML =
    '<div id="load_page">' +
    '<form id="jsonFile" name="jsonFile" enctype="multipart/form-data" method="post">' +
    '<fieldset>' +
    '<h2>Json File</h2>' +
    '<div id="dropZone">You can Drop files here <br>' +
    '<input type="file" id="fileinput" onchange="loadFile()">' +
    '</div>' +
    '<br><div id="progress_bar"><div id="progress" class="percent">0%</div>' +
    '</div><br>' +
    '</fieldset>' +
    '</form>' +
    '</div>' +
    '<div id="graph_page" class="invis">' +
    '<div id="graph" style="position: relative; font-family: Helvetica"></div>' +
    '<div id="top_fixed" style="position: fixed; top: 10px; left: 10px">' +
    '<form autocomplete="off" onsubmit="return false" style="overflow: auto;">' +
    '<div class="autocomplete" style="float: left; margin-right: 10px">' +
    '<input type="text" name="searchClass" id="classInput" placeholder="Class-Path">' +
    '</div>' +
    '<div class="autocomplete" style="float: left; margin-right: 10px">' +
    '<input type="text" name="searchMethod" id="methodInput" placeholder="Method">' +
    '</div>' +
    '<input type="submit" id="search" disabled value="Find" onclick="callSearch(); createGraph()">' +
    '</form>' +
    '<button id="btn" onclick="open_close()" style="margin-top: 10px">Hide Details</button>' +
    '</div>' +
    '<div id="bottom_fixed" style="position: fixed; bottom: 10px; left 10px; margin-left: 5px">' +
    '<div id="totalNodes";>Total Nodes:</div>' +
    '<div id="totalEdges">Total Edges:</div>' +
    '<div id="generatedNodes">Generated Nodes:</div>' +
    '<div id="currentVisibleNodes">Current Nodes:</div>' +
    '<div id="currentVisibleEdges">Current Edges:</div>' +
    '</div>' +
    '</div>';

let nodeData1 = { declaringClass: "Main", name: "main", parameterTypes: [""], returnType: "int" };
let callSites1 = [{ declaredTarget: { declaringClass: "Sub2", name: "sub1", parameterTypes: [], returnType: "int" }, line: 13, targets: [{ declaringClass: "Sub2", name: "sub1", parameterTypes: [], returnType: "int" }] },
{ declaredTarget: { declaringClass: "Sub2", name: "sub2", parameterTypes: [], returnType: "int" }, line: 13, targets: [{ declaringClass: "Sub2", name: "sub2", parameterTypes: [], returnType: "int" }] }];

const nodes = require('./nodes');
const index = require('./index');
const contextmenu = require("./contextmenu");

// create graphs
let SubRootNode = new nodes.node(nodeData1, callSites1);
nodeMap.set(index.idString(nodeData1), SubRootNode);
SubRootNode.placeCentrally();


test("Color Node", () => {
    //show and get Node
    SubRootNode.showNode();
    let SubRootNodeHtml = document.getElementById("Main.main():int");
    clickedNode = SubRootNodeHtml;

    //color node
    contextmenu.changeColorNode("#ffc6c6");

    // testing
    expect(SubRootNodeHtml.style.backgroundColor).toEqual("rgb(255, 198, 198)");
    expect($(SubRootNodeHtml).children(".nodeHeader").css("background-color")).toEqual("rgb(255, 198, 198)");

});