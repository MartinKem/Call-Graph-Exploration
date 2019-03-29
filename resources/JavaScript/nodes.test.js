
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

// create graphs
let SubRootNode = new nodes.node(nodeData1, callSites1);
nodeMap.set(index.idString(nodeData1), SubRootNode);
SubRootNode.placeCentrally();
let sub2Sub1 = SubRootNode.addChild(0, nodeData2, callSites2);
nodeMap.set(index.idString(nodeData2), sub2Sub1);
let sub2Sub2 = SubRootNode.addChild(1, nodeData3, callSites3);
nodeMap.set(index.idString(nodeData3), sub2Sub2);
let sub3Sub1 = sub2Sub1.addChild(0, nodeData4, callSites4);
nodeMap.set(index.idString(nodeData4), sub3Sub1);
let subnSub1 = sub3Sub1.addChild(0, nodeData5, callSites5);
nodeMap.set(index.idString(nodeData5), subnSub1);



test('Test hide of nodes 1', () => {

    //show the Nodes, no edge between Subn.sub1 to Sub2.sub1
    SubRootNode.hideNode();
    SubRootNode.showNode();
    SubRootNode.showChildNodes(0);
    SubRootNode.showChildNodes(1);
    sub2Sub2.showChildNodes(0);
    sub2Sub1.showChildNodes(0);
    sub3Sub1.showChildNodes(0);

    SubRootNode.hideNode();         //
    SubRootNode.showNode();         //
    SubRootNode.showChildNodes(0);  //
    SubRootNode.showChildNodes(1);  // For setting display = block via javascript
    sub2Sub2.showChildNodes(0);     //
    sub2Sub1.showChildNodes(0);     //
    sub3Sub1.showChildNodes(0);     //

    //get the html elements
    let SubRootNodeHtml = document.getElementById("Main.main():int");
    let sub2Sub2Html = document.getElementById("Sub2.sub2():int");
    let sub2Sub1Html = document.getElementById("Sub2.sub1():int");
    let sub3Sub1Html = document.getElementById("Sub3.sub1():int");
    let subnSub1Html = document.getElementById("Subn.sub1():int");




    let numberOfGeneratedNodes = 0;
    let numberOfGeneratedEdges = 0;
    let svg = document.getElementById("graph").firstChild;
    for (let i = 0; i < global.svgCont[0][0].childNodes.length; i++) {
       if (svg.childNodes[i].nodeName === "foreignObject") numberOfGeneratedNodes++;
       else if (svg.childNodes[i].nodeName === "path") numberOfGeneratedEdges++;
    }

    expect(numberOfGeneratedEdges).toBe(5);
    expect(numberOfGeneratedEdges).toBe(5);



    // make sure it works
    expect(SubRootNode.getVisibility()).toBe(true);
    expect(sub2Sub1.getVisibility()).toBe(true);
    expect(sub2Sub2.getVisibility()).toBe(true);
    expect(sub3Sub1.getVisibility()).toBe(true);
    expect(subnSub1.getVisibility()).toBe(true);
    expect(SubRootNodeHtml.style.display).toEqual("block");
    expect(sub2Sub2Html.style.display).toEqual("block");
    expect(sub2Sub1Html.style.display).toEqual("block");
    expect(sub3Sub1Html.style.display).toEqual("block");
    expect(subnSub1Html.style.display).toEqual("block");






    //hide some nodes    
    sub2Sub2.hideNode();

    //make sure the right ones are hidden
    expect(SubRootNode.getVisibility()).toBe(true);
    expect(sub2Sub1.getVisibility()).toBe(true);
    expect(sub2Sub2.getVisibility()).toBe(false);
    expect(sub3Sub1.getVisibility()).toBe(true);
    expect(subnSub1.getVisibility()).toBe(true);
    expect(SubRootNodeHtml.style.display).toEqual("block");
    expect(sub2Sub2Html.style.display).toEqual("none");
    expect(sub2Sub1Html.style.display).toEqual("block");
    expect(sub3Sub1Html.style.display).toEqual("block");
    expect(subnSub1Html.style.display).toEqual("block");

    //show the Nodes, all edges exept between Sub2.sub2 to Subn.Sub1
    SubRootNode.hideNode();
    SubRootNode.showNode();
    SubRootNode.showChildNodes(0);
    SubRootNode.showChildNodes(1);
    sub2Sub1.showChildNodes(0);
    subnSub1.showChildNodes(0);
    sub3Sub1.showChildNodes(0);

    //hide some nodes
    sub2Sub1.hideNode();

    //make sure the right ones are hidden
    expect(SubRootNode.getVisibility()).toBe(true);
    expect(sub2Sub1.getVisibility()).toBe(false);
    expect(sub2Sub2.getVisibility()).toBe(true);
    expect(sub3Sub1.getVisibility()).toBe(false);
    expect(subnSub1.getVisibility()).toBe(false);
    expect(SubRootNodeHtml.style.display).toEqual("block");
    expect(sub2Sub2Html.style.display).toEqual("block");
    expect(sub2Sub1Html.style.display).toEqual("none");
    expect(sub3Sub1Html.style.display).toEqual("none");
    expect(subnSub1Html.style.display).toEqual("none");

    //show the Nodes, no edge between Sub2.sub2 to Subn.sub1
    SubRootNode.hideNode();
    SubRootNode.showNode();
    SubRootNode.showChildNodes(0);
    SubRootNode.showChildNodes(1);
    sub2Sub1.showChildNodes(0);
    sub3Sub1.showChildNodes(0);
    subnSub1.showChildNodes(0);

    //hide some nodes
    sub3Sub1.hideNode();

    //make sure the right ones are hidden
    expect(SubRootNode.getVisibility()).toBe(true);
    expect(sub2Sub1.getVisibility()).toBe(true);
    expect(sub2Sub2.getVisibility()).toBe(true);
    expect(sub3Sub1.getVisibility()).toBe(false);
    expect(subnSub1.getVisibility()).toBe(false);
    expect(SubRootNodeHtml.style.display).toEqual("block");
    expect(sub2Sub2Html.style.display).toEqual("block");
    expect(sub2Sub1Html.style.display).toEqual("block");
    expect(sub3Sub1Html.style.display).toEqual("none");
    expect(subnSub1Html.style.display).toEqual("none");

    //show the Nodes, all edges
    SubRootNode.hideNode();
    SubRootNode.showNode();
    SubRootNode.showChildNodes(0);
    SubRootNode.showChildNodes(1);
    sub2Sub1.showChildNodes(0);
    sub2Sub2.showChildNodes(0);
    sub3Sub1.showChildNodes(0);
    subnSub1.showChildNodes(0);

    //hide some nodes
    sub3Sub1.hideNode();

    //make sure the right ones are hidden
    expect(SubRootNode.getVisibility()).toBe(true);
    expect(sub2Sub1.getVisibility()).toBe(true);
    expect(sub2Sub2.getVisibility()).toBe(true);
    expect(sub3Sub1.getVisibility()).toBe(false);
    expect(subnSub1.getVisibility()).toBe(true);
    expect(SubRootNodeHtml.style.display).toEqual("block");
    expect(sub2Sub2Html.style.display).toEqual("block");
    expect(sub2Sub1Html.style.display).toEqual("block");
    expect(sub3Sub1Html.style.display).toEqual("none");
    expect(subnSub1Html.style.display).toEqual("block");

});


test('Test hide of nodes 2', () => {

    //show the Nodes, all edges exept subn.sub1 to sub2.sub1
    SubRootNode.hideNode();
    SubRootNode.showNode();
    SubRootNode.showChildNodes(0);
    SubRootNode.showChildNodes(1);
    sub2Sub2.showChildNodes(0);
    sub2Sub1.showChildNodes(0);
    sub3Sub1.showChildNodes(0);

    SubRootNode.hideNode();         //
    SubRootNode.showNode();         //
    SubRootNode.showChildNodes(0);  //
    SubRootNode.showChildNodes(1);  // For setting display = block via javascript
    sub2Sub2.showChildNodes(0);     //
    sub2Sub1.showChildNodes(0);     //
    sub3Sub1.showChildNodes(0);     //

    //get the html elements
    let SubRootNodeHtml = document.getElementById("Main.main():int");
    let sub2Sub2Html = document.getElementById("Sub2.sub2():int");
    let sub2Sub1Html = document.getElementById("Sub2.sub1():int");
    let sub3Sub1Html = document.getElementById("Sub3.sub1():int");
    let subnSub1Html = document.getElementById("Subn.sub1():int");


    // make sure it works
    expect(SubRootNode.getVisibility()).toBe(true);
    expect(sub2Sub1.getVisibility()).toBe(true);
    expect(sub2Sub2.getVisibility()).toBe(true);
    expect(sub3Sub1.getVisibility()).toBe(true);
    expect(subnSub1.getVisibility()).toBe(true);
    expect(SubRootNodeHtml.style.display).toEqual("block");
    expect(sub2Sub2Html.style.display).toEqual("block");
    expect(sub2Sub1Html.style.display).toEqual("block");
    expect(sub3Sub1Html.style.display).toEqual("block");
    expect(subnSub1Html.style.display).toEqual("block");

    //hide some nodes
    sub2Sub2.hideNode();

    //make sure the right ones are hidden
    expect(SubRootNode.getVisibility()).toBe(true);
    expect(sub2Sub1.getVisibility()).toBe(true);
    expect(sub2Sub2.getVisibility()).toBe(false);
    expect(sub3Sub1.getVisibility()).toBe(true);
    expect(subnSub1.getVisibility()).toBe(true);
    expect(SubRootNodeHtml.style.display).toEqual("block");
    expect(sub2Sub2Html.style.display).toEqual("none");
    expect(sub2Sub1Html.style.display).toEqual("block");
    expect(sub3Sub1Html.style.display).toEqual("block");
    expect(subnSub1Html.style.display).toEqual("block");


    //show the Nodes, all edges
    SubRootNode.hideNode();
    SubRootNode.showNode();
    SubRootNode.showChildNodes(0);
    SubRootNode.showChildNodes(1);
    sub2Sub2.showChildNodes(0);
    sub2Sub1.showChildNodes(0);
    sub3Sub1.showChildNodes(0);
    subnSub1.showChildNodes(0);

    // make sure it works
    expect(SubRootNode.getVisibility()).toBe(true);
    expect(sub2Sub1.getVisibility()).toBe(true);
    expect(sub2Sub2.getVisibility()).toBe(true);
    expect(sub3Sub1.getVisibility()).toBe(true);
    expect(subnSub1.getVisibility()).toBe(true);
    expect(SubRootNodeHtml.style.display).toEqual("block");
    expect(sub2Sub2Html.style.display).toEqual("block");
    expect(sub2Sub1Html.style.display).toEqual("block");
    expect(sub3Sub1Html.style.display).toEqual("block");
    expect(subnSub1Html.style.display).toEqual("block");

    //hide some nodes
    sub2Sub2.hideNode();

    //make sure the right ones are hidden
    expect(SubRootNode.getVisibility()).toBe(true);
    expect(sub2Sub1.getVisibility()).toBe(true);
    expect(sub2Sub2.getVisibility()).toBe(false);
    expect(sub3Sub1.getVisibility()).toBe(true);
    expect(subnSub1.getVisibility()).toBe(true);
    expect(SubRootNodeHtml.style.display).toEqual("block");
    expect(sub2Sub2Html.style.display).toEqual("none");
    expect(sub2Sub1Html.style.display).toEqual("block");
    expect(sub3Sub1Html.style.display).toEqual("block");
    expect(subnSub1Html.style.display).toEqual("block");


    //show the Nodes, all edges
    SubRootNode.hideNode();
    SubRootNode.showNode();
    SubRootNode.showChildNodes(0);
    SubRootNode.showChildNodes(1);
    sub2Sub2.showChildNodes(0);
    sub2Sub1.showChildNodes(0);
    sub3Sub1.showChildNodes(0);
    subnSub1.showChildNodes(0);

    //hide some nodes
    sub2Sub1.hideNode();

    //make sure the right ones are hidden
    expect(SubRootNode.getVisibility()).toBe(true);
    expect(sub2Sub1.getVisibility()).toBe(false);
    expect(sub2Sub2.getVisibility()).toBe(true);
    expect(sub3Sub1.getVisibility()).toBe(false);
    expect(subnSub1.getVisibility()).toBe(true);
    expect(SubRootNodeHtml.style.display).toEqual("block");
    expect(sub2Sub2Html.style.display).toEqual("block");
    expect(sub2Sub1Html.style.display).toEqual("none");
    expect(sub3Sub1Html.style.display).toEqual("none");
    expect(subnSub1Html.style.display).toEqual("block");

}); 