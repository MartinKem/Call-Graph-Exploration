
var clickedDiv;
var menuIsOpen = false;

//eventhandler for normal leftclick, deaktivates rightclickmenu
$("html").on("click", function(){

    console.log("click");
    if(menuIsOpen){
        $("#main-rightclick").remove();
        menuIsOpen = false;
    }
});
//eventhandler for rightclick, deactivates rightclickmenu (not in .div_node)
$("html:not(.div_node)").on("contextmenu",function(){
    //
    console.log("rclick1");
    if(menuIsOpen){
        $("#main-rightclick").remove();
        menuIsOpen = false;
    }
});
//on rightclick in .div_node calls rightclickmenu and deactivates normal contextmenu
$(".div_node").contextmenu(function() {
    clickedDiv = this;
    rightclickmenu();
    return false;
});
//loads rightclickmenu.html on current mouse position
function rightclickmenu() {
    var x = event.pageX + "px";     // Get the horizontal coordinate
    var y = event.pageY + "px";     // Get the vertical coordinate


    $.get("rightclickmenu.html", function(data){
        $("body").append(data);
        $("#main-rightclick").css({
            "position":"absolute",
            "top":y,
            "left":x,});
    });

    menuIsOpen = true;

}
//changes color to the backgroundcolor of elem
function colorChosen(elem) {
    var color = $(elem).find(".color").css('backgroundColor');
    $(clickedDiv).css('background-color', color);
}
