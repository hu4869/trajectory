var chart_config = [
    {
        title: 'Group Trips by Weekday',
        type: 'bar'
    },
    {
        title: 'Group Trips by Hour',
        type: 'bar'
    },
    {
        title: 'Group Trip by Length',
        type: 'area'
    },
    {
        title: 'Group Trip by Travel Time',
        type: 'area'
    }
];

var bin = 20;
function bar(view){
    var trip_cnt = Integer.pause($('#all').text());
    bin = trip_cnt < 20? trip_cnt:20;
    $.get('sidebar?bin='+bin, function(d){

    });

    //listen to charts in the view
    this.update_query = function(){

    };

    //when the highlight state updated
    view.highlight = function(id){

    }
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function chart(base, _c, config) {
    var control = _c;

    var width = 800,
        height = 500,
        margin = 30;
    var svg = base.append('svg').attr('width', '100%')
        .attr('viewBox','0 0 '+(width+margin*2) + ' '+(height+margin*2))
        .append('g')
        .attr('transform','translate('+[margin, margin]+')');
    var x,
        y = d3.scaleLinear().rangeRound([height, 0]);

    this.init = function(id, val){
        y.domain([0, d3.max(val)]);

        if (config.type == 'bar'){
            //group data by category


            x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
            x.domain(val.map(function(d){return d}));

            svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.letter); })
                .attr("y", function(d) { return y(d.frequency); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(d.frequency); });
        }
        else{
            var max = d3.max(val, function(d){return d})
            x = d3.scaleLog().range([0, width]).domain([1, max])

        }

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(4))

        svg.append("text")
            .attr("transform", "translate("+[width/2, 0]+")")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "center")
            .text(config.title);

        svg.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());

        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);
    };

    this.highlight = function(id){

    }
}