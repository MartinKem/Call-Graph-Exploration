
var clickedNode;
var nodeMenuIsOpen = false;
var clickedEdge;
var edgeMenuIsOpen = false;
var callSiteMenuIsOpen = false;
var markedNode;
var markedEdge;
var lastMarkedNode;
var lastMarkedEdge;
var keyPressed;

// -- these are used for the call site contextmenu --
var availableTargets;
var selectedTargets;
var selectedNode;
var callSiteIndex;
const callSiteThreshold = 5;
// --------------------------------------------------

//eventhandler for normal leftclick, deaktivates the contextmenu for nodes
$("html").on("click", function(e){
    closeAllContextmenus();
});
//eventhandler for rightclick, closes the contextmenu for nodes(not in .div_node)
$("html:not(.div_node)").on("contextmenu",function(e){
    closeEdgeContextmenu();
});
//on rightclick in .div_node calls nodeContextmenu and deactivates normal contextmenu
// $(".div_node").contextmenu(function(e) {
$("body").on("contextmenu",".div_node",function (e) {
    closeAllContextmenus();
    clickedNode = this;

    createNodeContextmenu(e);
    return false;
});
$("body").on("contextmenu","svg path",function (e) {
    closeAllContextmenus();
    clickedEdge = this;
    createEdgeContextmenu(e);
    return false;
});
$("body").on("contextmenu","html:not(path)",function () {
    closeEdgeContextmenu();
});

//mark last clicked
$("body").on("click",".div_node",function () {
    clickedNode = this;
    switch (keyPressed) {
        case 49:
            changeColorNode('#ffc6c6');
            break;
        case 50:
            changeColorNode('#beffbe');
            break;
        case 51:
            changeColorNode('#abd3ff');
            break;
        case 52:
            changeColorNode('#ffff9f');
            break;
        case 53:
            changeColorNode('#FFFFFF');
            break;
        default:
            markedNode = this;
            if(lastMarkedNode !== markedNode){
                markLastClickedNode();
            }
    }
});
$("body").on("click","svg path",function () {
    clickedEdge = this;
    switch (keyPressed) {
        case 49:
            changeColorEdge('#c24e4c');
            break;
        case 50:
            changeColorEdge('#429c44');
            break;
        case 51:
            changeColorEdge('#3076b4');
            break;
        case 52:
            changeColorEdge('#c4c931');
            break;
        case 53:
            changeColorEdge('#000000');
            break;
        default:
            markedNode = this;
            if(lastMarkedEdge !== markedEdge){
                markLastClickedEdge();
            }
    }
});

$(document).on("keydown", function(e) {
    keyPressed = e.which;

});
$(document).on("keyup", function(e){
        if(keyPressed === e.which){
            keyPressed = undefined;
        }
});

$("body").on("click",".node_inhalt button",function (e) {
    let node = nodeMap.get(this.parentNode.parentNode.getAttribute("id"));
    let index = this.getAttribute("id").split("#");
    index = parseInt(index[index.length - 1]);
    if(node.callSites[index].targets.length >= callSiteThreshold){
        closeAllContextmenus();
        closeCallSiteContextmenu();
        createCallSiteContextmenu(e, node, index);
    }
    return false;
});

//loads rightclickmenu.html on current mouse position
function createNodeContextmenu(e) {
    let x = e.pageX + "px";     // Get the horizontal coordinate
    let y = e.pageY + "px";     // Get the vertical coordinate
    //let link = "https://raw.githubusercontent.com/MartinKem/Call-Graph-Exploration/developer's/eingelesener%20Graph/rightclickmenu.html?token=gAYfhzzRW1xhwgU-GLzFnB5r3gtbBHuFpks5cRbzjwA%3D%3D";
   // let counter = 0;
    /*try{
        //$("body").append($("<div id='main-rightclick'></div>").load(link +" #main-rightclick>"));

    }catch (e) {*/
       // counter = 1;
       // if(counter > 0)console.log("contextmenu nicht mehr aktuell");
        $("body").append($("<div id='contextmenuNode'>        <div class=\"menuelement\" onclick=\"deleteNodes()\">Hide</div>" +
            "        <div class=\"menuelement\" onclick=\"changeColorNode('#ffc6c6')\">Red<span class='hotKeySpan'>[1+MouseLeft]</span><div class=\"color\" style=\"background-color: #ffc6c6 \"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"changeColorNode('#beffbe')\">Green<span class='hotKeySpan'>[2+MouseLeft]</span><div class=\"color\" style=\"background-color: #beffbe\"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"changeColorNode('#abd3ff')\">Blue<span class='hotKeySpan'>[3+MouseLeft]</span><div class=\"color\" style=\"background-color: #abd3ff\"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"changeColorNode('#ffff9f')\">Yellow<span class='hotKeySpan'>[4+MouseLeft]</span><div class=\"color\" style=\"background-color: #ffff9f\"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"changeColorNode('#ffffff')\">White<span class='hotKeySpan'>[5+MouseLeft]</span><div class=\"color\" style=\"background-color: #ffffff\"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"switchContent()\">Details</div><div>"));

    $("#contextmenuNode").css({
        "position":"absolute",
        "top":y,
        "left":x,});


    nodeMenuIsOpen = true;

}
//changes color to the backgroundcolor of elem
function changeColorNode(color) {
    $(clickedNode).css('background-color', color);
    $(clickedNode).children(".nodeHeader").css("background-color", color);
}

function deleteNodes() {
    var nodeId= $(clickedNode).attr('id');
	var nodeInstance = nodeMap.get(nodeId);
	nodeInstance.hideNode();
}
function switchContent() {
    let nodeId= $(clickedNode).attr('id');
    let node = nodeMap.get(nodeId);
    $(clickedNode).children(".node_inhalt").toggleClass("invis");
    if($(clickedNode).children(".node_inhalt").hasClass("invis")){ node.toggleToAbstract(); }
    else{ node.toggleToDetailed(); }
    // for(var i = 0; i < node.parents.length; i++){		// first all edges to this node become hidden
    //     var edge = document.getElementById(node.parents[i].node.getName() + "#" + node.parents[i].index + '->' + nodeName);
    //     if(edge) edge.style.display = "none";
        //method2nodeEdge(node.parents[i].getName() + "#"+ node.parents[i].getMethodIndex(nodeName),nodeName);
    // }

}
function createEdgeContextmenu(e) {
    let x = e.pageX + "px";     // Get the horizontal coordinate
    let y = e.pageY + "px";     // Get the vertical coordinate

    $("body").append("<div id='contextmenuEdge'>" +
        " <div class=\"menuelement\" onclick=\"changeColorEdge('#C24E4C')\">Red <span class='hotKeySpan'>[1+MouseLeft]</span><div class=\"color\" style=\"background-color: #c24e4c \"></div></div>" +
        " <div class=\"menuelement\" onclick=\"changeColorEdge('#429C44')\">Green <span class='hotKeySpan'>[2+MouseLeft]</span><div class=\"color\" style=\"background-color: #429c44\"></div></div>" +
        " <div class=\"menuelement\" onclick=\"changeColorEdge('#3076B4')\">Blue <span class='hotKeySpan'>[3+MouseLeft]</span><div class=\"color\" style=\"background-color: #3076b4\"></div></div>" +
        " <div class=\"menuelement\" onclick=\"changeColorEdge('#C4C931')\">Yellow <span class='hotKeySpan'>[4+MouseLeft]</span><div class=\"color\" style=\"background-color: #c4c931\"></div></div>" +
        " <div class=\"menuelement\" onclick=\"changeColorEdge('#000000')\">Default <span class='hotKeySpan'>[5+MouseLeft]</span><div class=\"color\" style=\"background-color: #000000\"></div></div>" +
        " <div class=\"menuelement\" onclick=\"nodeMap.get(clickedEdge.getAttribute('id').split('->')[0].split('#')[0]).focus()\" style=\"white-space: nowrap\">focus Source <span class='hotKeySpan'>[Ctrl+MouseLeft]</span></div>" +
        " <div class=\"menuelement\" onclick=\"nodeMap.get(clickedEdge.getAttribute('id').split('->')[1]).focus()\" style=\"white-space: nowrap\">focus Target <span class='hotKeySpan'>[Double Click]</span></div>" +
    "</div>");

    $("#contextmenuEdge").css({
        "position":"absolute",
        "top":y,
        "left":x,});

    edgeMenuIsOpen = true;
}

function changeColorEdge(color) {
    if(lastMarkedEdge === clickedEdge) $(lastMarkedEdge).removeClass("lastClickedEdge");
    // var color = $(elem).find(".color").css('backgroundColor');
    if(color === '#000000'){
        $(clickedEdge).css('opacity', 0.5);
    }else{
        $(clickedEdge).css('opacity', 1);
    }
    $(clickedEdge).css('stroke', color);
}

function closeAllContextmenus() {
    closeNodeContextmenu();
    closeEdgeContextmenu();
}
function closeNodeContextmenu() {
    if(nodeMenuIsOpen){
        $("#contextmenuNode").remove();
        nodeMenuIsOpen = false;
    }
}
function closeEdgeContextmenu() {
    if(edgeMenuIsOpen){
        $("#contextmenuEdge").remove();
        edgeMenuIsOpen = false;
    }
}
function closeCallSiteContextmenu(){
    if(callSiteMenuIsOpen){
        document.getElementById("searchInput").removeAttribute("disabled", false);
        $("#contextmenuCallSite").remove();
        autocompleteMode = undefined;   // autocomplete shall work as usual, when the call site contextmenu closes
        callSiteMenuIsOpen = false;
    }
}
function markLastClickedNode() {
    if(lastMarkedNode !== null){
        $(lastMarkedNode).removeClass("lastClickedNode");
    }
    $(markedNode).addClass("lastClickedNode");
    lastMarkedNode = markedNode;
}
function markLastClickedEdge() {
    $(markedEdge).addClass("lastClickedEdge");
    if(lastMarkedEdge !== null || lastMarkedEdge === markedEdge){
        $(lastMarkedEdge).removeClass("lastClickedEdge");
    }
    lastMarkedEdge = markedEdge;
}

function createCallSiteContextmenu(e, node, index){

    // these variables are global, because local variables cannot be used in the following html-section
    selectedNode = node;    // the node, that holds the clicked call site
    callSiteIndex = index;  // the call site index of the clicked call site
    selectedTargets = [];   // array of node strings, that holds the childnodes, that shall be shown later
    availableTargets = [];  // array of node strings, that holds all possible child nodes, that belong to the clicked call site, but are not selected yet
    // node.children.forEach(function(child){
    //     if(child.index === index){
    //         availableTargets.push(idString(child.node.getNodeData()));
    //     }
    // });
    node.callSites[index].targets.forEach(function(target){
        availableTargets.push(idString(target));
    });

    $("body").append(
        "<div id='contextmenuCallSite'>" +
            "<h3 style='margin: 0px'>Choose targets for the call site <span style='color: blue'; word-break: break-word;>" + escapeSG(idString(node.getCallSites()[index].declaredTarget)) + "</span> to be shown:</h3>" +
            "<form autocomplete='off' onsubmit='return false' style='margin-top: 15px; overflow: auto; clear: both'>" +
                "<input type='text' name='targetSearch' id='targetSearch' placeholder='add targets' spellcheck='false' style='width: 100%; height: 30px; padding: 5px; float: left'>" +
            "</form>" +
            "<div style='margin-top: 15px; height: 930px'>" +
                "<div id='selectedTargets' style='border: solid 1px; min-height: 80px; max-height: 800px; /*overflow: auto;*/ padding-right: 5px'>" +
                    "<h5 style='text-align: center; margin: 10px'>Selected Targets</h5>" +
                    "<ul id='selectedTargetsList'></ul>" +
                "</div>" +
            "</div>" +
            "<div style='position: absolute; bottom: 0; right: 0; width: 100%; overflow: auto; padding: 15px'>" +
                "<button onclick='closeCallSiteContextmenu(); selectedNode.showChildNodes(callSiteIndex)' style='position: relative; font-size: 15px;'>Show all possible Targets</button>" +
                "<button onclick='closeCallSiteContextmenu(); selectedNode.showChildNodes(callSiteIndex, selectedTargets)' style='position: relative; margin-left: 15px; font-size: 15px'>Show Selected Targets</button>" +
                "<button onclick='closeCallSiteContextmenu()' style='position: relative; margin-left: 15px; font-size: 15px'>Close</button>" +
            "</div>"+
        "</div>");

    document.getElementById("searchInput").setAttribute("disabled", true);
    autocompleteMode = "callSite";  // this global variable is used in the autocomplete function, that shall work a little bit different, when in call site mode
    autocomplete(document.getElementById("targetSearch"), availableTargets);
    callSiteMenuIsOpen = true;

    $("#contextmenuCallSite").css({
        "position":"fixed",
        "top":0,
        "right": 0,
        "height":"100%",
        "width":"30%",
        "background-color": "white",
        "border": "solid",
        "border-width": 1,
        "padding": 15
    });
}

function addTargetToSelected(){
    let targetSearch = document.getElementById("targetSearch");
    let targetList = document.getElementById("selectedTargetsList");
    // add the selected target as html list element
    targetList.innerHTML += "<li style='word-break: break-word' onclick='removeTargetFromSelected(this.textContent); this.remove()'>" + targetSearch.value + "</li>";
    availableTargets.splice( availableTargets.indexOf(targetSearch.value), 1);  // remove selected target from available
    selectedTargets.push(targetSearch.value);   // add selected target to selected
}

function removeTargetFromSelected(target){
    availableTargets.push(target);  // add selected target to available
    selectedTargets.splice( selectedTargets.indexOf(target), 1);    // rmove selected target from selected
}