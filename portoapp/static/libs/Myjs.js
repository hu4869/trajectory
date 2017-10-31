//*****************************************************************************************************************************************
// Global Variable
//*****************************************************************************************************************************************
var VisSelected = [];
var QueryId = -1;
var ComplexQueryList = [];
var edit = 0;
var editQId = -1;
var ActiveQID = -1;
var TempQO = -1;
var polylines = -1;
var Start_Points = -1;
var End_Points = -1;
var heatLayer = -1;
var AvtiveVis = -1;
var Street_Layer = -1;
var Poly_Layer = -1;
var QcoorLat;
var QcoorLng;
//*****************************************************************************************************************************************
// Initialize Map, , set the view to a given place and zoom + Buttons 
//*****************************************************************************************************************************************

DrawChart1();

var lat = 41.155376;
var lng = -8.613999;
var zoom = 15;

var RoadTypeLayer = [];
for (var k = 0; k < 11; k++) {
    RoadTypeLayer[k] = new L.FeatureGroup();
}

// add an OpenStreetMap tile layer
var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ';


var grayscale = L.tileLayer(mbUrl, {
        id: 'mapbox.light',
        attribution: mbAttr
    }),
    streets = L.tileLayer(mbUrl, {
        id: 'mapbox.streets',
        attribution: mbAttr
    });


var map = L.map('map', {
    center: [lat, lng], // Porto
    zoom: zoom,
    layers: [streets, RoadTypeLayer[2], RoadTypeLayer[5]],
    zoomControl: false,
    preferCanvas: true,
    fullscreenControl: true,
    fullscreenControlOptions: { // optional
        title: "Show me the fullscreen !",
        titleCancel: "Exit fullscreen mode",
        position: 'topright'
    }
});

var baseLayers = {
    "Grayscale": grayscale, // Grayscale tile layer
    "Streets": streets, // Streets tile layer
};

var overlayMaps = {

    "Motorway": RoadTypeLayer[1],
    "Primary": RoadTypeLayer[2],
    "Secondary": RoadTypeLayer[5],
    "Residential": RoadTypeLayer[3],
    "Road": RoadTypeLayer[4],
    "Living_Street": RoadTypeLayer[0],
    "Service": RoadTypeLayer[6],
    "Tertiary": RoadTypeLayer[7],
    "Trunk": RoadTypeLayer[8],
    "Cycleway": RoadTypeLayer[9],
    "Unclassified": RoadTypeLayer[10]
};

layerControl = L.control.layers(baseLayers, overlayMaps, {
    position: 'bottomright'
}).addTo(map);

// Initialise the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var featureGroup = L.featureGroup();

var drawControl = new L.Control.Draw({
    position: 'topright',
    collapsed: false,
    draw: {
        // Available Shapes in Draw box. To disable anyone of them just convert true to false
        polyline: false,
        polygon: true,
        circle: true,
        rectangle: true,
        marker: false,
    },
    edit: {
        featureGroup: drawnItems,
        remove: false,
        edit: false
    }

});

//To add anything to map, add it to "drawControl"
map.addControl(drawControl);

//Street View-Trajectory View-Clear View Control
var STC = [
    L.easyButton({
        states: [{
            icon: 'fa-tachometer fa-lg',
            title: 'Traj Speed',
            onClick: function() {
                if (ActiveQID != -1) {
                    //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
                    clearMap();
                    AvtiveVis = 1;
                    DrawStreet(ActiveQID.road_Array);
                }
            }
        }]
    }),
    L.easyButton({
        states: [{
            icon: 'fa-exchange fa-lg',
            title: 'Traj Flow',
            onClick: function() {
                if (ActiveQID != -1) {
                    //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
                    clearMap();
                    AvtiveVis = 2;
                    DrawStreet1(ActiveQID.road_Array, ActiveQID.color);
                }
            }
        }]
    }),
    L.easyButton({
        states: [{
            icon: 'fa-sign-in fa-lg',
            title: 'Pick-UP Distribution',
            onClick: function() {
                if (ActiveQID != -1) {
                    //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
                    clearMap();
                    AvtiveVis = 3;
                    DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                }
            }
        }]
    }),
    L.easyButton({
        states: [{
            icon: 'fa-sign-out fa-lg',
            title: 'Drop-Off Distribution',
            onClick: function() {
                if (ActiveQID != -1) {
                    //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
                    clearMap();
                    AvtiveVis = 4;
                    DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                }
            }
        }]
    }),
    L.easyButton({
        states: [{
            icon: 'fa-taxi fa-lg',
            title: 'Trajectory View',
            onClick: function() {
                clearMap();
                AvtiveVis = 5;
                DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
            }
        }]
    }),
    L.easyButton({
        states: [{
            icon: 'fa-eraser fa-lg',
            title: 'Clear Map',
            onClick: function() {
                location.reload();
            }
        }]
    })

];

L.easyBar(STC).addTo(map);

//Save-Load GeoJson file Control
var SLG = [
    L.easyButton({
        states: [{
            icon: 'fa-floppy-o fa-lg',
            title: 'Save Region(s) (.GeoJson)',
            href: "#",
            onClick: function() {
                // Extract GeoJson from featureGroup
                var data = featureGroup.toGeoJSON();
                // Stringify the GeoJson
                var convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));

                // Create export
                var a = document.createElement('a');
                a.setAttribute('href', 'data:' + convertedData);
                a.setAttribute('download', 'data.geojson');
                a.click();
            }
        }]
    }),
    L.easyButton({
        states: [{
            icon: 'fa-folder-open fa-lg',
            title: 'Load Region(s) (.GeoJson)',
            onClick: function() {
                document.getElementById('upload-file').click();
            }
        }]
    })
];

L.easyBar(SLG).addTo(map);

//To add speed legend to the map
var legend = L.control({
    position: 'topleft'
});
legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [2, 7, 12, 28],
        lbl = ["<= 05Km/h", "<= 10Km/h", "<= 20Km/h", "> 20Km/h"],
        labels = [],
        from, to;

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColor(from) + '"></i> ' + lbl[i]);
        //from + (to ? '&ndash;' + to : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
};

//*****************************************************************************************************************************************
// custom zoom bar control that includes a Zoom Home function.
//*****************************************************************************************************************************************
L.Control.zoomHome = L.Control.extend({
    options: {
        position: 'topright',
        zoomInText: '<i class="fa fa-plus fa-lg" style="line-height:1.65;"></i>',
        zoomInTitle: 'Zoom in',
        zoomOutText: '<i class="fa fa-minus fa-lg" style="line-height:1.65;"></i>',
        zoomOutTitle: 'Zoom out',
        zoomHomeText: '<i class="fa fa-home fa-lg" style="line-height:1.65;"></i>',
        zoomHomeTitle: 'Zoom home'
    },

    onAdd: function(map) {
        var controlName = 'gin-control-zoom',
            container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
            options = this.options;

        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
            controlName + '-in', container, this._zoomIn);
        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
            controlName + '-home', container, this._zoomHome);
        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
            controlName + '-out', container, this._zoomOut);

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    onRemove: function(map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },

    _zoomIn: function(e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },

    _zoomOut: function(e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },

    _zoomHome: function(e) {
        map.setView([lat, lng], zoom);
    },

    _createButton: function(html, title, className, container, fn) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', fn, this)
            .on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function() {
        var map = this._map,
            className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});

// add the new control to the map
var zoomHome = new L.Control.zoomHome();
zoomHome.addTo(map);

//*****************************************************************************************************************************************
// Side Bar
//*****************************************************************************************************************************************
$('#toolbar .MV').on('click', function() {
    $(this).parent().toggleClass('open');
});
//*****************************************************************************************************************************************
// Clear the map
//*****************************************************************************************************************************************
function clearMap() {
    for (i in map._layers) {
        if (map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            } catch (e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }

    map.removeControl(legend);

    for (var k = 0; k < 11; k++) {
        RoadTypeLayer[k].clearLayers();
    }

    if (polylines != -1) {
        polylines.clearLayers();
        Start_Points.clearLayers();
        End_Points.clearLayers();
    }

    if (heatLayer != -1) {
        map.removeLayer(heatLayer);
    }
}
//*****************************************************************************************************************************************
// Drawing Shapes (polyline, polygon, circle, rectangle, marker) Event: Select from draw box and start drawing on map.
//*****************************************************************************************************************************************
map.on('draw:created', function(e) {

    //var T1 = kendo.toString($("#datetimepicker1").data("kendoDateTimePicker").value(), "yyyy/MM/dd HH:mm:ss").replace(/\//g, '-');
    //var T2 = kendo.toString($("#datetimepicker2").data("kendoDateTimePicker").value(), "yyyy/MM/dd HH:mm:ss").replace(/\//g, '-');
    var SMM;
    var SM = document.getElementById("QueryMode").value;
    var RS = "Single";

    if (SM == "Intersect") {
        SMM = "1";
    } else if (SM == "Pick-UP") {
        SMM = "2";
    } else {
        SMM = "3";
    }

    var T1 = document.getElementById("search-from-date").value + ":00";
    var T2 = document.getElementById("search-to-date").value + ":00";

    var type = e.layerType;
    layer = e.layer;
    layer.type = type;


    if (edit == 0) {
        AvtiveVis = 5;
        if (RS == "Single") {
            clearMap();
            featureGroup.clearLayers();
            drawnItems.clearLayers();
        }
        var color = vis.QueryManager.nextQueryColor;
        newQuery = vis.QueryManager.CreateQuery(layer, color);
        layer.bindPopup('Query ' + newQuery.QueryId);
        //If your selection is a circle
        if (type === 'circle') {
            //Prepare circle border for query
            var r = new L.LayerGroup();
            var desyCircle = LGeo.circle([layer.getLatLng().lat, layer.getLatLng().lng], layer.getRadius(), {
                parts: 144
            }).addTo(r);
            var f = r.getLayers()
            var p = f[0].toGeoJSON()
            featureGroup.addLayer(f[0]);
            // points of the border
            QcoorLat = p.geometry.coordinates[0][0][1];
            QcoorLng = p.geometry.coordinates[0][0][0];
            var stcor = p.geometry.coordinates[0][0][0].toString() + " " + p.geometry.coordinates[0][0][1].toString();
            for (var k = 1; k < p.geometry.coordinates[0].length; k++) {
                stcor = stcor + "," + p.geometry.coordinates[0][k][0].toString() + " " + p.geometry.coordinates[0][k][1].toString();
            }
            stcor = stcor + "," + p.geometry.coordinates[0][0][0].toString() + " " + p.geometry.coordinates[0][0][1].toString();
            stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
            //Send circle border to the server for query
            $.post("/Porto/system/query.php", {
                cor: stcor
            }, function(results) {
                // the output of the response is now handled via a variable call 'results'
                if (results) {
                    var obj = [];
                    obj = JSON.parse(results);
                    StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"], obj["road_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color);
                } else {
                    console.log("No Results");
                }
            });
        } else
            //If your selection is a rectangle
            if (type === 'rectangle') {
                //Prepare rectangle border for query
                featureGroup.addLayer(layer);
                var coor = [];
                coor = layer.getLatLngs();
                QcoorLat = coor[0][0].lat;
                QcoorLng = coor[0][0].lng;
                var stcor = coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                for (var k = 1; k < coor[0].length; k++) {
                    stcor = stcor + "," + coor[0][k].lng.toString() + " " + coor[0][k].lat.toString();
                }
                stcor = stcor + "," + coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;

                //Send rectangle border to the server for query
                $.post("/Porto/system/query.php", {
                    cor: stcor
                }, function(results) {
                    // the output of the response is now handled via a variable call 'results'
                    if (results) {
                        var obj = [];
                        obj = JSON.parse(results);
                        StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"], obj["road_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color);
                    } else {
                        console.log("No Results");
                    }
                });

            }
        else
            //If your selection is a polygon
            if (type === 'polygon') {
                //Prepare polygon border for query
                featureGroup.addLayer(layer);
                var coor = [];
                coor = layer.getLatLngs();
                QcoorLat = coor[0][0].lat;
                QcoorLng = coor[0][0].lng;
                var stcor = coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                for (var k = 1; k < coor[0].length; k++) {
                    stcor = stcor + "," + coor[0][k].lng.toString() + " " + coor[0][k].lat.toString();
                }
                stcor = stcor + "," + coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
                //Send polygon border to the server for query
                $.post("/Porto/system/query.php", {
                    cor: stcor
                }, function(results) {
                    // the output of the response is now handled via a variable call 'results'
                    if (results) {
                        var obj = [];
                        obj = JSON.parse(results);
                        StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"], obj["road_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color);
                    } else {
                        console.log("No Results");
                    }
                });
            }
    } else
    if (edit == 1) {
        var Qu = vis.QueryManager.GetQueryByQueryId(editQId);
        Qu.LayerGroups.push(layer);
        var color = Qu.Color;
        //If your selection is a circle
        if (type === 'circle') {
            //Prepare circle border for query
            var r = new L.LayerGroup();
            var desyCircle = LGeo.circle([layer.getLatLng().lat, layer.getLatLng().lng], layer.getRadius(), {
                parts: 144
            }).addTo(r);
            var f = r.getLayers()
            var p = f[0].toGeoJSON()

            // points of the border
            QcoorLat = p.geometry.coordinates[0][0][1];
            QcoorLng = p.geometry.coordinates[0][0][0];
            var stcor = p.geometry.coordinates[0][0][0].toString() + " " + p.geometry.coordinates[0][0][1].toString();
            for (var k = 1; k < p.geometry.coordinates[0].length; k++) {
                stcor = stcor + "," + p.geometry.coordinates[0][k][0].toString() + " " + p.geometry.coordinates[0][k][1].toString();
            }
            stcor = stcor + "," + p.geometry.coordinates[0][0][0].toString() + " " + p.geometry.coordinates[0][0][1].toString();
            stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
            //Send circle border to the server for query
            $.post("/Porto/system/query.php", {
                cor: stcor
            }, function(results) {
                // the output of the response is now handled via a variable call 'results'
                if (results) {
                    var obj = [];
                    obj = JSON.parse(results);
                    ComplexQueryInfo(obj["Draw"], stcor);
					$("#finish_editing").hide();
                    FinalResults = FilterComplexQuery();
                    tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                    $.post("/Porto/system/query_edit.php", {
                        trips: tripIDs
                    }, function(results) {
                        if (results) {
                            var obj1 = [];
                            obj1 = JSON.parse(results);
                            //console.log(obj1)
                            //console.log(FinalResults)
                            StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj1["road_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color);
                            ComplexQueryList = []
                            edit = 0;
                            var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                            Qu.Complex = 1
                            changeselectioncolor(vis.QueryManager.nextQueryColor);
                            editQId = -1
                            Qu.DOMLink['Edit'].removeClass("iconActive");
                            //DrawChart()
                        }

                    });

                } else {
                    console.log("No Results");
                }
            });
        } else
            //If your selection is a rectangle
            if (type === 'rectangle') {
                //Prepare rectangle border for query
                var coor = [];
                coor = layer.getLatLngs();
                QcoorLat = coor[0][0].lat;
                QcoorLng = coor[0][0].lng;
                var stcor = coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                for (var k = 1; k < coor[0].length; k++) {
                    stcor = stcor + "," + coor[0][k].lng.toString() + " " + coor[0][k].lat.toString();
                }
                stcor = stcor + "," + coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
                //Send rectangle border to the server for query
                $.post("/Porto/system/query.php", {
                    cor: stcor
                }, function(results) {
                    // the output of the response is now handled via a variable call 'results'
                    if (results) {
                        var obj = [];
                        obj = JSON.parse(results);
                        ComplexQueryInfo(obj["Draw"], stcor);
                        $("#finish_editing").hide();
                        FinalResults = FilterComplexQuery();
                        tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                        $.post("/Porto/system/query_edit.php", {
                            trips: tripIDs
                        }, function(results) {
                            if (results) {
                                var obj1 = [];
                                obj1 = JSON.parse(results);
                                StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj1["road_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color);
                                ComplexQueryList = []
                                edit = 0;
                                var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                Qu.Complex = 1
                                changeselectioncolor(vis.QueryManager.nextQueryColor);
                                editQId = -1
                                Qu.DOMLink['Edit'].removeClass("iconActive");
                            }

                        });
                    } else {
                        console.log("No Results");
                    }
                });

            }
        else
            //If your selection is a polygon
            if (type === 'polygon') {
                //Prepare polygon border for query
                var coor = [];
                coor = layer.getLatLngs();
                QcoorLat = coor[0][0].lat;
                QcoorLng = coor[0][0].lng;
                var stcor = coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                for (var k = 1; k < coor[0].length; k++) {
                    stcor = stcor + "," + coor[0][k].lng.toString() + " " + coor[0][k].lat.toString();
                }
                stcor = stcor + "," + coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
                //Send polygon border to the server for query
                $.post("/Porto/system/query.php", {
                    cor: stcor
                }, function(results) {
                    // the output of the response is now handled via a variable call 'results'
                    if (results) {
                        var obj = [];
                        obj = JSON.parse(results);
                        ComplexQueryInfo(obj["Draw"], stcor);
						$("#finish_editing").hide();
                        FinalResults = FilterComplexQuery();
                        tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                        $.post("/Porto/system/query_edit.php", {
                            trips: tripIDs
                        }, function(results) {
                            if (results) {
                                var obj1 = [];
                                obj1 = JSON.parse(results);
                                StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj1["road_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color);
                                ComplexQueryList = []
                                edit = 0;
                                var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                Qu.Complex = 1
                                changeselectioncolor(vis.QueryManager.nextQueryColor);
                                editQId = -1
                                Qu.DOMLink['Edit'].removeClass("iconActive");
                            }

                        });

                    } else {
                        console.log("No Results");
                    }
                });
            }
    }
    drawnItems.addLayer(layer); //Add your Selection to Map
    //Reset_Select()
});
//*****************************************************************************************************************************************
// Load .GeoJSON.
//*****************************************************************************************************************************************
$('input[type=file]').change(function(e) {
    //var T1 = kendo.toString($("#datetimepicker1").data("kendoDateTimePicker").value(), "yyyy/MM/dd HH:mm:ss").replace(/\//g, '-');
    //var T2 = kendo.toString($("#datetimepicker2").data("kendoDateTimePicker").value(), "yyyy/MM/dd HH:mm:ss").replace(/\//g, '-');
    var SMM = "1";
    var RS = "Single";
    /*
    if (SM == "Intersect") {
        SMM = "1";
    } else if (SM == "Pick-UP") {
        SMM = "2";
    } else {
        SMM = "3";
    }
	*/

    var T1 = document.getElementById("search-from-date").value + ":00";
    var T2 = document.getElementById("search-to-date").value + ":00";

    var input = document.getElementById("upload-file");
    var fReader = new FileReader();
    fReader.readAsDataURL(input.files[0]);
    fReader.onloadend = function(event) {
        var geojsonLayer1 = L.geoJson.ajax(event.target.result, {
            middleware: function(data) {
                for (var j = 0; j < data.features.length; j++) {
                    var poly = [];
                    for (var i = 0; i < data.features[j].geometry.coordinates[0].length; i++) {
                        var point = new L.LatLng(data.features[j].geometry.coordinates[0][i][1], data.features[j].geometry.coordinates[0][i][0]);
                        poly.push(point);
                    }
                    var color = vis.QueryManager.nextQueryColor;
                    var polygon = L.polygon([poly], {
                        color: color,
                        fillColor: color,
                    });
                    featureGroup.addLayer(polygon);
                    var type = 'polygon';
                    layer = polygon;
                    layer.type = type;
                    if (RS == "Single") {
                        clearMap();
                        featureGroup.clearLayers();
                        drawnItems.clearLayers();
                    }
                    newQuery = vis.QueryManager.CreateQuery(layer, color)
                    var coor = [];
                    coor = layer.getLatLngs();
                    var stcor = coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                    for (var k = 1; k < coor[0].length; k++) {
                        stcor = stcor + "," + coor[0][k].lng.toString() + " " + coor[0][k].lat.toString();
                    }
                    stcor = stcor + "," + coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                    stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
                    //Send polygon border to the server for query
                    $.post("/Porto/system/query.php", {
                        cor: stcor
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"], obj["road_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color);
                        } else {
                            console.log("No Results");
                        }
                    });
                    drawnItems.addLayer(polygon);
                }
            }
        });
    }
});
//*****************************************************************************************************************************************
// Edit Query
//*****************************************************************************************************************************************
function intersection(a, b) {
    var c = {}
    for (var key in a)
        if (key in b)
            c[key] = a[key];
    return c;
}
//*****************************************************************************************************************************************
function ComplexQueryInfo(results, Parameters) {
    var obj0 = new Object();
    obj0['QueryPara'] = Parameters;
    obj0['QueryResults'] = results;
    ComplexQueryList.push(obj0);
    //console.log(ComplexQueryList)
}
//*****************************************************************************************************************************************
function FilterComplexQuery() {
    var StartR = {}
    var IntersectR = {}
    var EndR = {}
    for (var i = 0; i < ComplexQueryList.length; i++) {
        var TempQuery = ComplexQueryList[i]
        var Para = TempQuery["QueryPara"].split("!")
        if (Para[3] == "1") {
            if (Object.keys(IntersectR).length != 0) {
                /*IntersectR = collectionIntersection(IntersectR, TempQuery["QueryResults"],
                    function(item) {
                        return item.tripid;
                    });*/
                IntersectR = intersection(IntersectR, TempQuery["QueryResults"])
            } else
                IntersectR = TempQuery["QueryResults"]

        }
        if (Para[3] == "2") {
            /*StartR = collectionUnion(StartR, TempQuery["QueryResults"],
                function(item) {
                    return item.tripid;
                });*/
            StartR = $.extend({}, StartR, TempQuery["QueryResults"]);
        }
        if (Para[3] == "3") {
            /*EndR = collectionUnion(EndR, TempQuery["QueryResults"],
                function(item) {
                    return item.tripid;
                });*/
            EndR = $.extend({}, EndR, TempQuery["QueryResults"]);
        }
    }
    var ILen = Object.keys(IntersectR).length
    var SLen = Object.keys(StartR).length
    var ELen = Object.keys(EndR).length
    var FinalResults = []
    if ((ILen == 0) && (SLen == 0) && (ELen >= 1)) {
        FinalResults = EndR;
    }
    if ((ILen == 0) && (SLen >= 1) && (ELen == 0)) {
        FinalResults = StartR;
    }
    if ((ILen == 0) && (SLen >= 1) && (ELen >= 1)) {
        /*FinalResults = collectionIntersection(StartR, EndR, function(item) {
            return item.tripid
        });*/
        FinalResults = intersection(StartR, EndR)
    }
    if ((ILen >= 1) && (SLen == 0) && (ELen == 0)) {
        FinalResults = IntersectR;
    }
    if ((ILen >= 1) && (SLen == 0) && (ELen >= 1)) {
        /*FinalResults = collectionIntersection(IntersectR, EndR, function(item) {
            return item.tripid
        });*/
        FinalResults = intersection(IntersectR, EndR)
    }
    if ((ILen >= 1) && (SLen >= 1) && (ELen == 0)) {
        /*FinalResults = collectionIntersection(StartR, IntersectR, function(item) {
            return item.tripid
        });*/

        FinalResults = intersection(StartR, IntersectR)
    }
    if ((ILen >= 1) && (SLen >= 1) && (ELen >= 1)) {
        /*FinalResults = collectionIntersection(StartR, IntersectR, function(item) {
            return item.tripid
        });*/
        FinalResults = intersection(StartR, IntersectR)
        /*FinalResults = collectionIntersection(FinalResults, EndR, function(item) {
            return item.tripid
        });*/
        FinalResults = intersection(FinalResults, EndR)
    }



    return FinalResults;
}
//*****************************************************************************************************************************************
// Date/Time Selector
//*****************************************************************************************************************************************
jQuery(document).ready(function() {
    'use strict';
    //jQuery('#filter-date, #search-from-date, #search-to-date').datetimepicker();
    jQuery('#search-from-date').datetimepicker({
        value: '2013/09/02 07:00:00',
        mask: true,
    });
    jQuery('#search-to-date').datetimepicker({
        value: '2013/09/04 21:00:00',
        mask: true,
    });
});
//*****************************************************************************************************************************************
// Function to store Query Info
//*****************************************************************************************************************************************
function StoreInfo(parameters, results, WeekDays, DayHours, road_Array, Trip_Rank, St_Rank_count, St_Rank_speed, type, Complex, Id, Qcolor) {
    var Qu = vis.QueryManager.GetQueryByQueryId(Id);
    if (Qu != null) {
        Qu.parameters = parameters;
        Qu.Results = results;
        Qu.WeekDays = WeekDays;
        Qu.DayHours = DayHours;
        Qu.road_Array = road_Array;
        Qu.Trip_Rank = Trip_Rank;
        Qu.St_Rank_count = St_Rank_count;
        Qu.St_Rank_speed = St_Rank_speed;
        Qu.Qtype = type;
        Qu.Complex = Complex;
        Qu.color = Qcolor;
    }
    ActiveQID = Object.create(Qu);
    TempQO = Object.create(Qu);
    VisSelected = [];
    VisSelected.push(Id)
    //DrawStreet(Qu.road_Array);
    clearMap();
    if (AvtiveVis == 1) {
        DrawStreet(ActiveQID.road_Array);
    } else if (AvtiveVis == 2) {
        DrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
    } else if (AvtiveVis == 3) {
        DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
    } else if (AvtiveVis == 4) {
        DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
    } else if (AvtiveVis == 5) {
        DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
    }
    tabledata(Qu.St_Rank_count, Qu.St_Rank_speed, Qu.Trip_Rank);
    // tableDataCollect(Qu.St_Rank_count, Qu.St_Rank_speed, Qu.Trip_Rank);
    DrawChart();
}
//*****************************************************************************************************************************************
// Query Color
//*****************************************************************************************************************************************
function changeselectioncolor(cl) {
    drawControl.setDrawingOptions({
        rectangle: {
            shapeOptions: {
                color: cl
            }
        },
        circle: {
            shapeOptions: {
                color: cl
            }
        },
        polygon: {
            shapeOptions: {
                color: cl
            }
        }
    });

}
//*****************************************************************************************************************************************
// Street Color
//*****************************************************************************************************************************************
function getColor(d) {
    return d <= 05 ? '#8B0000' : //Dark Red
        d <= 10 ? '#FF0000' : //Red
        d <= 20 ? '#FF8C00' : //Orange
        '#228B22'; //Green
}
//*****************************************************************************************************************************************
//// Draw Street Categories / Speed
//*****************************************************************************************************************************************
function DrawStreet(objtraj) {
    legend.addTo(map);
    for (var k = 0; k < 11; k++) {
        RoadTypeLayer[k].clearLayers();
    }
    //primary
    for (j in objtraj.primary) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.primary[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[2].addLayer(polyline); // Add to map
    }

    //primary_link
    for (j in objtraj.primary_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.primary_link[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[2].addLayer(polyline); // Add to map
    }

    //secondary
    for (j in objtraj.secondary) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.secondary[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[5].addLayer(polyline); // Add to map
    }

    //secondary_link
    for (j in objtraj.secondary_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.secondary_link[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[5].addLayer(polyline); // Add to map
    }

    //motorway
    for (j in objtraj.motorway) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.motorway[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[1].addLayer(polyline); // Add to map
    }

    //motorway_link
    for (j in objtraj.motorway_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.motorway_link[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[1].addLayer(polyline); // Add to map
    }

    //residential
    for (j in objtraj.residential) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.residential[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[3].addLayer(polyline); // Add to map
    }

    //road
    for (j in objtraj.road) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.road[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[4].addLayer(polyline); // Add to map
    }

    //service
    for (j in objtraj.service) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.service[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[6].addLayer(polyline); // Add to map
    }

    //unclassified
    for (j in objtraj.unclassified) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.unclassified[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[10].addLayer(polyline); // Add to map
    }

    //cycleway
    for (j in objtraj.cycleway) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.cycleway[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[9].addLayer(polyline); // Add to map
    }

    //Living_Street
    for (j in objtraj.living_street) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.living_street[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[0].addLayer(polyline); // Add to map
    }

    //tertiary
    for (j in objtraj.tertiary) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.tertiary[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[7].addLayer(polyline); // Add to map
    }

    //tertiary_link
    for (j in objtraj.tertiary_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.tertiary_link[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[7].addLayer(polyline); // Add to map
    }

    //trunk
    for (j in objtraj.trunk) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.trunk[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[8].addLayer(polyline); // Add to map
    }

    //trunk_link
    for (j in objtraj.trunk_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.trunk_link[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[8].addLayer(polyline); // Add to map
    }

}
//*****************************************************************************************************************************************
// Draw Trajectories
//*****************************************************************************************************************************************
function DrawTraj1(objtraj, ID, color1) {
    var q = vis.QueryManager.GetQueryByQueryId(ID)
    if (edit == 1) {

        for (var i = 0; i < q.extraLayers.length; i++) {
            try {
                if (q.extraLayers[i] != null)
                    map.removeLayer(q.extraLayers[i]);
            } catch (e) {}
        }
        q.extraLayers = []
    }
    var Trajectories = []
    var SPoints = []
    var EPoints = []
    for (var j in objtraj) {
        objtraj[j]["trajectorypoints"] = objtraj[j]["trajectorypoints"].replace("LINESTRING(", "")
        objtraj[j]["trajectorypoints"] = objtraj[j]["trajectorypoints"].replace(")", "")
        var Traj = objtraj[j]["trajectorypoints"].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[0], T[1]]);
        }
        var TempT = {
            "type": "LineString",
            "properties": {
                "id": j
            },
            "coordinates": polylinePoints
        }
        Trajectories.push(TempT);
        var circle1 = {
            "type": "Point",
            "coordinates": polylinePoints[0]
        }
        var circle2 = {
            "type": "Point",
            "coordinates": polylinePoints[Traj.length - 1]
        }
        SPoints.push(circle1)
        EPoints.push(circle2)
    }
    polylines = L.geoJson(Trajectories, {
        style: {
            color: color1,
            weight: 4,
            opacity: 0.5
        }
    }).addTo(map);

    Start_Points = L.geoJSON(SPoints, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 4,
                color: 'DarkGreen',
                fillColor: 'green',
                fillOpacity: 0.5,
                weight: 1,
                opacity: 1,
            })
        }
    }).addTo(map);
    End_Points = L.geoJson(EPoints, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 4,
                color: 'Maroon',
                fillColor: 'red',
                fillOpacity: 0.5,
                weight: 1,
                opacity: 1,
            })
        }
    }).addTo(map);
    //Farah For Delete
    //q.extraLayers.push(polylines);
    //q.extraLayers.push(Start_Points);
    //q.extraLayers.push(End_Points);
}
//*****************************************************************************************************************************************
// Draw Pick-UP
//*****************************************************************************************************************************************
function DrawPick(objtraj, ID, color1) {
    var heatMap = [];
    for (var j in objtraj) {
        objtraj[j]["trajectorypoints"] = objtraj[j]["trajectorypoints"].replace("LINESTRING(", "")
        objtraj[j]["trajectorypoints"] = objtraj[j]["trajectorypoints"].replace(")", "")
        var Traj = objtraj[j]["trajectorypoints"].split(',');
        T = Traj[0].split(' ');
        heatMap.push([T[1], T[0], 10]);
    }

    heatLayer = L.heatLayer(heatMap, {
        radius: 10,
        blur: 15,
    });
    heatLayer.addTo(map);
}
//*****************************************************************************************************************************************
// Draw Drop-Off
//*****************************************************************************************************************************************
function DrawDrop(objtraj, ID, color1) {
    var heatMap = [];
    for (var j in objtraj) {
        objtraj[j]["trajectorypoints"] = objtraj[j]["trajectorypoints"].replace("LINESTRING(", "")
        objtraj[j]["trajectorypoints"] = objtraj[j]["trajectorypoints"].replace(")", "")
        var Traj = objtraj[j]["trajectorypoints"].split(',');
        T = Traj[Traj.length - 1].split(' ');
        heatMap.push([T[1], T[0], 10]);
    }

    heatLayer = L.heatLayer(heatMap, {
        radius: 10,
        blur: 15,
    });
    heatLayer.addTo(map);
}
//*****************************************************************************************************************************************
// Street Weight
//*****************************************************************************************************************************************
function getWeight(d) {
    return d <= 10 ? 1 :
        d <= 20 ? 2 :
        d <= 30 ? 3 :
        d <= 40 ? 4 :
        d <= 50 ? 5 :
        d <= 60 ? 6 :
        d <= 70 ? 7 :
        d <= 80 ? 8 :
        d <= 90 ? 9 :
        d <= 100 ? 10 :
        d <= 110 ? 11 :
        d <= 120 ? 12 :
        d <= 130 ? 13 :
        d <= 140 ? 14 :
        15;
}
//*****************************************************************************************************************************************
//// Draw Street Categories / Count
//*****************************************************************************************************************************************
function DrawStreet1(objtraj, color) {

    for (var k = 0; k < 11; k++) {
        RoadTypeLayer[k].clearLayers();
    }
    //primary
    for (j in objtraj.primary) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.primary[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[2].addLayer(polyline); // Add to map
    }

    //primary_link
    for (j in objtraj.primary_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.primary_link[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[2].addLayer(polyline); // Add to map
    }

    //secondary
    for (j in objtraj.secondary) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.secondary[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[5].addLayer(polyline); // Add to map
    }

    //secondary_link
    for (j in objtraj.secondary_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.secondary_link[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[5].addLayer(polyline); // Add to map
    }

    //motorway
    for (j in objtraj.motorway) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.motorway[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[1].addLayer(polyline); // Add to map
    }

    //motorway_link
    for (j in objtraj.motorway_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.motorway_link[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[1].addLayer(polyline); // Add to map
    }

    //residential
    for (j in objtraj.residential) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.residential[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[3].addLayer(polyline); // Add to map
    }

    //road
    for (j in objtraj.road) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.road[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[4].addLayer(polyline); // Add to map
    }

    //service
    for (j in objtraj.service) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.service[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[6].addLayer(polyline); // Add to map
    }

    //unclassified
    for (j in objtraj.unclassified) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.unclassified[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[10].addLayer(polyline); // Add to map
    }

    //cycleway
    for (j in objtraj.cycleway) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.cycleway[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[9].addLayer(polyline); // Add to map
    }

    //Living_Street
    for (j in objtraj.living_street) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.living_street[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[0].addLayer(polyline); // Add to map
    }

    //tertiary
    for (j in objtraj.tertiary) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.tertiary[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[7].addLayer(polyline); // Add to map
    }

    //tertiary_link
    for (j in objtraj.tertiary_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.tertiary_link[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[7].addLayer(polyline); // Add to map
    }

    //trunk
    for (j in objtraj.trunk) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.trunk[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[8].addLayer(polyline); // Add to map
    }

    //trunk_link
    for (j in objtraj.trunk_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.trunk_link[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[8].addLayer(polyline); // Add to map
    }
}

//*****************************************************************************************************************************************
//// Draw Grouped BarChart
//*****************************************************************************************************************************************
function DrawGroupedBarChart(xtitle, Ytitle, ChDataB, svg3) {
    nv.addGraph(function() {
        var chart = nv.models.multiBarChart().stacked(false).margin({
                left: 70
            })
            .rotateLabels(0) //Angle to rotate x-axis labels.
            .showControls(false) //Allow user to switch between 'Grouped' and 'Stacked' mode.
            .groupSpacing(0.3) //Distance between each group of bars.
            .reduceXTicks(false);
        chart.xAxis.axisLabel(xtitle);
        chart.yAxis.axisLabel(Ytitle).tickFormat(d3.format(',.0f'));
        d3.select(svg3).datum(ChDataB).call(chart);
        nv.utils.windowResize(chart.update);
        chart.legend.dispatch.on('legendClick', function(d, i) {
            if (d.values.length == 7) {
                DrawChart();
                ActiveQID = Object.create(TempQO);
                tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                // tableDataCollect(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                clearMap();
                if (AvtiveVis == 1) {
                    DrawStreet(ActiveQID.road_Array);
                } else if (AvtiveVis == 2) {
                    DrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
                } else if (AvtiveVis == 3) {
                    DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                } else if (AvtiveVis == 4) {
                    DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                } else if (AvtiveVis == 5) {
                    DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                }

            }
        });
        return chart;
    }, function() {


        d3.selectAll(".nv-bar").on('click',
            function(e) {


                var Timelabels1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
                var Timelabels2 = {
                    "Sun": 0,
                    "Mon": 1,
                    "Tue": 2,
                    "Wed": 3,
                    "Thu": 4,
                    "Fri": 5,
                    "Sat": 6
                }
                //get bar number of the click event   
                //console.log(e)
                time = e.x;
                idx = e.series;
                var temp;
                if (Timelabels1.indexOf(time) > -1)
                    temp = ChDataB[idx]["key"].split(":")
                else
                    temp = ChDataB_Main[idx]["key"].split(":")
                //get id of the query of the click event

                //console.log(temp) 
                if (temp.length <= 2) {
                    qid = temp[1]
                    //get the query parameters by qid
                    var Qu = vis.QueryManager.GetQueryByQueryId(qid);

                    //var para = Qu.parameters
					var para="( "+Object.keys(Qu.Results).toString()+" )"//Farah2
                    if (Timelabels1.indexOf(time) > -1)
                        para += "!H!" + time
                    else
                        para += "!D!" + Timelabels2[time]
                    //console.log(para) 
                    //post query to get the interaction results
                    $.post("/Porto/system/query_filter.php", {
                        para: para
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj1 = [];
                            obj1 = JSON.parse(results);
                            // obj1 is the result of the interaction query that you will use to modify your visualization
                            //Qu.extra_query.push(obj1)
                            //console.log(obj1);
                            if (Timelabels1.indexOf(time) <= -1)
                                DrawHourChart(obj1["DayHours"], qid, Qu.Color, time);

                            ActiveQID.Results = obj1["Draw"];
                            ActiveQID.DayHours = obj1["DayHours"];
                            ActiveQID.road_Array = obj1["road_Array"];
                            ActiveQID.Trip_Rank = obj1["Trip_Rank"];
                            ActiveQID.St_Rank_count = obj1["St_Rank_count"];
                            ActiveQID.St_Rank_speed = obj1["St_Rank_speed"];

                            tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                            // tableDataCollect(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                            clearMap();
                            if (AvtiveVis == 1) {
                                DrawStreet(ActiveQID.road_Array);
                            } else if (AvtiveVis == 2) {
                                DrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
                            } else if (AvtiveVis == 3) {
                                DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                            } else if (AvtiveVis == 4) {
                                DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                            } else if (AvtiveVis == 5) {
                                DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                            }


                            //console.log(obj1)
                        } else {
                            console.log("No Results");
                        }
                    });
                } else if (temp.length > 2) {
                    //get id of the query of the click event
                    qid = temp[1]
                    day = temp[2]
                    //get the query parameters by qid


                    var Qu = vis.QueryManager.GetQueryByQueryId(qid);

                    //var para1 = Qu.parameters + "!" + time + "!" + Timelabels2[day]
					var para1="( "+Object.keys(Qu.Results).toString()+" )"+"!"+time+"!"+Timelabels2[day]//Farah2


                    //console.log(para1) 
                    //post query to get the interaction results
                    $.post("/Porto/system/query_filter2.php", {
                        para1: para1
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj1 = [];
                            obj1 = JSON.parse(results);
                            ActiveQID.Results = obj1["Draw"];
                            ActiveQID.road_Array = obj1["road_Array"];
                            ActiveQID.Trip_Rank = obj1["Trip_Rank"];
                            ActiveQID.St_Rank_count = obj1["St_Rank_count"];
                            ActiveQID.St_Rank_speed = obj1["St_Rank_speed"];

                            tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                            // tableDataCollect(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank)
                            clearMap();
                            if (AvtiveVis == 1) {
                                DrawStreet(ActiveQID.road_Array);
                            } else if (AvtiveVis == 2) {
                                DrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
                            } else if (AvtiveVis == 3) {
                                DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                            } else if (AvtiveVis == 4) {
                                DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                            } else if (AvtiveVis == 5) {
                                DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                            }
                            //console.log(obj1)
                        } else {
                            console.log("No Results");
                        }
                    });

                }
            });
    });
}

//*****************************************************************************************************************************************
//// Draw Chart
//*****************************************************************************************************************************************
function DrawChart() {
    $("#bottom1 svg").empty();
    $("#top1 svg").empty();
    var Ytitle = "Count"
    var xtitle1 = "DayHours"
    var xtitle2 = "WeekDays"
    var svg1 = '#top1 svg'
    var svg2 = '#bottom1 svg'
    var BarChartData1 = []
    var BarChartData2 = []

    for (var j0 = 0; j0 < VisSelected.length; j0++) {
        j = VisSelected[j0]
        var qu = vis.QueryManager.GetQueryByQueryId(j);
        var temp1 = qu.DayHours
        var temp2 = qu.WeekDays

        //var Timelabels = ["12am","1am","2am","3am","4am","5am","6am","7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm","11pm"]
        var Timelabels1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
        var Timelabels2 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

        var DdataB1 = []
        var DdataB2 = []

        for (var i = 0; i < 24; i++) {
            if (i in temp1) {
                DdataB1.push({
                    x: Timelabels1[i],
                    y: parseInt(temp1[i]['total']),

                });
            } else {
                DdataB1.push({
                    x: Timelabels1[i],
                    y: 0,

                });
            }
        }
        for (var i = 0; i < 7; i++) {
            if (i in temp2) {
                DdataB2.push({
                    x: Timelabels2[i],
                    y: parseInt(temp2[i]['total']),

                });
            } else {
                DdataB2.push({
                    x: Timelabels2[i],
                    y: 0,

                });
            }
        }
        var FDataB1 = {
            values: DdataB1,
            key: "Query:" + qu.QueryId,
            color: qu.Color
        }
        BarChartData1.push(FDataB1)
        var FDataB2 = {
            values: DdataB2,
            key: "Query:" + qu.QueryId,
            color: qu.Color
        }

        BarChartData2.push(FDataB2)
    }
    ChDataB_Main = BarChartData2
    DrawGroupedBarChart(xtitle1, Ytitle, BarChartData1, svg1)
    DrawGroupedBarChart(xtitle2, Ytitle, BarChartData2, svg2)
}

function DrawChart1() {
    $("#top1 svg").empty();
    var Ytitle = "Count"
    var xtitle1 = "DayHours"
    var svg1 = '#top1 svg'
    var BarChartData1 = []
    DrawGroupedBarChart(xtitle1, Ytitle, BarChartData1, svg1)
}
//*****************************************************************************************************************************************
//// Draw Hour Chart
//*****************************************************************************************************************************************
function DrawHourChart(temp1, qid, Color, time) {

    $("#top1 svg").empty();
    var Ytitle = "Count"
    var xtitle1 = "DayHours"
    var svg1 = '#top1 svg'
    var BarChartData1 = []

    //var Timelabels = ["12am","1am","2am","3am","4am","5am","6am","7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm","11pm"]
    var Timelabels1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
    var DdataB1 = []
    for (var i = 0; i < 24; i++) {
        if (i in temp1) {
            DdataB1.push({
                x: Timelabels1[i],
                y: parseInt(temp1[i]['total']),

            });
        } else {
            DdataB1.push({
                x: Timelabels1[i],
                y: 0,

            });
        }
    }

    var FDataB1 = {
        values: DdataB1,
        key: "Query:" + qid + ":" + time,
        color: Color
    }
    BarChartData1.push(FDataB1)
    DrawGroupedBarChart(xtitle1, Ytitle, BarChartData1, svg1)
}
//*****************************************************************************************************************************************
//// Add Data List View
//*****************************************************************************************************************************************
function tabledata(objrank, objrank1, objrank2) {
    $("#singleSort").data('kendoGrid').dataSource.data([]);
    var Data = objrank.split(',');
    var grid = $("#singleSort").data("kendoGrid");
    var datasource = grid.dataSource;
    for (var i = 0; i < Data.length; i++) {
        var Data1 = Data[i].split(':');
        datasource.insert({
            Street: Data1[0],
            Flow: parseInt(Data1[1]),
            // Speed: parseFloat(Data1[2]).toFixed(1),
        });
    }

    $("#singleSort1").data('kendoGrid').dataSource.data([]);
    var Data1 = objrank1.split(',');
    var grid1 = $("#singleSort1").data("kendoGrid");
    var datasource1 = grid1.dataSource;
    for (var i = 0; i < Data1.length; i++) {
        var Data11 = Data1[i].split(':');
        datasource1.insert({
            Street: Data11[0],
            Speed: parseFloat(Data11[1]).toFixed(1),
            // Flow: parseInt(Data11[2]),

        });
    }

    $("#singleSort2").data('kendoGrid').dataSource.data([]);
    var Data2 = objrank2.split(',');
    var grid2 = $("#singleSort2").data("kendoGrid");
    var datasource2 = grid2.dataSource;
    for (var i = 0; i < Data2.length; i++) {
        var Data12 = Data2[i].split(':');
        if ((parseFloat(Data12[1] / 1000).toFixed(4)) > 0.0020) {
            datasource2.insert({
                TripID: Data12[0],
                TripLength: parseFloat(Data12[1] / 1000).toFixed(4),
            });
        }
    }
    //grid2.dataSource.sort({field: "TripLength", dir: "desc"});
}
//*****************************************************************************************************************************************
//// List View1
//*****************************************************************************************************************************************
function grid_change() {

}
/*
function HighlightStreet(ST_Name) {
    var polylinePoints = [];
    for (j = 0; j < P_ST[ST_Name].length; j++) {
        if (RID[P_ST[ST_Name][j]]) {
            var Traj = RID[P_ST[ST_Name][j]].split(',');
            var polylinePoints = [];
            for (var i = 0; i < Traj.length; i++) {
                T = Traj[i].split(' ');
                polylinePoints.push([T[1], T[0]]);
            }
        }
    }

    Street_Layer = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
        color: "#00FF00", // polyline color
        weight: 20, // polyline weight
        opacity: 0.5, // polyline opacity
        smoothFactor: 1.0 // polyline smoothFactor
    }).bindPopup('<strong>' + ST_Name + '</strong>');
    if (Street_Layer != -1) {
        map.removeLayer(Street_Layer);
    }
    map.setView(polylinePoints[0], 15, {
        animation: true
    });
    map.addLayer(Street_Layer); // Add to map
    Street_Layer.openPopup();
}
*/
function HighlightStreet(ST_Name){
	var polylinePoints = [];
	if(RID[ST_Name]){
		var Traj = RID[ST_Name].split(',');
		var polylinePoints = [];
		for (var i = 0; i < Traj.length; i++) {
			T = Traj[i].split(' ');
			polylinePoints.push([T[1], T[0]]);
		}
	}
	Street_Layer = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
		color: "#00FF00", // polyline color
		weight: 20, // polyline weight
		opacity: 0.5, // polyline opacity
		smoothFactor: 1.0 // polyline smoothFactor
	}).bindPopup('<strong>Street ID: '+ST_Name+'</strong>');
	if(Street_Layer != -1){
		map.removeLayer(Street_Layer);
	}
	var ZOM = map.getZoom();
	map.setView(polylinePoints[0], ZOM, {animation: true});
	map.addLayer(Street_Layer); // Add to map
	Street_Layer.openPopup();
}

function HoverOnGrid() {
    $("tr", "#singleSort").on("click", function(ev) {
        var grid = $("#singleSort").data("kendoGrid");
        var rowData = grid.dataItem(this);
        var row = $(this).closest("tr");
        var rowIdx = $("tr", grid.tbody).index(row);
        var ifSelectRow = $(this).attr('aria-selected');
        if (rowData && rowIdx != -1) {
            map.removeLayer(Street_Layer);
            if (ifSelectRow != 'true'){
                HighlightStreet(rowData.Street);
            }
            else{
                map.setView([QcoorLat, QcoorLng], 15, {
                    animation: true
                });
                $(this).removeClass("k-state-selected")
            }
        }
    });

    // $("tr", "#singleSort").on("dblclick", function(ev) {
    //     var grid = $("#singleSort").data("kendoGrid");
    //     var rowData = grid.dataItem(this);
    //     var row = $(this).closest("tr");
    //     var rowIdx = $("tr", grid.tbody).index(row);
    //     if (rowData && rowIdx != -1) {
    //         map.removeLayer(Street_Layer);
    //         map.setView([QcoorLat, QcoorLng], 15, {
    //             animation: true
    //         });
    //     }
    // });
}

$("#singleSort").kendoGrid({
    dataSource: {
        data: [],
        pageSize: 5
    },
    selectable: true,
    change: grid_change,
    dataBound: HoverOnGrid,
    sortable: {
        mode: "single",
        allowUnsort: false
    },
    pageable: {
        buttonCount: 2
    },
    scrollable: false,
    columns: [{
            field: "Street",
            title: "Street ID",
            sortable: false,
            width: 200
            // width: 300
        },
        {
            field: "Flow",
            title: "Flow",
            sortable: true,
            width: 175
            // width: 75
        },
        // {
        //     field: "Speed",
        //     title: "Speed (Km/h)",
        //     sortable: true,
        //     width: 75
        // },
    ]
});
//*****************************************************************************************************************************************
//// List View2
//*****************************************************************************************************************************************
function grid_change1(arg) {}

function HoverOnGrid1() {
    $("tr", "#singleSort1").on("click", function(ev) {
        var grid = $("#singleSort1").data("kendoGrid");
        var rowData = grid.dataItem(this);
        var row = $(this).closest("tr");
        var rowIdx = $("tr", grid.tbody).index(row);
        var ifSelectRow = $(this).attr('aria-selected');
        if (rowData && rowIdx != -1) {
            map.removeLayer(Street_Layer);
            if (ifSelectRow != 'true'){
                HighlightStreet(rowData.Street);
            }
            else{
                map.setView([QcoorLat, QcoorLng], 15, {
                    animation: true
                });
                $(this).removeClass("k-state-selected")
            }
        }
    });

    // $("tr", "#singleSort1").on("dblclick", function(ev) {
    //     var grid = $("#singleSort1").data("kendoGrid");
    //     var rowData = grid.dataItem(this);
    //     var row = $(this).closest("tr");
    //     var rowIdx = $("tr", grid.tbody).index(row);
    //     if (rowIdx != -1) {
    //         map.removeLayer(Street_Layer);
    //         map.setView([QcoorLat, QcoorLng], 15, {
    //             animation: true
    //         });
    //     }
    // });
}

$("#singleSort1").kendoGrid({
    dataSource: {
        data: [],
        pageSize: 5
    },
    selectable: true,
    change: grid_change1,
    dataBound: HoverOnGrid1,
    sortable: {
        mode: "single",
        allowUnsort: false
    },
    pageable: {
        buttonCount: 2
    },
    scrollable: false,
    columns: [{
            field: "Street",
            title: "Street ID",
            sortable: false,
            width: 200
            // width: 300
        },
        {
            field: "Speed",
            title: "Speed (Km/h)",
            sortable: true,
            width: 175
            // width: 75
        },
        // {
        //     field: "Flow",
        //     title: "Flow",
        //     sortable: false,
        //     width: 75
        // },
    ]
});

function HighlightTraj(j) {
    ActiveQID.Results[j]["trajectorypoints"] = ActiveQID.Results[j]["trajectorypoints"].replace("LINESTRING(", "")
    ActiveQID.Results[j]["trajectorypoints"] = ActiveQID.Results[j]["trajectorypoints"].replace(")", "")
    var Traj = ActiveQID.Results[j]["trajectorypoints"].split(',');
    var polylinePoints = [];
    for (var i = 0; i < Traj.length; i++) {
        T = Traj[i].split(' ');
        polylinePoints.push([T[1], T[0]]);
    }
    Poly_Layer = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
        color: "#00FF00", // polyline color
        weight: 20, // polyline weight
        opacity: 0.5, // polyline opacity
        smoothFactor: 1.0 // polyline smoothFactor
    }).bindPopup('<strong>Trip: ' + j + '</strong>');
    if (Poly_Layer != -1) {
        map.removeLayer(Poly_Layer);
    }
    map.setView(polylinePoints[0], 15, {
        animation: true
    });
    map.addLayer(Poly_Layer); // Add to map
    Poly_Layer.openPopup();
}
//*****************************************************************************************************************************************
//// List View3
//*****************************************************************************************************************************************
function grid_change2(arg) {}

function HoverOnGrid2() {
    $("tr", "#singleSort2").on("click", function(ev) {
        var grid = $("#singleSort2").data("kendoGrid");
        var rowData = grid.dataItem(this);
        var row = $(this).closest("tr");
        var rowIdx = $("tr", grid.tbody).index(row);
        var ifSelectRow = $(this).attr('aria-selected');
        if (rowData && rowIdx != -1) {
            map.removeLayer(Poly_Layer);
            if (ifSelectRow != 'true'){
                HighlightTraj((rowData.TripID).toString());
            }
            else{
                map.setView([QcoorLat, QcoorLng], 15, {
                    animation: true
                });
                $(this).removeClass("k-state-selected")
            }
        }
    });

    // $("tr", "#singleSort2").on("dblclick", function(ev) {
    //     var grid = $("#singleSort2").data("kendoGrid");
    //     var rowData = grid.dataItem(this);
    //     var row = $(this).closest("tr");
    //     var rowIdx = $("tr", grid.tbody).index(row);
    //     if (rowIdx != -1) {
    //         map.removeLayer(Poly_Layer);
    //         map.setView([QcoorLat, QcoorLng], 15, {
    //             animation: true
    //         });
    //     }
    // });
}

$("#singleSort2").kendoGrid({
    dataSource: {
        data: [],
        pageSize: 5
    },
    selectable: true,
    change: grid_change2,
    dataBound: HoverOnGrid2,
    sortable: {
        mode: "single",
        allowUnsort: false
    },
    pageable: {
        buttonCount: 2
    },
    scrollable: false,
    columns: [{
            field: "TripID",
            title: "Trajectory ID",
            sortable: false,
            width: 200
        },
        {
            field: "TripLength",
            title: "Trajectory Length (Km)",
            sortable: true,
            width: 175
        },
    ]
});

// ****************************************************************************************************************************************
// List View Switch
// ****************************************************************************************************************************************

function funStreetChangeType(){
    switch($('#streetSortingType').val()){
        case 'topStreetCount':
            $('#singleSort').css('visibility','visible');
            $('#singleSort1').css('visibility','hidden');
            // $('#singleSort').prependTo('#1b');
            $('#singleSort').insertAfter('#streetSortingType');
            break;
        case 'topStreetSpeed':
            $('#singleSort1').css('visibility','visible');
            $('#singleSort').css('visibility','hidden');
            // $('#singleSort1').prependTo('#1b');
            $('#singleSort1').insertAfter('#streetSortingType');
            break;
    }

}