/**
 * Created by Yueqi on 9/14/2017.
 * show query and highlight results in the view
 */

function ViewLayer(_m){
    var layers = null,
        map = _m,
        //store highlight/select information in config
        //when highlight set changes, update the style function
        config = {
            target: ['trip', 'start', 'end'], //drawing targets trips,
            segment_level:[], //exclude level
            highlight:[]
        },
        //store <type, <id, geojson>>, used to save data when a new layer created
        //when new query result is ready, compare the new ids to this
        //keep the overlapped ones, discard missing ones and query geom for the new ones
        data = {
            'trip': {},
            'start': {},
            'end': {}
        },
        bin = 200;

    this.init = function(){
        clean_view()
    };

    function clean_view(){
        draw.stop();
        if (layers){
            $.map(layers, function(k){
                map.removeLayer(k);
            })
        }
        layers = {
            trip: L.geoJSON([], { style: {color: '#790E0E', opacity: .5, weight: 2} }).addTo(map),
            trip_highlight: L.geoJSON([], { style: {color: 'blue', opacity: 1, weight: 2} }).addTo(map),
            start: L.geoJSON([],
                {
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng);
                    },
                    style: {color: 'green', opacity: .5, radius: 2}
                }),
            start_highlight: L.geoJSON([],
                {
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng);
                    },
                    style: {color: 'green', opacity: 1, radius: 2}
                }),
            end: L.geoJSON([],
                {
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng);
                    },
                    style: {color: 'red', opacity: .5, radius: 2}
                }),
            end_highlight: L.geoJSON([],
                {
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng);
                    },
                    style: {color: 'red', opacity: 1, radius: 2}
                })
        }
    }

    var in_view = {
        start: false,
        end: false,
        trip: true
    }
    this.hide = function (target) {
        in_view[target] = false
        map.removeLayer(layers[target]);
        map.removeLayer(layers[target+'_highlight'])
    }
    //bring layer to front trip and segments are exclusive
    this.front = function(target){
        if (!in_view[target]){
            in_view[target] = true;
            layers[target].addTo(map);
            layers[target+'_highlight'].addTo(map)
        }
        layers[target].bringToFront();
        layers[target+'_highlight'].bringToFront()
    }

    //######################################## query related ################################
    // new query result is ready
    var draw = new MissingData();
    this.query = function(tripids){
        clean_view();

        var new_data = {
            trip: {},
            start:{},
            end:{}
        } ;

        var missing = [];
        new_query_flag = true;
        $.map(tripids, function(d){
            if (d in data.trip){
                new_data.trip[d] = data.trip[d];
                new_data.start[d] = data.start[d];
                new_data.end[d] = data.end[d];

                layers.trip.addData(data.trip[d]);
                layers.start.addData(data.start[d]);
                layers.end.addData(data.end[d])
            }
            else{
                missing.push(d)
            }
        });
        data = new_data;

        draw = new MissingData(missing, 'trip');
        draw.start()
    };

    this.killquery = function(){
        draw.stop();
    }

    this.pausequery = function(){

        draw.pause();
    }

    //generate grow
    function MissingData(m, target) {
        var missing = m;
        var stop_flag = false;
        var pause_flag = false;
        function draw(){
            var tmp = missing.splice(-bin);
            if (tmp.length <= 0)
                return

            $.post('get_by_ids', {
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                target: target,
                val:JSON.stringify(tmp)
            }, function(d){
                // the trip and tripends come together
                addData('trip', d.trip, d.id);
                addData('start', d.start, d.id);
                addData('end', d.end, d.id);

                if (pause_flag){
                    $('#state').text('Pause at '+Object.keys(data.start).length+' in ');
                    return false
                }

                if (missing.length == 0){
                    // if (in_view.start == false)
                    {
                        layers.start.addTo(map);
                        layers.start_highlight.addTo(map);
                        in_view.start = true
                    }
                    // if (in_view.end == false)
                    {
                        layers.end.addTo(map);
                        layers.end_highlight.addTo(map);
                        in_view.end = true
                    }

                    $('#state').text('Done, total #: ');
                    $('#query_state>button').hide();
                    return false
                }
                draw(missing, target);
            })
        }

        this.start  = function(){
            draw();
        }

        this.pause = function(){
            var stat = $('#query_state>button').text();
            if (stat == 'Pause'){
                $('#query_state>button').text('Restart');
                pause_flag = true
            }
            else{
                $('#query_state>button').text('Pause');
                pause_flag = false;
                draw()
            }
        };

        this.stop = function () {
            stop_flag = true
        }
    };

    function addData(target, v, ids){
        var tmp = []
        for (var i=0; i<ids.length; i++){
            var id = ids[i];
            var s = {
                type: 'Feature',
                properties: {
                    id: id,
                    target: target
                },
                geometry:JSON.parse(v[i])
            }
            data[target][id] = s;
            tmp.push(s)
        }
        layers[target].addData(tmp)
        $('#state').text('get '+Object.keys(data.start).length + ' of ')
    };
}