function barchart_initial(){
    d3.json('sidebar',function(d){
        $('#chart').empty();
        new barControl(d);
    })
}

function barControl(_data){
    var self = this;
    var int_to_weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
                if (v == charts.length)
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

function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
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
            if ($.inArray(d.tripid, ids) >= 0){
                d3.select(this).attr('class','chart_highlight');
                this.parentNode.appendChild(this);
            }
            else{
                d3.select(this).attr('class','chart_base')
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
            return x.bandwidth();
        });

    var hbar = rect.append('rect')
        .attr('class','chart_highlight')
        .attr("width", function(d){
            return x.bandwidth();
        });

    this.update = function(ids){
        hbar.each(function(d){
            var tmp = intersect(ids, d.ids).length;
            d3.select(this).transition()
                .attr('height', height - y(tmp))
                .attr('y', y(tmp))
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
            highlight = $.map(chartdata, function(d){
                if (x(d.key)<s[1]-x.bandwidth()/2 && x(d.key)>s[0])
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
        if (control)
            control.notify('brush_end')
    }

    this.get_highlight = function(){
        if (highlight.length == 0)
            return $.map(chartdata, function(d){
                return d.ids
            });
        else
            return highlight;
    };
}