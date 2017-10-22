/**
 * Created by Yueqi on 9/13/2017.
 */
// Initialise the FeatureGroup to store editable layers
//var trips = new Trips();
//var street = new Street();

// window.addEventListener("map:init", function (event){
//     var _m = event.detail.map;
//     var mv = new map_widget(_m);
//     mv.init();
// });

// inital query widgets on map
function map_widget(_map){
    var map = _map;

    var view = new ViewLayer(map);
    // The sidebar is used for store and edit queries
    var sidebar = new SideBar();

    view.init();
    $('#query_state>button').on('click', function(){
        view.pausequery()
    });
    // configure of current query
    var state = new (
    function query_state(){
        var state = {
            start: true,
            end: true,
            // intersect: false,
            time_range: [],
            area: '',
            sort: 'triplength',
            desc: 'desc',
            view: 'trip'
        };

        this.toggle_target = function(tar){
            state['tar'] ^= true;
        };

        this.get_state = function(key){
            return state[key]
        }

        this.update_state = function(key, value){
            if (state[key] != value){
                state[key] = value;
                if (state.area){
                    view.killquery();

                    var para = {
                        val:  JSON.stringify(state),
                        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
                    };

                    $('#query_state').show();
                    $('#query_state>button').text('Pause');
                    $('#query_state>button').show();
                    $('#all').text('');
                    $('#state').text('querying...');
                    //get new trip ids and send to trip and street draw
                    $.post('query', para, function(ids){
                        $('#all').text(ids.length);
                        var _layer = drawnItems.getLayers().slice(-1)[0];

                        sidebar.storeQuery(ids,view,_layer,state.time_range);
                    })
                }
            }
        }
    });

    //when the query state changes,

    var tl = null;
    this.init = function(){
        add_time_picker();
        tl = new timeline(state);
        add_query_tool();
        add_view_switcher();
        // add_save_load_geojson_tool();
    };


    function add_time_picker(){
        $('input[name="daterange"]').daterangepicker(
        {
            locale: {
              format: 'M/D/YYYY'
            },
            startDate: '9/1/2013',
            endDate: '9/6/2013',
            keeyOpen: true,
            widgetPositioning: {
                horizontal: 'auto',
                vertical: 'bottom'
             }
        },
        function(start, end, label) {
            state.update_state('time_range', [start.toDate(), end.toDate()]);
            if (tl){
                tl.update_time([start.toDate(), end.toDate()]);
            }
        });

        var start = $('input[name="daterange"]').data('daterangepicker').startDate.toDate(),
            end = $('input[name="daterange"]').data('daterangepicker').endDate.toDate();
        state.update_state('time_range', [start, end])
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
                remove: false,
                edit: false
            }
        });
        map.addControl(drawControl);

        //remove exists area if start a new one
        //also clean map
        map.on(L.Draw.Event.DRAWSTART, function(){
            // drawnItems.clearLayers();
            $('#query_state').hide();
            state.update_state('area', null);
            // view.init()
        });

        map.on(L.Draw.Event.CREATED, function (event) {
            var layer = event.layer;
            // state.update_state('layer',layer)
            drawnItems.addLayer(layer);
            // update_area();
            if ('getLatLng' in layer){
                var pos = layer.getLatLng();
                state.update_state('area', {
                    lat: pos.lat,
                    lng: pos.lng,
                    r: layer.getRadius()
                })
            }
            else{
                state.update_state('area', layer.getLatLngs());
            }
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
            state.update_state('area', layer.getLatLngs());
        }
    }

    function create_query_target_tool(){
        var btn_config = [
            {
                type: 'start',
                icon: 'fa-sign-in fa-lg',
                title: 'Select Start Points',
                init: true
            },
            // {
            //     type: 'intersect',
            //     icon: 'fa-exchange fa-lg',
            //     title: 'Select Intersected Trips',
            //     init: false
            // },
            {
                type: 'end',
                icon: 'fa-sign-out fa-lg',
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
        function onClick(target, btn){
            btn.toggleClass('checked');
            if (btn.hasClass('checked'))
                view.front(target);
            else
                view.hide(target)
        }
        //Street View-Trajectory View-Clear View Control
        var STC = [
            // L.easyButton({
            //     states: [{
            //         icon: 'fa-map-o fa-lg',
            //         title: 'Show Taxi Flow',
            //         onClick: function() {
            //             view.change_target('segment');
            //             $(this.button).toggleClass('checked');
            //         }
            //     }]
            // }),
            L.easyButton({
                states: [{
                    icon: 'fa-taxi fa-lg',
                    title: 'Show Taxi Trajectories',
                    onClick: function (){onClick('trip', $(this.button))}
                }]
            }),
            L.easyButton({
                states: [{
                    icon: 'fa-sign-in fa-lg',
                    title: 'Pick-UP Distribution',
                    onClick: function (){onClick('start', $(this.button))}
                }]
            }),
            L.easyButton({
                states: [{
                    icon: 'fa-sign-out fa-lg',
                    title: 'Drop-Off Distribution',
                    onClick: function (){onClick('end', $(this.button))}
                }]
            })
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

function getstreetview(pos){
    var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), {
          position: pos,
          pov: {
            heading: 34,
            pitch: 10
          }
    });
}