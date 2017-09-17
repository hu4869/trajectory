/**
 * Created by Yueqi on 9/13/2017.
 */
// Initialise the FeatureGroup to store editable layers
//var trips = new Trips();
//var street = new Street();

window.addEventListener("map:init", function (event){
    var _m = event.detail.map;
    var mv = new map_widget(_m);
    var view = new viewLayer(_m);
    mv.init();
    view.init()
});

// inital query widgets on map
function map_widget(_map){
    var map = _map;

    // configure of current query
    var state = new (
    function query_state(){
        var state = {
            start: true,
            end: true,
            intersect: false,
            time_range: ['2013-07-01', '2013-07-05'],
            area: '',
            view: 'trips'
        };

        this.toggle_target = function(tar){
            state['tar'] ^= true;
        };

        this.update_state = function(key, value){
            if (state[key] != value){
                state[key] = value;
                if (state.area){
                    var para = {
                        val:  JSON.stringify(state),
                        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
                    }
                    //get new trip ids and send to trip and street draw
                    $.post('query', para, function(ids){

                    })
                }
            }
        }
    });

    //when the query state changes,

    this.init = function(){
        add_time_picker();
        add_query_tool();
        add_view_switcher();
        add_save_load_geojson_tool();
    };

    function add_time_picker(){
        $('input[name="daterange"]').daterangepicker(
        {
            locale: {
              format: 'YYYY-MM-DD'
            },
            startDate: '2013-07-01',
            endDate: '2013-07-05'
        },
        function(start, end, label) {
            state.update_state('time_range', [start.format('YYYY-mm-dd'), end.format('YYYY-mm-dd')]);
        });
    }

    function add_save_load_geojson_tool(){
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

        L.easyBar(SLG, options={position:'topleft'}).addTo(map);
    }

    var drawnItems = new L.FeatureGroup();
    function add_query_tool(){
        map.addLayer(drawnItems);

        //the query target
        create_query_target_tool().addTo(map);

        var drawControl = new L.Control.Draw({
            position: 'topleft',
            collapsed: false,
            draw: {
                // Available Shapes in Draw box. To disable anyone of them just convert true to false
                polyline: false,
                polygon: true,
                circle: true,
                rectangle: true,
                marker: false
            },
            edit: {
                featureGroup: drawnItems,
                remove: true,
                edit: true
            }
        });
        map.addControl(drawControl);

        //remove exists area if start a new one
        //also clean map
        map.on(L.Draw.Event.DRAWSTART, function(){
            drawnItems.clearLayers();
            state.update_state('area', null);
        });

        map.on(L.Draw.Event.CREATED, function (event) {
            var layer = event.layer;
            drawnItems.addLayer(layer);
            update_area();
        });

        map.on(L.Draw.Event.EDITED, function(){
            update_area();
        })
    }

    function update_area(){
        // get current selected area (only one)
        var layer = drawnItems.getLayers()[0];
        if ('getLatLng' in layer){
            var pos = layer.getLatLng();
            state.update_state('area', {
                lat: pos.lat,
                lng: pos.lng,
                r: layer.getRadius()
            })
        }
        else{
            state.update_state('area', layer._LatLngs);
        }
    }

    function create_query_target_tool(){
        var btn_config = [
            {
                type: 'start',
                icon: 'fa-dot-circle-o fa-lg',
                title: 'Select Start Points',
                init: true
            },
            {
                type: 'intersect',
                icon: 'fa-exchange fa-lg',
                title: 'Select Intersected Trips',
                init: false
            },
            {
                type: 'end',
                icon: 'fa-times-circle-o fa-lg',
                title: 'Select End Points',
                init: true
            }
        ];

        var tmp = $.map(btn_config, function(d){
            var btn = L.easyButton({
                states: [{
                    icon: d.icon,
                    title: d.title,
                    leafletClasses: true,
                    onClick: function() {
                        state.toggle_target(d.name);
                        $(this.button).toggleClass('checked');
                        // if select area exists, submit a new query
                    }
                }]
            });
            if (d.init)
                $(btn.button).addClass('checked');

            return  btn
        });

        return L.easyBar(tmp, options={position:'topleft'});
    }

    function add_view_switcher(){
        //Street View-Trajectory View-Clear View Control
        var STC = [
            L.easyButton({
                states: [{
                    icon: 'fa-map-o fa-lg',
                    title: 'Show Taxi Flow',
                    onClick: function() {
                        street_layer.show();
                        trip_layer.hide();
                        $(this.button).toggleClass('checked');
                    }
                }]
            }),

            L.easyButton({
                states: [{
                    icon: 'fa-taxi fa-lg',
                    title: 'Show Taxi Trajectories',
                    onClick: function() {
                        street_layer.hide();
                        trip_layer.show();
                        $(this.button).toggleClass('checked');
                    }
                }]
            }),
            //L.easyButton({
            //    states: [{
            //        icon: 'fa-tachometer fa-lg',
            //        title: 'Traj Speed',
            //        onClick: function() {
            //            if (ActiveQID != -1) {
            //                //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
            //                clearMap();
            //                AvtiveVis = 1;
            //                DrawStreet(ActiveQID.road_Array);
            //            }
            //        }
            //    }]
            //}),
            //L.easyButton({
            //    states: [{
            //        icon: 'fa-sign-in fa-lg',
            //        title: 'Pick-UP Distribution',
            //        onClick: function() {
            //            if (ActiveQID != -1) {
            //                //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
            //                clearMap();
            //                AvtiveVis = 3;
            //                DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
            //            }
            //        }
            //    }]
            //}),
            //L.easyButton({
            //    states: [{
            //        icon: 'fa-sign-out fa-lg',
            //        title: 'Drop-Off Distribution',
            //        onClick: function() {
            //            if (ActiveQID != -1) {
            //                //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
            //                clearMap();
            //                AvtiveVis = 4;
            //                DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
            //            }
            //        }
            //    }]
            //}),
            //L.easyButton({
            //    states: [{
            //        icon: 'fa-eraser fa-lg',
            //        title: 'Clear Map',
            //        onClick: function() {
            //            location.reload();
            //        }
            //    }]
            //})

        ];

        L.easyBar(STC, options={position:'topleft'}).addTo(map);
    }
}