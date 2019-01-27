
var clickedDiv;
var menuIsOpen = false;

//eventhandler for normal leftclick, deaktivates rightclickmenu
$("html").on("click", function(e){
    if(menuIsOpen){
        $("#main-rightclick").remove();
        menuIsOpen = false;
    }
});
//eventhandler for rightclick, deactivates rightclickmenu (not in .div_node)
$("html:not(.div_node)").on("contextmenu",function(e){
    if(menuIsOpen){
        $("#main-rightclick").remove();
        menuIsOpen = false;
    }
});
//on rightclick in .div_node calls rightclickmenu and deactivates normal contextmenu
//not used anymore
$(".div_node").contextmenu(function(e) {
    if(menuIsOpen){
        $("#main-rightclick").remove();
        menuIsOpen = false;
    }
    clickedDiv = this;
    rightclickmenu(e);
    return false;
});
//loads rightclickmenu.html on current mouse position
function rightclickmenu(e) {


    let x = e.pageX + "px";     // Get the horizontal coordinate
    let y = e.pageY + "px";     // Get the vertical coordinate
    //let link = "https://raw.githubusercontent.com/MartinKem/Call-Graph-Exploration/developer's/eingelesener%20Graph/rightclickmenu.html?token=gAYfhzzRW1xhwgU-GLzFnB5r3gtbBHuFpks5cRbzjwA%3D%3D";
   // let counter = 0;
    /*try{
        //$("body").append($("<div id='main-rightclick'></div>").load(link +" #main-rightclick>"));

    }catch (e) {*/
       // counter = 1;
       // if(counter > 0)console.log("contextmenu nicht mehr aktuell");
        $("body").append($("<div id='main-rightclick'>        <div class=\"menuelement\" onclick=\"deleteNodes()\">Ausblenden</div>" +
            "        <div class=\"menuelement\" onclick=\"colorChosen(this)\">Red<div class=\"color\" style=\"background-color: #ffc6c6 \"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"colorChosen(this)\">Green<div class=\"color\" style=\"background-color: #beffbe\"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"colorChosen(this)\">Blue<div class=\"color\" style=\"background-color: #abd3ff\"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"colorChosen(this)\">Yellow<div class=\"color\" style=\"background-color: #ffff9f\"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"colorChosen(this)\">White<div class=\"color\" style=\"background-color: white\"></div></div>" +
            "        <div class=\"menuelement\" onclick=\"switchContent()\">Details</div><div>"));

    $("#main-rightclick").css({
        "position":"absolute",
        "top":y,
        "left":x,});


    menuIsOpen = true;

}
//changes color to the backgroundcolor of elem
function colorChosen(elem) {
    var color = $(elem).find(".color").css('backgroundColor');
    $(clickedDiv).css('background-color', color);
}

function deleteNodes() {
    var nodeId= $(clickedDiv).attr('id');
	var nodeInstance = nodeMap.get(nodeId);
	nodeInstance.hideNode();
}
function switchContent() {
    let nodeName= $(clickedDiv).attr('id');
    let node = nodeMap.get(nodeName);
    $(clickedDiv).children(".node_inhalt").toggleClass("invis");
    node.toggleDetailed();
    // for(var i = 0; i < node.parents.length; i++){		// first all edges to this node become hidden
    //     var edge = document.getElementById(node.parents[i].node.getName() + "#" + node.parents[i].index + '->' + nodeName);
    //     if(edge) edge.style.display = "none";
        //method2nodeEdge(node.parents[i].getName() + "#"+ node.parents[i].getMethodIndex(nodeName),nodeName);
    // }

}

