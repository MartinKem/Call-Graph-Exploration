
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

//const jsonPars = require('./jsonPars');
const nodes = require('./nodes.js');

test('Test hide of nodes', () => {
    let rootNode = new nodes.node(null,"Main.main",["Sub1.sub1"],[{numberOfTargets: 2, line: 4}],["int"],"int");
    rootNode.showNode();
    let sub2Sub1 = rootNode.addChild(0,"Sub2.sub1",["Sub3.sub1"],[{numberOfTargets: 1, line: 2}],["int"],"int");
    let sub2Sub2 = rootNode.addChild(0,"Sub2.sub2",["Subn.sub1"],[{numberOfTargets: 1, line: 2}],["int"],"int");
    let sub3Sub1 = sub2Sub1.addChild(0,"Sub3.sub1",["Subn.sub1"],[{numberOfTargets: 1, line: 2}],["int"],"int");
    let subnSub1 = sub3Sub1.addChild(0,"Subn.sub1",["Sub2.sub1"],[{numberOfTargets: 1, line: 2}],["int"],"int");

    expect(rootNode.getVisibility()).toBe(true);
});