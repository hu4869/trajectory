function barchart_initial(func){
    var initBar
    d3.json('sidebar', function (d) {
        $('#chart').empty();

        initBar=new barControl(d);
        func(initBar);
    })
}

function barControl(_data){

    var self = this;
    var int_to_weekday = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    this.newBar=function(nid){
        if(charts){
            $.each(charts,function(i,d){
                d.gradual(nid)
            })
        }
    }


    this.notify = function(message){
        if(charts){
            var arr = $.map(charts, function (d) {
                return d.get_highlight()
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
    var width = 450, height=450,
        margin = {
            top:20,
            bottom:60,
            left:60,
            right:20
        };

    var data = _data.data;
    var y = d3.scaleLinear().range([height,20])
        .domain([0, d3.max(data, function(d){  return d.y  })]);
    var x = d3.scaleLinear().range([0, width-20])
        .domain([0, d3.max(data, function(d){  return d.x  })]);
    var xAxis = d3.axisBottom(x),
        yAxis = d3.axisLeft(y);

    var wrap = d3.select('#chart').append('div')
        .attr('class', 'scatter_wrap');

    wrap.append('div').text(_data.title).attr('class','title');
    var svg = wrap.append('div').attr('class','chart').append('svg')
        .attr('height','100%')
        .attr('width','100%')
        .attr('viewBox','0 0 '+(width+margin.right+margin.left)+ ' '+(height+margin.top+margin.bottom))
        .append('g')
        .attr('transform','translate('+[margin.left, margin.top]+')');

    var dots = svg.selectAll('dots').data(data).enter()
        .append('circle')
        .attr('class', 'chart_base')
        .attr('r', 5)
        .attr('cx', function(d){
            return x(d.x)
        })
        .attr('cy', function(d){
            return y(d.y)
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

    //brush
     var brush = d3.brush()
        .extent([[0,0],[width,height]])
         .on('start', brushstart)
        .on('brush',brushing)
        .on('end',brushed);

    var gBrush = svg.append('g')
        .attr('class','brush')
        .call(brush)
        .call(brush.move,[0,0]);

    // Burshstart
    function brushstart(){
        highlight = [];
        if (control)
            control.notify();
    }

    // Burshing
    function brushing() {
        var s = d3.event.selection;
        if (s){
            //align to bars
            highlight = $.map(data, function(d){
                if (x(d.x)<s[1][0] && x(d.x)>s[0][0] && y(d.y)<s[1][1] && y(d.y)>s[0][1])
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
            bottom:60,
            left:60,
            right:20
        };

    var wrap = d3.select('#chart').append('div')
        .attr('class', 'chart_wrap');

    wrap.append('div').text(_data.title).attr('class','title');
    var svg = wrap.append('div').attr('class','chart').append('svg')
        .attr('height','100%')
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
        .call(yAxis);

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
                // return d.ids.filter(function(item, pos, self) {return self.indexOf(item) == pos;})
                return d.ids
            });
        else
            // return highlight.filter(function(item, pos, self) {return self.indexOf(item) == pos;});
            return highlight
    };
}