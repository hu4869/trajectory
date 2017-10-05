function timeline(_s) {

    var w_width = 1000, w_height = 100, state = _s, myrange = [];

var svg = d3.select("#timeline").append('svg').attr('width', '100%').attr('viewBox','0 0 '+w_width+' '+w_height),
    margin = {top: 0, right: 10, bottom: 50, left: 10},
    margin2 = {top: 50, right: 10, bottom: 0, left: 10},
    width = w_width - margin.left - margin.right,
    height = w_height - margin.top - margin.bottom,
    height2 = w_height - margin2.top - margin2.bottom;

var parseDate = d3.timeParse("%b %Y");

var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x);

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.price); });

var area2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x2(d.date); })
    .y0(height2)
    .y1(function(d) { return y2(d.price); });

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

$('#timelinebar>button').on('click', function () {
    $('input[name="daterange"]').daterangepicker("update", myrange);
    state.update_state('time_range', myrange)
})

d3.csv("/porto/static/timeline.csv", type, function(error, data) {
  if (error) throw error;

  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.price; })]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  focus.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);

  focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  context.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());

  svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

  var start = $('input[name="daterange"]').data('daterangepicker').startDate.toDate(),
      end = $('input[name="daterange"]').data('daterangepicker').endDate.toDate();
  set_time_range([start, end])
});

function set_time_range(r) {
    myrange = r;
    context.select(".brush").call(brush.move, myrange.map(x2));
}
this.update_time = set_time_range;

function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
  myrange = s.map(x2.invert, x2);
  x.domain(myrange);
  focus.select(".area").attr("d", area);
  focus.select(".axis--x").call(xAxis);
  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));

    $('#timelinevalue').text([myrange[0].toLocaleDateString(), myrange[1].toLocaleDateString()])
}

function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var t = d3.event.transform;
  myrange = t.rescaleX(x2).domain()
  x.domain(myrange);
  focus.select(".area").attr("d", area);
  focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));

  $('#timelinevalue').text([myrange[0].toLocaleDateString(), myrange[1].toLocaleDateString()])
}

function type(d) {
  d.date = Date.parse(d.date);
  d.price = +d.count;
  return d;
}

}