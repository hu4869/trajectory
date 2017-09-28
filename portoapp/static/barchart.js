function barchart_initial(){
    d3.json('sidebar',function(d){
        $('#chart').empty();
        new barControl(d);
    })
}

var config = [
    {
        type: 'bar',
        column: 'weekday',
        title: 'trips group by weekday'
    },
    {
        type: 'bar',
        column: 'hour',
        title: 'trips group by hour of day'
    },
    {
        type: 'area',
        column: 'length',
        title: 'trips length'
    },
    {
        type: 'area',
        column: 'duration',
        title: 'trips duration aaaa'
    }
]

function barControl(_data){
    var that = this;
    $.map(config, function(d){
        return new barChart(d.type, d.column, d.title, _data, that)
    });

    this.notify = function(message){
        if(bar){
            var arr = $.map(bars, function (d) {
                return d.get_highlight()
            });
            var obj = {};
            for (var i = 0, j = arr.length; i < j; i++) {
               obj[arr[i]] = (obj[arr[i]] || 0) + 1;
            }
            var res = $.map(obj, function(k,v){
                if (v == bars.length)
                    return [k]
            });
            $.each(bars, function(i,d){
                d.update(res)
            })

            if (message == 'brush_end'){

            }
        }
    }
}

var barChart = function(_type,_column, _title, _data, _con){
    var con = _con;
    var type = _type;
    var column = _column;
    var title = _title;
    var highlight = [];
    var data = _data;

    this.get_highlight = function(){
        if (highlight.length == 0)
            return data;
        else
            return highlight;
    };

    var margin = {top:20,right:20,bottom:30,left:40},
        width = 960,
        height = 200;

    var wrap = d3.select('#chart').append('div').text(title)
        .classed('chart_wrap')
        .attr('width','100%')
        .attr('height','25%');

    var svg = wrap.append('svg')
        .attr('width','100%')
        .attr('height','100%')
        .attr('viewBox','0 0 '+width+' '+height)
        .append('g')
        .attr('transform','tranlate('+[margin.top, margin.left]+')');

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    var y = d3.scaleLinear().range([height,0]);
    if (type == 'area'){
        //functions exclusive to area charts
        var bin_cnt = 5,
            max = d3.max(data, function (d) {
                return d[column]
            }),
            min = d3.min(data, function (d) {
                return d[column]
            });

        // add bin number slider
        wrap.append('div').attr('id','slider');
        $('#slider').slider({
            value: 1,
            step: 1,
            min: 5,
            max: 20,
            slide: function( event, ui) {
                change_bin(ui.value);
            }
        });

        var obar = svg.append('path').classed('obar');
        var hbar = svg.append('path').classed('obar');

        //update chart data here
        var x = d3.scaleLinear().range([0,width]);
        var chartdata = [];
        function change_bin(val){
            bin_cnt = val;
            var tmp = d3.nest(data, function () {

            })
            chartdata = $.map(tmp, function(d){

            })
            obar.datum(chartdata).attr("d", d3.area()
                .curve(d3.curveMonotoneX)
                .x(function(d) { return x(d.key); })
                .y0(height)
                .y1(function(d) { return y(d.ids.length); })
            );
            hbar.datum(chartdata);
            x.domain([min, max]);
        }

        change_bin(5);
        this.update = function(ids){
            hbar.attr('d', d3.area()
                .curve(d3.curveMonotoneX)
                .x(function(d) { return x(d.key); })
                .y0(height)
                .y1(function(d) {
                    return y(d.ids.intersects(ids).length);
                })
            )
        }
    }
    else{
        //functions exclusive to barcharts
        var tmp = data.nest().key(function(d){return d[column]});
        var chartdata = $.map(tmp, function (d) {
            return {
                key:d.key,
                id: $.map(d.values, function(d){
                    return d.id
                })
            }
        })
        var x = d3.scaleBand().rangeRound([0,width]);
        x.domain($.map(chartdata, function(d){return d.key}));

        //draw chart
        var rect = svg.selectAll('g.bar')
            .data(data)
            .enter().append('g')
            .attr('class', 'bar')
            .attr('transform',function(d){
                return 'translate('+[x(d.key),height]+')'
            });

        rect.append('rect')
            .attr('class','obar')
            .attr("y", function (d) {
                return y(d.length);
            })
            .attr("height", function (d) {
                return height - y(d.length);
            })
            .attr("width", function(d){
                return x.bandwidth();
            });

        var hbar = rect.append('rect')
            .attr('class','hbar')
            .attr("width", function(d){
                return x.bandwidth();
            });

        this.update = function(ids){
            hbar.each(function(d){
                var tmp = d.ids.intersects(ids).length;
                d3.select(this).attr('height', height - y(tmp));
                d3.select(this).attr('y', y(tmp))
            })
        }
    }


    //draw axis
    var xAxis = d3.axisBottom(x),
    yAxis = d3.axisLeft(y);
    svg.append('g')
        .attr('class', 'x axis')
        .style('fill', '#000')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .style('fill', '#000')
        .call(yAxis);

     //brush
     var brush = d3.brushX()
        .extent([[0,0],[width,height]])
        .on('brush',brushing)
        .on('end',brushed);

    var gBrush = svg.append('g')
        .attr('id','brush_' + title)
        .attr('class','brush')
        .call(brush)
        .call(brush.move,[0,0]);

    // Burshing
    function brushing() {
        var s = d3.event.selection;
        highlight = $.map(chartdata, function(d){
            if (y(d.key)<s[1] && y(d.key)>s[0])
                return d.ids;
            else
                return []
        })
        con.notify()
    }

    // Brushend
    function brushed(){
        con.notify('brush_end')
    }
}