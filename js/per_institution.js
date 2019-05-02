//bar chart and pie chart nested in dropdown change function because dropdown select statement puts together file names to select specific data based on dropdown values
//DROPDOWN
var dropdown1 = d3.selectAll(".dropdown").select("#yeardrop");
var dropdown2 = d3.selectAll(".dropdown").select("#csv-files");
var change = function() {
    var yearPart = dropdown1.node().options[dropdown1.node().selectedIndex].value;
    var endPart = dropdown2.node().options[dropdown2.node().selectedIndex].value;
    var source = "data/per_aff_fund/" + yearPart + endPart
    d3.selectAll("svg").remove();
    
    // set the dimensions and margins of the graph
    d3.csv(source, function (error, data) {
        if (error) throw error;
        console.log(data);
        var margin = {top: 20, right: 10, bottom: 20, left: 80},
            width = 660 - margin.left - margin.right,
            height = 450 - margin.top - margin.bottom;

        // Ranges
        var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
        var y = d3.scaleLinear()
        .range([height, 0]);
        
        var tooltip = d3.select("body").append("div").attr("class", "toolTip");        
        var svg1 = d3.select("#chart1")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 
            
        data.forEach(function(d) {
            d.fiscal_year_total_cost = +d.fiscal_year_total_cost;
        });

        // scale ranges
        x.domain(data.map(function(d) { return d.ninds_aff_name; }));
        y.domain([0, d3.max(data, function(d) { return d.fiscal_year_total_cost; })]);

        // append the rectangles for the bar chart
        svg1.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.ninds_aff_name); })
                .attr("width", x.bandwidth())
                .attr("y", function(d) { return y(d.fiscal_year_total_cost); })
                .style("fill", d3.color("#B6C3BD") )
                .attr("height", function(d) { return height - y(d.fiscal_year_total_cost); })
                .on("mousemove", function(d){tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "block")
                    .html((d.ninds_aff_name) + "<br>" + "$" + (d.fiscal_year_total_cost));
                                            })
                .on("mouseout", function(d){ tooltip.style("display", "none");
                                           });

        // y-axis
        svg1.append("g")
            .call(d3.axisLeft(y));

        
    });
    
    
    // pie chart based on the following example:
    // https://codepen.io/lisaofalltrades/pen/jZyzKo
    //Pie Chart
    d3.csv(source, function(error, data) {
        if (error) throw error;
        
        console.log(data);
        
        // dimensions
        var width = 500;
        var height = 500;

        // pie radius
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
            .value(function(d) { return d.fiscal_year_total_cost; });
        
        // tooltip
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
            d.fiscal_year_total_cost = +d.fiscal_year_total_cost;
            d.ninds_aff_name = d.ninds_aff_name;
            });

        // creating the chart
        var path = svg2.selectAll('path')
            .data(pie(data))
            .enter()
                .append('path')
                    .attr('d', arc)
                    .attr('fill', function(d) { return color(d.data.ninds_aff_name); })
                    .each(function(d) { this._current - d; });
        
        // mouse-over event handlers
        path.on('mouseover', function(d) {     
            var overall = d3.sum(data.map(function(d) {         
                return d.fiscal_year_total_cost;
            }));                                                      
            var percent = Math.round(100 * d.data.fiscal_year_total_cost / overall);
            tooltip.select('.name').html(d.data.ninds_aff_name);           
            tooltip.select('.numb').html('$' + d.data.fiscal_year_total_cost);
            tooltip.select('.pct').html(percent + '%');          
            tooltip.style('display', 'block');                
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
dropdown1.on("change", change)
dropdown2.on("change", change) 
change();

//  line chart!!!!!
// heavily referenced the following examples:
// https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0
// https://bl.ocks.org/d3noob/257c360b3650b9f0a52dd8257d7a2d73
// as well as the following ebook:
// https://github.com/d3noob/D3-Tips-and-Tricks/blob/master/D3-Tips-and-Tricks-Latest.pdf

// dimensions
var margin = {top: 30, right: 20, bottom: 200, left: 120},
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// ranges
var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);  
var y = d3.scaleLinear().range([height, 0]);

var line = d3.line()	
    .x( function(d) { 
        return x(d.fiscal_year); 
    })
    .y( function(d) { 
        return y(d.fiscal_year_total_cost); 
    });

var svg3 = d3.select("#chart3")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

var g = svg3.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var div = d3.select("#chart3")
    .append("div")
        .attr("class", "tooltipLines")
        .style("opacity", 0);

d3.csv("data/top_affs.csv", function(error, data) {
    data.forEach(function(d) {
		d.fiscal_year = +d.fiscal_year;
		d.fiscal_year_total_cost = +d.fiscal_year_total_cost;
    });
    console.log(data)
    
    // scale range
    x.domain(data.map(function(d) { return d.fiscal_year; }));
    y.domain([0, d3.max(data, function(d) { return d.fiscal_year_total_cost; })]);
    
    // Nest data
    var nested = d3.nest()
        .key(function(d) {return d.ninds_aff_name;})
        .entries(data);
    
    // color scale
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    
    // loop within nested data
    nested.forEach(function(d,i) { 
        svg3.append("path")
            .attr("class", "line")
            .style("stroke", function() {
                return d.color = color(d.key); 
        })
            .attr("d", line(d.values));
        
        // x-axis
        svg3.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
          
        // y-axis
        svg3.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));
        
        // dots with tooltips
        svg3.selectAll("dot")
            .data(data)
                .enter()
                .append("circle")
                    .attr("r", 5)
                    .attr("cx", function(d) { return x(d.fiscal_year); })
                    .attr("cy", function(d) { return y(d.fiscal_year_total_cost); })
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(80)
                        .style("opacity", 1);
                    div.html(d.fiscal_year + "<br/>" + "$" + d.fiscal_year_total_cost + "<br/>" + d.ninds_aff_name)
                        .style('top', (d3.event.layerY + 8) + 'px') // 8px below cursor
                        .style('left', (d3.event.layerX + 8) + 'px');// 8px to right of cursor
                })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(200)
                    .style("opacity", 0);
                });
    });
});