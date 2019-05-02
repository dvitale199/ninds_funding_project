//bar chart and pie chart nested in dropdown change function because dropdown select statement puts together file names to select specific data based on dropdown values
//DROPDOWN
var dropdown = d3.selectAll(".dropdown").select("#csv-files")
var change = function() {
    var source = dropdown.node().options[dropdown.node().selectedIndex].value;
    d3.selectAll("svg").remove();
    
    var margin = {top: 20, right: 10, bottom: 80, left: 80},
            width = 660 - margin.left - margin.right,
            height = 450 - margin.top - margin.bottom;

    var x = d3.scaleBand()
                .range([0, width])
                .padding(0.1);
    
    var y = d3.scaleLinear()
                  .range([height, 0]);
    
    var tooltip = d3.select("body").append("div").attr("class", "toolTip");  
    
    d3.csv(source, function(error, data) {
          if (error) throw error;
        

        var svg1 = d3.select("#chart1").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", 
                  "translate(" + margin.left + "," + margin.top + ")");
        
          data.forEach(function(d) {
              d.funding = +d.funding;
              d.fiscal_year = +d.fiscal_year;
          });

            // scale ranges
          x.domain(data.map(function(d) { return d.fiscal_year; }));
          y.domain([0, d3.max(data, function(d) { return d.funding; })]);


          svg1.selectAll(".bar")
              .data(data)
              .enter()
                .append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return x(d.fiscal_year); })
                    .attr("width", x.bandwidth())
                    .attr("y", function(d) { return y(d.funding); })
                    .attr("height", function(d) { return height - y(d.funding); })
                        .style("fill", d3.color("#B6C3BD") )
                .on("mousemove", function(d){tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "block")
                    .html((d.fiscal_year) + "<br>" + "$" + (d.funding));
                                        })
    		      .on("mouseout", function(d){ tooltip.style("display", "none");
                                       });

          svg1.append("g")
            .style("font", "16px times")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x))
            .selectAll("text")	
                .style("text-anchor", "end")
                    .attr("dx", "-.10em")
                    .attr("dy", ".18em")
                    .attr("transform", "rotate(-65)");

          // add the y Axis
          svg1.append("g")
              .call(d3.axisLeft(y));

    });
    
    // pie chart based on the following example:
    // https://codepen.io/lisaofalltrades/pen/jZyzKo
    //Pie Chart
    d3.csv(source, function(error, data) {
        if (error) throw error;
        
        console.log(data);
        
        
        // chart dimensions
        var width = 500;
        var height = 500;

        // a circle chart needs a radius
        var radius = Math.min(width, height) / 3;


        // define color scale
        var color = d3.scaleOrdinal(d3.schemeCategory20c);
        

        var svg2 = d3.select('#chart2')
            .append('svg')
                .attr('width', width)
                .attr('height', height)
            .append('g')
                .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        var pie = d3.pie()
            .value(function(d) { return d.funding; });
            
        
        // define tooltip
        var tooltip = d3.select('#chart2')
            .append('div')                               
            .attr('class', 'tooltip');

        tooltip.append('div')                            
            .attr('class', 'name');                         

        tooltip.append('div')                   
            .attr('class', 'numb');                  

        tooltip.append('div')  
            .attr('class', 'pct');

        data.forEach(function(d) {
            d.funding = +d.funding;
            d.fiscal_year = +d.fiscal_year;
            });

        // creating the chart
        var path = svg2.selectAll('path')
            .data(pie(data))
            .enter()
                .append('path')
                    .attr('d', arc)
                    .attr('fill', function(d) { return color(d.data.fiscal_year); })
                    .each(function(d) { this._current - d; });
        
        // mouse-over event handlers
        path.on('mouseover', function(d) {     
            var overall = d3.sum(data.map(function(d) {         
                return d.funding;
            }));                                                      
            var percent = Math.round(100 * d.data.funding / overall);
            tooltip.select('.name').html(d.data.fiscal_year);           
            tooltip.select('.numb').html('$' + d.data.funding);
            tooltip.select('.pct').html(percent + '%');          
            tooltip.style('display', 'block'); // set display                     
            });                                                        

        path.on('mouseout', function() {                        
            tooltip.style('display', 'none');
        });

        path.on('mousemove', function(d) {                  
            tooltip.style('top', (d3.event.layerY + 8) + 'px') // 8px below cursor
                .style('left', (d3.event.layerX + 8) + 'px'); // 8px to right of cursor
        });
    });
}
dropdown.on("change", change)
    change();



// brush and zoom chart modeled after the following example:
//https://bl.ocks.org/EfratVil/92f894ac0ba265192411e73f633a3e2f

// margins for both x axes
margin = {top: 20, right: 20, bottom: 110, left: 120};
margin_2 = {top: 430, right: 20, bottom: 30, left: 120};

var svg3 = d3.select("#chart3")
            .append("svg")
            .attr("width",960)
            .attr("height",500);

//dimensions for both axes- same width
width = +svg3.attr("width") - margin.left - margin.right;
height = +svg3.attr("height") - margin.top - margin.bottom;
height_2 = +svg3.attr("height") - margin_2.top - margin_2.bottom;

//time series
var getDate = d3.timeParse("%Y-%m-%d");

// get values for both x and y for both sets of axes
var x = d3.scaleTime().range([0, width]),
    x_2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y_2 = d3.scaleLinear().range([height_2, 0]);

// create axes
var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x_2),
    yAxis = d3.axisLeft(y);

// create brush
var brX = d3.brushX()
    .extent([[0, 0], [width, height_2]])
    .on("brush end", brXed);

// create zoom function
var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

// line on upper chart
var line = d3.line()
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.fiscal_year_total_cost); });

// line on lower chart
var line2 = d3.line()
    .x(function (d) { return x_2(d.date); })
    .y(function (d) { return y_2(d.fiscal_year_total_cost); });

// area to view on lower chart
var chunk = svg3.append("chnks")
    .append("svg3:chunkPath")
        .attr("id", "chunk")
    .append("svg3:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0); 

// amount of chart being viewed at any time based on chunk
var lChart = svg3.append("g")
    .attr("class", "slct")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("chunk-path", "url(#chunk)");

// view selection on lower chart which calls line and axes for upper
var slct = svg3.append("g")
    .attr("class", "slct")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// creates line and axes for lower chart
var area = svg3.append("g")
    .attr("class", "area")
    .attr("transform", "translate(" + margin_2.left + "," + margin_2.top + ")");

d3.csv("data/cont_dates.csv", type, function (error, data) {
  if (error) throw error;

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function (d) { return d.fiscal_year_total_cost; })]);
    x_2.domain(x.domain());
    y_2.domain(y.domain());


    slct.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    slct.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    lChart.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    area.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line2);


    area.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height_2 + ")")
        .call(xAxis2);

    area.append("g")
        .attr("class", "brX")
        .call(brX)
        .call(brX.move, x.range());

    svg3.append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);


    console.log(data);
});

// brush selection
function brXed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; 
    var event_slct = d3.event.selection || x_2.range();
    x.domain(event_slct.map(x_2.invert, x_2));
    lChart.select(".line").attr("d", line);
    slct.select(".axis--x").call(xAxis);
    svg3.select(".zoom").call(zoom.transform, d3.zoomIdentity
                              .scale(width / (event_slct[1] - event_slct[0]))
                              .translate(-event_slct[0], 0));
}

// zoom with brushing
function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brX") return; 
    var trans = d3.event.transform;
    x.domain(trans.rescaleX(x_2).domain());
    lChart.select(".line").attr("d", line);
    slct.select(".axis--x").call(xAxis);
    area.select(".brX").call(brX.move, x.range().map(trans.invertX, trans));
}

function type(d) {
    d.date = getDate(d.date);
    d.fiscal_year_total_cost = +d.fiscal_year_total_cost;
    return d;
}