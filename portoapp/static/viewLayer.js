/**
 * Created by Yueqi on 9/14/2017.
 */
// view control functions shared by all view layers:
var layer_color = {
    query: 'lightgray',
    highlight: 'blue',
    select: 'red'
};

function ViewLayer(){

    this.show = function(){

    };

    this.hide = function(){

    };
}
//################################## Trip Ends View Controller##########################
function TripEnds(){
    // <id: start point, end point, size>
    var data = {};

    // color fixed, change size when highlighted or selected
    var color = {
            start : 'red',
            end: 'green'
        },
        size = {
            query: 2,
            highlight: 10,
            select: 15
        };

    //
    this.drawFuncs = function(){

    }
}
TripEnds.prototype = new ViewLayer();

//#################################### Trip View Controller##############################
function Trips(){
    // ids, trajectory shape
    var data = {};

    function query(){

    }

    function add(ids){

    }

    function highlight(){

    }

    function select(){

    }
}

Trips.prototype = new ViewLayer();


//################################## Street View Controller#############################
function Streets(){
    // id, weight, type, geometry
    var data = {};
    this.change_street_type = function(types){

    }

}
Streets.prototype = new ViewLayer();