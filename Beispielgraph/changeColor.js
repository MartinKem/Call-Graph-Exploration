
var clickedDiv;
var menuIsOpen = false;


$("html").on("click", function(){
    //
    console.log("click");
    if(menuIsOpen){
        $("#main-rightclick").remove();
        menuIsOpen = false;
    }
});
$("html:not(.div_node)>*").on("contextmenu",function(){
    //
    console.log("rclick1");
    if(menuIsOpen){
        $("#main-rightclick").remove();
        //menuIsOpen = false;
    }
});
$("html:not(.div_node,#main)").on("contextmenu",function(){
    //
    console.log("rclick2");
    if(menuIsOpen){
        $("#main-rightclick").remove();
        //menuIsOpen = false;
    }
});

$(".div_node").contextmenu(function() {
    //alert(this.innerText);
    //var color = rightclickmenu();
    //$(this).css('background-color', color);
    clickedDiv = this;
    rightclickmenu();
    return false;
});

function rightclickmenu() {
    var x = event.pageX + "px";     // Get the horizontal coordinate
    var y = event.pageY + "px";     // Get the vertical coordinate
    /*var div=$("<div/>").css({
        "position":"absolute",
        "top":y,
        "left":x,
        "height":"100px",
        "width":"100px",
        "z-index":"100000",
        "background-color":"green"
        });*/
    //"position:absolute;top:y;left:x;height:100px;width:100px;z-index:10000;backgroundcolor:white;");

    $.get("rightclickmenu.html", function(data){
        /* var div=$("#main").css({
             "position":"absolute",
             "top":y,
             "left":x}).append(data);*/
        //var divMenu = $("<div>")
        /*$("body").append().html(data).css({
            "position":"absolute",
            "top":y,
            "left":x});*/
        $("body").append(data);
        $("#main-rightclick").css({
            "position":"absolute",
            "top":y,
            "left":x,});
        // $(this).children("div:first").append(data);
    });
    /*        var z = $.get("rightclickmenu.html");
            $("#main").css({
                "position":"absolute",
                "top":y,
                "left":x,});
            $("body").append(z);*/

    // $("body").append(div);
    menuIsOpen = true;

}
function colorChosen(elem) {
    var color = $(elem).find(".color").css('backgroundColor');
    $(clickedDiv).css('background-color', color);
}
