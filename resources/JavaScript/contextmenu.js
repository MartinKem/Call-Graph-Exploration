

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
})
    .on("contextmenu","svg path",function (e) {
    closeAllContextmenus();
    clickedEdge = this;
    createEdgeContextmenu(e);
    return false;
})
    .on("contextmenu","html:not(path)",function () {
    closeEdgeContextmenu();
})

/** ändert die Farbe der angeklickten Node wenn ein entsprechender Hotkey gedrückt wird.
 *  die Hotkey sind 1,2,3,4,5. Esfunktionieren sowohl die normalen Zahlen, als auch die vom Numpad
 *  */
    .on("click",".div_node",function () {
    clickedNode = this;
    switch (keyPressed) {
        case 49: //1
        case 97:
            changeColorNode('#ffc6c6');
            break;
        case 50: //2
        case 98:
            changeColorNode('#beffbe');
            break;
        case 51: //3
        case 99:
            changeColorNode('#abd3ff');
            break;
        case 52: //4
        case 100:
            changeColorNode('#ffff9f');
            break;
        case 53: //5
        case 101:
            changeColorNode('#FFFFFF');
            break;
        default:
            markedNode = this;
            if(lastMarkedNode !== markedNode){
                markLastClickedNode();
            }
    }
})

/**ändert die Farbe der angeklickten Edge wenn ein entsprechender Hotkey gedrückt wird.
 * die Hotkey sind 1,2,3,4,5. Es funktionieren sowohl die normalen Zahlen, als auch die vom Numpad
 * */
    .on("click","svg path",function () {
    clickedEdge = this;
    switch (keyPressed) {
        case 49://1
        case 97:
            changeColorEdge('#c24e4c');
            break;
        case 50://2
        case 98:
            changeColorEdge('#429c44');
            break;
        case 51://3
        case 99:
            changeColorEdge('#3076b4');
            break;
        case 52://4
        case 100:
            changeColorEdge('#c4c931');
            break;
        case 53://5
        case 101:
            changeColorEdge('#000000');
            break;
        default:
            markedEdge = this;
            if(lastMarkedEdge !== markedEdge){
                markLastClickedEdge();
            }
    }
})

    .on("click",".node_inhalt button",function (e) {
    let node = nodeMap.get(this.parentNode.parentNode.getAttribute("id"));
    let index = this.getAttribute("id").split("#");
    index = parseInt(index[index.length - 1]);
    if(node.callSites[index].targets.length >= callSiteThreshold){
        closeAllContextmenus();
        closeCallSiteContextmenu();
        createCallSiteContextmenu(node, index);
    }
    return false;
});

/**
 * Stored the currently pressed key in keyPressed
  */
$(document).on("keydown", function(e) {
    keyPressed = e.which;

})
    .on("keyup", function(e){
        if(keyPressed === e.which){
            keyPressed = undefined;
        }
});



/**
 * opens custom contextmenu on mouseposition
 * @param e - event
 */
function createNodeContextmenu(e) {
    let x = e.pageX + "px";     // Get the horizontal coordinate
    let y = e.pageY + "px";     // Get the vertical coordinate
        $("body").append($("<div id='contextmenuNode'>        <div class=\"menuelement\" onclick=\"deleteNodes()\" title=\"Click to hide this node and all childnodes without different parentnodes\">Hide</div>" +
            "        <div class=\"menuelement\" onclick=\"changeColorNode('#ffc6c6')\">Red<span class='hotKeySpan'> [1+MouseLeft]</span><div class=\"color\" style=\"background-color: #ffc6c6 \"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"changeColorNode('#beffbe')\">Green<span class='hotKeySpan'> [2+MouseLeft]</span><div class=\"color\" style=\"background-color: #beffbe\"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"changeColorNode('#abd3ff')\">Blue<span class='hotKeySpan'> [3+MouseLeft]</span><div class=\"color\" style=\"background-color: #abd3ff\"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"changeColorNode('#ffff9f')\">Yellow<span class='hotKeySpan'> [4+MouseLeft]</span><div class=\"color\" style=\"background-color: #ffff9f\"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"changeColorNode('#ffffff')\">Default<span class='hotKeySpan'> [5+MouseLeft]</span><div class=\"color\" style=\"background-color: #ffffff\"></div></div>" +
            "        <div class=\"menuelement\" onclick='nodeMap.get(clickedNode.id).showAllChildNodes();'>Show all reachable nodes</div>" +
            "        <div class=\"menuelement\" onclick=\"switchContent()\">Details<span class='hotKeySpan'> [Double click]</span></div><div>"));

    $("#contextmenuNode").css({
        "position":"absolute",
        "top":y,
        "left":x,});


    nodeMenuIsOpen = true;

}
/**
 * changes color to the backgroundcolor of node div
 * @param color - String, RGB in Hex
 */
function changeColorNode(color) {
    $(clickedNode).css('background-color', color);
    $(clickedNode).children(".nodeHeader").css("background-color", color);
}


function deleteNodes() {
    let nodeId= $(clickedNode).attr('id');
	let nodeInstance = nodeMap.get(nodeId);
	nodeInstance.hideNode();
}

function switchContent() {
    let nodeId= $(clickedNode).attr('id');
    let node = nodeMap.get(nodeId);
    $(clickedNode).children(".node_inhalt").toggleClass("invis");
    if($(clickedNode).children(".node_inhalt").hasClass("invis")){
        node.toggleToAbstract();
        node.focus(); }
    else{
        node.toggleToDetailed();
    }

}
/**
 * opens custom contextmenu on mouseposition
 * @param e - event
 */
function createEdgeContextmenu(e) {
    let x = e.pageX + "px";     // Get the horizontal coordinate
    let y = e.pageY + "px";     // Get the vertical coordinate

    $("body").append("<div id='contextmenuEdge'>" +
        " <div class=\"menuelement\" onclick=\"changeColorEdge('#C24E4C')\">Red <span class='hotKeySpan'>[1+MouseLeft]</span><div class=\"color\" style=\"background-color: #c24e4c \"></div></div>" +
        " <div class=\"menuelement\" onclick=\"changeColorEdge('#429C44')\">Green <span class='hotKeySpan'>[2+MouseLeft]</span><div class=\"color\" style=\"background-color: #429c44\"></div></div>" +
        " <div class=\"menuelement\" onclick=\"changeColorEdge('#3076B4')\">Blue <span class='hotKeySpan'>[3+MouseLeft]</span><div class=\"color\" style=\"background-color: #3076b4\"></div></div>" +
        " <div class=\"menuelement\" onclick=\"changeColorEdge('#C4C931')\">Yellow <span class='hotKeySpan'>[4+MouseLeft]</span><div class=\"color\" style=\"background-color: #c4c931\"></div></div>" +
        " <div class=\"menuelement\" onclick=\"changeColorEdge('#000000')\">Default <span class='hotKeySpan'>[5+MouseLeft]</span><div class=\"color\" style=\"background-color: #000000\"></div></div>" +
        " <div class=\"menuelement\" onclick=\"focusWindowTo(clickedEdge.getPointAtLength(0))\" style=\"white-space: nowrap\">Focus Source <span class='hotKeySpan'>[Ctrl+MouseLeft]</span></div>" +
        " <div class=\"menuelement\" onclick=\"nodeMap.get(clickedEdge.getAttribute('id').split('->')[1]).focus()\" style=\"white-space: nowrap\">Focus Target <span class='hotKeySpan'>[Double Click]</span></div>" +
    "</div>");

    $("#contextmenuEdge").css({
        "position":"absolute",
        "top":y,
        "left":x,});

    edgeMenuIsOpen = true;
}

function changeColorEdge(color) {
    if(color === '#000000'){
        $(clickedEdge).css('opacity', 0.5);
    }else{
        $(clickedEdge).css('opacity', 1);
    }
    $(clickedEdge).css('stroke', color);
}
//closes all custom contextmenus
function closeAllContextmenus() {
    closeNodeContextmenu();
    closeEdgeContextmenu();
}
//closes NodeContextmenu
function closeNodeContextmenu() {
    if(nodeMenuIsOpen){
        $("#contextmenuNode").remove();
        nodeMenuIsOpen = false;
    }
}

//closes EdgeContextmenu
function closeEdgeContextmenu() {
    if(edgeMenuIsOpen){
        $("#contextmenuEdge").remove();
        edgeMenuIsOpen = false;
    }
}
//closes CallSiteContextmenu
function closeCallSiteContextmenu(){
    maxSuggests = 10;
    if(callSiteMenuIsOpen){
        document.getElementById("searchInput").removeAttribute("disabled", false);
        document.getElementById("search").removeAttribute("disabled", false);
        $("#contextmenuCallSite").remove();
        autocompleteMode = undefined;   // autocomplete shall work as usual, when the call site contextmenu closes
        callSiteMenuIsOpen = false;
    }
}

// last clicked node-div gets the class: .lastClickedNode
function markLastClickedNode() {
    if(lastMarkedNode !== null){
        $(lastMarkedNode).removeClass("lastClickedNode");
    }
    $(markedNode).addClass("lastClickedNode");
    lastMarkedNode = markedNode;
}

// last clicked edge gets the class: .lastClickedEdge
function markLastClickedEdge() {
    if(lastMarkedEdge !== null){
        $(lastMarkedEdge).removeClass("lastClickedEdge");
    }
    $(markedEdge).addClass("lastClickedEdge");
    lastMarkedEdge = markedEdge;
}

/**
 * generates an menu to select the targets of an given call site
 * 
 * @param {node} node - node on which the call site lives 
 * @param {number} index - index of the call site
 */
function createCallSiteContextmenu(node, index){
    maxSuggests = 10;

    // these variables are global, because local variables cannot be used in the following html-section
    selectedNode = node;    // the node, that holds the clicked call site
    callSiteIndex = index;  // the call site index of the clicked call site
    selectedTargets = new Set();   // array of node strings, that holds the childnodes, that shall be shown later
    availableTargets = new Set();  // array of node strings, that holds all possible child nodes, that belong to the clicked call site, but are not selected yet

    node.callSites[index].targets.forEach(function(target){
        availableTargets.add(idString(target));
    });
    node.children
        .filter(child => (child.index === index && child.edge.visible))
        .forEach(function(child){
            availableTargets.delete(idString(child.node.nodeData));  // remove selected target from available
            selectedTargets.add(idString(child.node.nodeData));   // add selected target to selected
        });

    $("body").append(
        "<div id='contextmenuCallSite'>" +
            "<h3>Choose targets for the call site <span>" + escapeSG(idString(node.getCallSites()[index].declaredTarget)) + "</span> to be shown:</h3>" +
            "<form autocomplete='off' onsubmit='return false'>" +
                "<input type='text' name='targetSearch' id='targetSearch' placeholder='Select Targets' spellcheck='false'>" +
            "</form>" +
            "<div id='callSiteSelection'>" +
                "<div id='selectedTargets'>" +
                    "<h3>Selected Targets</h3>" +
                    "<div id='selectedTargetsList'></div>" +
                "</div>" +
            "</div>" +
            "<div id='contextmenuSubmit'>" +
                "<button id='cmb1' onclick='closeCallSiteContextmenu(); selectedNode.showChildNodes(callSiteIndex)'>Show all possible Targets</button>" +
                "<button id='cmb2' onclick='closeCallSiteContextmenu(); selectedNode.showChildNodes(callSiteIndex, selectedTargets)'>Show selected Targets</button><br>" +
                "<button id='cmb3' onclick='closeCallSiteContextmenu(); selectedNode.hideCallsiteTargets(callSiteIndex)'>Hide all visible Targets</button>" +
                "<button id='cmb4' onclick='closeCallSiteContextmenu(); selectedNode.hideCallsiteTargets(callSiteIndex,Array.from(selectedTargets))'>Hide selected Targets</button><br>" +
                "<button id='cmb5' onclick='closeCallSiteContextmenu()'>Close</button>" +
            "</div>"+
        "</div>");

    // targets, that are already visible, shall be shown in the selected list
    node.children
        .filter(child => child.index === index && child.edge.visible)
        .forEach(function(child){
            addTargetToSelected(idString(child.node.nodeData));
        });

    document.getElementById("searchInput").setAttribute("disabled", true);
    document.getElementById("search").setAttribute("disabled", true);
    autocompleteMode = "callSite";  // this global variable is used in the autocomplete function, that shall work a little bit different, when in call site mode
    autocomplete(document.getElementById("targetSearch"), Array.from(availableTargets.values()));
    callSiteMenuIsOpen = true;
}

/**
 * adds a target to the CallSiteContextmenu
 * 
 * @param {string} targetString - string, that identifies the node with the given data (see: idString())
 */
function addTargetToSelected(targetString){
    if(!targetString) {
        let targetSearch = document.getElementById("targetSearch");
        targetString = targetSearch.value;
    }

    let innerHTMLStr = "<div><p class='rmx' onclick='removeTargetFromSelected(this.parentNode.childNodes[1].textContent); this.parentNode.remove()'>x</p>";
    innerHTMLStr += "<p>" + targetString + "</p></div>";

    let targetList = document.getElementById("selectedTargetsList");
    // add the selected target as html list element
    targetList.innerHTML += innerHTMLStr;
    availableTargets.delete(targetString);  // remove selected target from available
    selectedTargets.add(targetString);   // add selected target to selected
}

/**
 * removes a target to the CallSiteContextmenu
 * 
 * @param {*} target - string, that identifies the node with the given data (see: idString())
 */
function removeTargetFromSelected(target){
    availableTargets.add(target);  // add selected target to available
    selectedTargets.delete(target);    // remove selected target from selected
}

function hideTargets(targets){
    if(targets === undefined){
        selectedNode.callSites[callSiteIndex].targets.forEach(function(target){
            let targetNode = nodeMap.get(idString(target));
            if(targetNode !== undefined && targetNode.visible && idString(target) !== idString(selectedNode.nodeData)){
                targetNode.hideNode();
                removeTargetFromSelected(idString(target));
            }
        });
    } else {
        // console.log(targets);
        targets.forEach(function(targetStr){
            let targetNode = nodeMap.get(targetStr);
            if(targetNode !== undefined && targetNode.visible && targetStr !== idString(selectedNode.nodeData)){
                targetNode.hideNode();
                removeTargetFromSelected(targetStr);
            }
        });
    }
}

/**
 * If there are starting node/nodes, an menu is open, that is used to calculate the whole sub graph
 */
function createWholeGraphContextmenu(){
    if(rootNodes.length < 1){
        alert("There must be at least one starting node!");
    } else {
        let reachableNodes = countReachableNodes()
        if(reachableNodes) {
            $("body").append(
                "<div id='wholeGraphContextMenu'>" +
                "<h2>Warning!</h2>" +
                "<p>Are you sure, that you want to create " + reachableNodes + " nodes?</p>" +
                "<button onclick='deleteWholeGraphContextmenu(); showWholeGraph();'>Show</button>" +
                "<button onclick='deleteWholeGraphContextmenu();'>Quit</button>" +
                "</div>");
        }
    }
}

/**
 * removes the menu which is created by createWholeGraphContextmenu
 */
function deleteWholeGraphContextmenu(){
    $("#wholeGraphContextMenu").remove();
}



/**
* (only for testing)
* EXPORT:
* *******
*/
if (typeof module !== 'undefined') {
    module.exports.changeColorNode = changeColorNode;
    
}
