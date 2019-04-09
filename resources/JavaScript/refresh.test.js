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
let nodeData2 = { declaringClass: "Sub2", name: "sub1", parameterTypes: [], returnType: "int" };
let callSites2 = [{ declaredTarget: { declaringClass: "Sub3", name: "sub1", parameterTypes: [], returnType: "int" }, line: 13, targets: [{ declaringClass: "Sub3", name: "sub1", parameterTypes: [], returnType: "int" }] }];
let nodeData3 = { declaringClass: "Sub2", name: "sub2", parameterTypes: [], returnType: "int" };
let callSites3 = [{ declaredTarget: { declaringClass: "Subn", name: "sub1", parameterTypes: [], returnType: "int" }, line: 13, targets: [{ declaringClass: "Subn", name: "sub1", parameterTypes: [], returnType: "int" }] }];
let nodeData4 = { declaringClass: "Sub3", name: "sub1", parameterTypes: [], returnType: "int" };
let callSites4 = [{ declaredTarget: { declaringClass: "Subn", name: "sub1", parameterTypes: [], returnType: "int" }, line: 13, targets: [{ declaringClass: "Subn", name: "sub1", parameterTypes: [], returnType: "int" }] }];
let nodeData5 = { declaringClass: "Subn", name: "sub1", parameterTypes: [], returnType: "int" };
let callSites5 = [{ declaredTarget: { declaringClass: "Sub2", name: "sub1", parameterTypes: [], returnType: "int" }, line: 13, targets: [{ declaringClass: "Sub2", name: "sub1", parameterTypes: [], returnType: "int" }] }];

const nodes = require('./nodes');
const index = require('./index');

let SubRootNode, sub2Sub1, sub2Sub2, sub3Sub1, subnSub1;

test('Test GeneratedNodes', () => {

    expect(generatedNodes).toEqual(0);
    expect(totalNodes).toEqual(0);
    expect(totalEdges).toEqual(0);


    // create graphs
    SubRootNode = new nodes.node(nodeData1, callSites1);
    nodeMap.set(index.idString(nodeData1), SubRootNode);
    SubRootNode.placeCentrally();

    expect(generatedNodes).toEqual(1);
    expect(totalNodes).toEqual(0);
    expect(totalEdges).toEqual(0);

    sub2Sub1 = SubRootNode.addChild(0, nodeData2, callSites2);
    nodeMap.set(index.idString(nodeData2), sub2Sub1);
    sub2Sub2 = SubRootNode.addChild(1, nodeData3, callSites3);
    nodeMap.set(index.idString(nodeData3), sub2Sub2);
    sub3Sub1 = sub2Sub1.addChild(0, nodeData4, callSites4);
    nodeMap.set(index.idString(nodeData4), sub3Sub1);

    expect(generatedNodes).toEqual(4);

    subnSub1 = sub3Sub1.addChild(0, nodeData5, callSites5);
    nodeMap.set(index.idString(nodeData5), subnSub1);


    expect(generatedNodes).toEqual(5);
    expect(totalNodes).toEqual(0);
    expect(totalEdges).toEqual(0);

});

test('Test Currently Shown Nodes/Edges', () => {

    //start showing the Nodes
    SubRootNode.showNode();
    SubRootNode.showChildNodes(0);
    SubRootNode.showChildNodes(1);

    //test
    expect(currentEdges).toEqual(2);
    expect(currentNodes).toEqual(3);

    //show the Nodes, no edge between Subn.sub1 to Sub2.sub1
    sub2Sub2.showChildNodes(0);
    sub2Sub1.showChildNodes(0);
    sub3Sub1.showChildNodes(0);

    //test
    expect(generatedNodes).toEqual(5);
    expect(currentEdges).toEqual(5);
    expect(currentNodes).toEqual(5);

    //hide some nodes    
    sub2Sub2.hideNode();

    //test
    expect(generatedNodes).toEqual(5);
    expect(currentEdges).toEqual(3);
    expect(currentNodes).toEqual(4);

    SubRootNode.hideNode();
    //test
    expect(generatedNodes).toEqual(5);
    expect(currentEdges).toEqual(0);
    expect(currentNodes).toEqual(0);

    //show the Nodes, no edge between Sub2.sub2 to Subn.sub1
    SubRootNode.showNode();
    SubRootNode.showChildNodes(0);
    SubRootNode.showChildNodes(1);
    sub2Sub1.showChildNodes(0);
    sub3Sub1.showChildNodes(0);
    subnSub1.showChildNodes(0);

    //test
    expect(generatedNodes).toEqual(5);
    expect(currentEdges).toEqual(5);
    expect(currentNodes).toEqual(5);

    //hide some nodes
    sub3Sub1.hideNode();

    //test
    expect(currentEdges).toEqual(2);
    expect(currentNodes).toEqual(3);

    //show the Nodes, all edges
    SubRootNode.hideNode();
    SubRootNode.showNode();
    SubRootNode.showChildNodes(0);
    SubRootNode.showChildNodes(1);
    sub2Sub1.showChildNodes(0);
    sub2Sub2.showChildNodes(0);
    sub3Sub1.showChildNodes(0);
    subnSub1.showChildNodes(0);

    //test
    expect(currentEdges).toEqual(6);
    expect(currentNodes).toEqual(5);

    //hide some nodes
    sub2Sub1.hideNode();

    //test
    expect(currentEdges).toEqual(2);
    expect(currentNodes).toEqual(3);

});