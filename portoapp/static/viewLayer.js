/**
 * Created by Yueqi on 9/14/2017.
 * show query and highlight results in the view
 */

function ViewLayer(){
    var layer = null, map = null,
        //store highlight/select information in config
        //when highlight set changes, update the style function
        config = {
            target: ['trip', 'tripends'], //drawing targets
            target_opacity: {
                trip: .5,
                tripends: 1,
                segment: 1
            },
            //excluded levels, empty means draw all
            segment_level:[],
            highlight: set()
        },
        //store <type, <id, geojson>>, used to save data when a new layer created
        //when new query result is ready, compare the new ids to this
        //keep the overlapped ones, discard missing ones and query geom for the new ones
        data = {
            'segment': {},
            'trip': {},
            'tripends': {}
        };

    this.init = function(_m){
        map = _m;
        layer = L.geoJSON();
        layer.addTo(map)
    };

    // the gateway to change regard the view style
    this.change_config = function(key, _new_value){
        config[key] = _new_value;
        if (key == 'target'){
            change_target();
        }
    };

    this.highlight()

    function styleFunc(feature){
        return styles[feature.properties.target](feature.properties);
    };

    var flow2weight = d3.LinearScale().domain([0, 100]).range([2, 10]);
    var styles = {
        trip: function(prop){
            if(prop.id in config.highlight){
                return {color: 'blue', opacity: 0.5}
            }
            else{
                return {color: 'lightgary', opacity: 0.2}
            }
        },
        segment: function (prop) {
            var w = flow2weight(prop.flow);
            if(prop.id in config.highlight){
                return {color: 'blue', weight: w}
            }
            else{
                return {color: 'lightgary', weight: w}
            }
        },
        tripends: function (prop) {
            var c = prop.type == 'start'? 'green':'red';
            if(prop.id in config.highlight){
                return {color: c, opacity: 0.5, radius: 4}
            }
            else{
                return {color: c, opacity: 0.2, radius: 2}
            }
        }
    }

    // when the target change, replace layer
    function change_target(){
        var tmp = $.map(data, function (k, v) {
            if (k in config.target){
                return $.map(v, function(i, v){
                    return [v]
                })
            }
        });
        replace_layer(tmp)
    }

    function reset_view_style(){
        layer.setStyle(styleFunc)
    }

    function replace_layer(tmp){
        map.removeLayer(layer);
        layer = L.geoJSON(tmp, {
            style : styleFunc
        });
        map.addLayer(layer)
    }

    //######################################## query related ################################

    // new query result is ready
    this.query = function(tripids){
        var new_trips = [];
        var missing = [];
        $.map(tripids, function(d){
            if (d in data.trip){
                new_trips[d] = data.trip[d]
            }
            else{
                missing.push(d)
            }
        });
        get_trips_data(missing);
    };

    //generate grow
    var bin = 20;
    function get_missing_data(missing, target) {
        while (missing.length > 0){
            var tmp = missing.splice(-bin);
            $.post('get_by_ids', {
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                target: target,
                val:JSON.stringify(tmp)
            }, function(d){
                // the trip and tripends come together
                if (target == 'trip'){
                    addData('trip', d.trip);
                    addData('tripends', d.tripends)
                }
                else{
                    addData(target, d.trip);
                }
            })
        }
    };

    function addData(target, v){
        $.map(v, function(value){
            data[target][value.id] = value;
            if (target in config.target){
                layer.addData(value);
            }
        })
    };
}