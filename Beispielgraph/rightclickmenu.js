
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


    var x = e.pageX + "px";     // Get the horizontal coordinate
    var y = e.pageY + "px";     // Get the vertical coordinate
    var link = "https://raw.githubusercontent.com/MartinKem/Call-Graph-Exploration/developer's/Beispielgraph/rightclickmenu.html?token=AYfhzy2KTg8b5K0bfVB-Aqo4bfPb58BSks5cENZywA%3D%3D";
    $("body").append($("<div id='main-rightclick'></div>").load(link +" #main-rightclick>"));
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
    nodeId = parseInt(nodeId);
	var nodeInstance = getNodeById(nodeId, testNode);
	nodeInstance.hideNode();
}
