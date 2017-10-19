function barchart_initial(view,func){
    var initBar;

    d3.json('sidebar', function (d) {
        $('#chart').empty();

        initBar=new barControl(view,d);
        func(initBar);
    })
}

function barControl(_v,_data){

    var self = this;
    var int_to_weekday = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    this.newBar=function(nid){
        if(charts){
            $.each(charts,function(i,d){
                d.gradual(nid)
            })
        }
        // toptable.gradual(nid)
    }


    this.notify = function(message){
        if(charts){
            var arr = $.map(charts, function (d) {
                var dr = d.get_highlight()
                var dnr = dr.filter(function(item, pos) {
                    return dr.indexOf(item) == pos;
                })
                return dnr
            });
            var obj = {};
            for (var i = 0, j = arr.length; i < j; i++) {
               obj[arr[i]] = (obj[arr[i]] || 0) + 1;
            }
            var res = $.map(obj, function(v, k){
                if (v >= charts.length)
                    return [parseInt(k)]
            });

            $.each(charts, function(i,d){
                d.update(res)
            });
            _v.mapHighlight(res);
            if(toptable){toptable.update(res);}

            if (message == 'brush_end'){

            }
        }
    };

    //bar charts
    var bar_config = [
        {
            title: 'trips group by weekday',
            data: $.map(_data.week, function(d, i){
                return {
                    key: int_to_weekday[i],
                    ids: d
                }
            })
        },
        {
            title: 'trips group by hour of day',
            data: $.map(_data.hour, function(d, i){
                return {
                    // key: ((i<10)?'0'+i.toString():i.toString())+':00',
                    key: i,
                    ids: d
                }
            })

        }
    ];

    var charts = $.map(bar_config, function(d){
        return new barChart(d, self)
    });

    //scatter plot,
    charts.push(new scatter({
        data:_data.scatter,
        title: 'trip length (km) / travel time (min)'
    }, self));

    var toptable = new topTable(_data.scatter,self)
    // var resTripid = $.map(_data.scatter,function(d){return d.tripid});

}

// function intersect(a, b) {
//     var t;
//     if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
//     return a.filter(function (e) {
//         return b.indexOf(e) > -1;
//     });
// }
function intersect(a, b) {
    var d = {};
    var results = [];
    for (var i = 0; i < b.length; i++) {
        d[b[i]] = true;
    }
    for (var j = 0; j < a.length; j++) {
        if (d[a[j]])
            results.push(a[j]);
    }
    return results;
}

var scatter = function(_data, _control){
    var control = _control;
    var highlight = [];
    var width = 450, height=340,
        margin = {
            top:20,
            bottom:20,
            left:60,
            right:20
        };

    var data = _data.data;
    var y = d3.scaleLinear().range([height,20])
        .domain([0, d3.max(data, function(d){  return d.trip_length  })]);
    var x = d3.scaleLinear().range([0, width-20])
        .domain([0, d3.max(data, function(d){  return d.trip_duration  })]);
    var xAxis = d3.axisBottom(x),
        yAxis = d3.axisLeft(y);

    var wrap = d3.select('#chart').append('div')
        .attr('class', 'scatter_wrap');

    wrap.append('div').text(_data.title).attr('class','title');

    var svg = wrap.append('div').attr('class','chart').append('svg')
        .attr('height','100%')
        .attr('width','100%')
        .attr('viewBox','0 0 '+(width+margin.right+margin.left)+ ' '+(height+margin.top+margin.bottom*1.5))
        .append('g')
        .attr('transform','translate('+[margin.left, margin.top]+')');

    var dots = svg.selectAll('dots').data(data).enter()
        .append('circle')
        .style('opacity',0.5)
        .attr('class', 'chart_base')
        .attr('r', 5)
        .attr('cx', function(d){
            return x(d.trip_duration)
        })
        .attr('cy', function(d){
            return y(d.trip_length)
        });

    svg.append('g')
        .attr('class', 'xaxis')
        .style('fill', '#000')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

    svg.append('g')
        .attr('class', 'yaxis')
        .style('fill', '#000')
        .call(yAxis);

    svg.append('text')
        .attr('transform','rotate(-90)')
        .attr('y',0-margin.left*3/4)
        .attr('x',0-height/2)
        .attr('dy','1em')
        .style('font','16px sans-serif')
        .style('text-anchor','middle')
        .text('Trip length (km)');

    svg.append('text')
        .attr('y',335)
        .attr('x',380)
        .style('font','16px sans-serif')
        .style('text-anchor','middle')
        .text('Travel time (min)');

    //brush
     var brush = d3.brush()
        .extent([[0,0],[width,height]])
         // .on('start', brushstart)
        .on('brush',brushing)
        .on('end',brushed);

    var gBrush = svg.append('g')
        .attr('class','brush')
        .call(brush)
        .call(brush.move,[0,0]);

    // Burshstart
    // function brushstart(){
    //     highlight = [];
    //     if (control)
    //         control.notify();
    // }

    // Burshing
    function brushing() {
        var s = d3.event.selection;
        if (s){
            //align to bars
            highlight = $.map(data, function(d){
                if (x(d.trip_duration)<=s[1][0] && x(d.trip_duration)>=s[0][0] && y(d.trip_length)<=s[1][1] && y(d.trip_length)>=s[0][1])
                    return d.tripid;
                else
                    return []
            })
            if (control)
                control.notify()
        }
    }

    // Brushend
    function brushed(){
        var s = d3.event.selection;
        if(!s) {emptybrush()}
        function emptybrush(){
            highlight=[]
            if (control)
                control.notify()
        }

        if (control)
            control.notify('brush_end')
    }

    this.get_highlight = function(){
        if (highlight.length == 0)
            return $.map(data, function(d){
                return d.tripid
            });
        else
            return highlight;
    };

    this.update = function(ids){
        dots.each(function(d){
            if(ids.includes(d.tripid)){
                d3.select(this).attr('class','chart_highlight');
                this.parentNode.appendChild(this);
            }
            else{
                d3.select(this).attr('class','chart_update')
            }
        });
        if(data.length<=ids.length){
            dots.attr('class','chart_update')
        }
        else{
            dots.style('class','chart_highlight')
        }
    };

    this.gradual = function(nid){
        dots.each(function(d){
            if(nid.includes(d.tripid)){
                d3.select(this).classed('chart_update',true);
            }
        })
    };
};

var barChart = function(_data, _control){
    var control = _control;
    var chartdata = _data.data;
    var highlight = [];

    var width = 450, height=150,
        margin = {
            top:20,
            bottom:20,
            left:60,
            right:20
        };

    var wrap = d3.select('#chart').append('div')
        .attr('class', 'chart_wrap');

    wrap.append('div').text(_data.title).attr('class','title');

    var svg = wrap.append('div').attr('class','chart').append('svg')
        .attr('height','80%')
        .attr('width','100%')
        .attr('viewBox','0 0 '+(width+margin.right+margin.left)+ ' '+(height+margin.top+margin.bottom))
        .append('g')
        .attr('transform','translate('+[margin.left, margin.top]+')');

    var y = d3.scaleLinear().range([height,0]);

    var x = d3.scaleBand().rangeRound([0,width]).domain($.map(chartdata, function(d){return d.key}));
    y.domain([0, d3.max(chartdata, function(d){return d.ids.length})]);

    //draw chart
    var rect = svg.selectAll('bar')
        .data(chartdata)
        .enter().append('g')
        .attr('transform',function(d){
            return 'translate('+[x(d.key),0]+')'
        });

    rect.append('rect')
        .attr('class','chart_base')
        .attr("y", function (d) {
            return y(d.ids.length);
        })
        .attr("height", function (d) {
            return height - y(d.ids.length);
        })
        .attr("width", function(d){
            return x.bandwidth()-1;
        });

    var ubar = rect.append('rect')
        .attr('class','chart_update')
        .attr("width", function(d){
            return x.bandwidth()-1;
        })
        .attr('height',0);

    var hbar = rect.append('rect')
        .attr('class','chart_highlight')
        .attr("width", function(d){
            return x.bandwidth()-1;
        })
        .attr('height',0);

    this.update = function(ids){
        var cw = 1;
        hbar.each(function(d){
            var tmp = intersect(ids, d.ids).length;
            cw = (tmp==d.ids.length)?cw*1:0;
            // d3.select(this).transition()
            d3.select(this)
                .attr('height', height - y(tmp))
                .attr('y', y(tmp))
        })
        if(cw==1){hbar.style('visibility','hidden')}
        else{hbar.style('visibility','visible')}
    };

    this.gradual = function(nid){
        ubar.each(function(d){
            var h = (d3.select(this).attr('y'))?height-parseFloat(d3.select(this).attr('y')):0
            var tmp = intersect(d.ids,nid).length
            d3.select(this)
                .attr('height',height-y(tmp)+h)
                .attr('y',y(tmp)-h)
        })
    };

    //functions share by all charts
    //draw axis
    var xAxis = d3.axisBottom(x),
    yAxis = d3.axisLeft(y);

    svg.append('g')
        .attr('class', 'xaxis')
        .style('fill', '#000')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

    svg.append('g')
        .attr('class', 'yaxis')
        .style('fill', '#000')
        .attr('transform', 'translate(' + (x(chartdata[0].key)-2) + ',0)')
        .call(yAxis);

    svg.append('text')
        .attr('transform','rotate(-90)')
        .attr('y',0-margin.left*2/3)
        .attr('x',0-height/2)
        .attr('dy','1em')
        .style('text-anchor','middle')
        .style('font','16px,sans-serif')
        .text('# of trips');

    // svg.append('text')
    //     .attr('y',height+margin.bottom*1.3)
    //     .attr('x',width-2*margin.right-2*margin.left)
    //     .text(_data.title);


     //brush
     var brush = d3.brushX()
        .extent([[0,0],[width,height]])
         // .on('start', brushstart)
        .on('brush',brushing)
        .on('end',brushed);

    var gBrush = svg.append('g')
        .attr('class','brush')
        // .style('visibility','hidden')
        .call(brush)
        .call(brush.move,[0,0]);

    // Burshstart
    // function brushstart(){
    //     highlight = [];
    //     if (control)
    //         control.notify();
    // }

    // Burshing
    function brushing() {
        var s = d3.event.selection;
        if (s){
            highlight = $.map(chartdata, function(d){
                if (x(d.key)<s[1] && x(d.key)+x.bandwidth()>s[0])
                    return d.ids;
                else
                    return []
            })
            if (control)
                control.notify()
        }
    }

    // Brushend
    function brushed(){
        var s = d3.event.selection;
        var a=null
        var b=null
        if(s) {
            for (i = 0; i < chartdata.length; i++) {
                if (s[0] >= x(chartdata[i].key) && (s[0] - x(chartdata[i].key))< x.bandwidth()) {
                    a = x(chartdata[i].key)
                }
                if (s[1]>=x(chartdata[i].key) &&(s[1]-x(chartdata[i].key)) < x.bandwidth()) {
                    b = x(chartdata[i].key)+x.bandwidth()
                }
            }
            if (s[1]>=x(chartdata[chartdata.length-1].key)+x.bandwidth()){
                b=x(chartdata[chartdata.length-1].key)+x.bandwidth();
            }
            if (s[0]<=x(chartdata[0].key)){a=x(chartdata[0].key);}
            if (a >= b) {
                d3.select(this).transition().call(d3.event.target.move, [0,0])
                emptybrush()
            }
            else {
                d3.select(this).transition().call(d3.event.target.move, [a, b-1])
            }

        }
        else{emptybrush()}
        function emptybrush(){
            highlight=[]
            if (control)
                control.notify()
        }

        if (control)
            control.notify('brush_end')
    }

    this.get_highlight = function(){
        if (highlight.length == 0)
            return $.map(chartdata, function(d){
                return d.ids
            });
        else
            return highlight
    };
}

var topTable = function(_data, _control){
    var sortAscending = true;
    var control = _control;
    var data = _data;
    var highlight = [];
    var width = 450, height=340,
        margin = {
            top:20,
            bottom:20,
            left:60,
            right:20
        };

    var columns = d3.keys(data[0])

    var wrap = d3.select('#chart').append('div')
        .attr('class', 'table_warp');

    // wrap.append('div').text('Trip Table').attr('class','title');

    var table = wrap.append('div')
        .style('text-align','center')
        // .style('overflow','auto')
        .style('height','100%')
        .append('table');
    var thead = table.append('thead');
    var tbody = table.append('tbody');

    var headers = thead.append('tr')
        .selectAll('th')
        .data(columns).enter()
        // .style('position','fixed')
        .append('th')
        .text(function(d){return d;})
        .on('click',function(d){
            headers.attr('class','header');

            if(sortAscending){
                rows.sort(function(a,b){
                    if (highlight.includes(a.tripid) == highlight.includes(b.tripid)){
                        return b[d]-a[d];
                    }
                    else{
                        return highlight.includes(b.tripid) ? 1 : -1
                    }
                });
                sortAscending = false;
                this.className = 'des';
            }else{
                rows.sort(function(a, b) {
                    if (highlight.includes(a.tripid) == highlight.includes(b.tripid)){
                        return a[d]-b[d];
                    }
                    else{
                        return highlight.includes(b.tripid) ? 1 : -1
                    }
                });
                sortAscending = true;
                this.className = 'aes';
            }

        });

    var rows = tbody.selectAll('tr')
        .data(data).enter()
        .append('tr');

    rows.selectAll('td')
        .data(function(r){
            return columns.map(function(c){
                return {column:c,value:r[c]}
            })
        })
        .enter()
        .append('td')
        // .attr('data-th',function(d){return d.column})
        .text(function(d){
            return d.value
        })

    this.update = function(tripid){
        highlight = tripid;
        if(tripid.length<data.length){
            rows.classed('selected',function(d){
                if(tripid.includes(d.tripid)){
                    // $(this).parent().prependTo('tbody')
                    $('tbody').prepend($(this))
                    return true;
                }
                else{return false;}
            })
        }else{
            rows.classed('selected',false)
        }

    };
};