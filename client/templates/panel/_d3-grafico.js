graficos = [];

crearGrafico = function (config) {
  graficos[config.codigo] = new Grafico(config);
}

Grafico = function Grafico(config) {
  this.config = config;
  this.config.escala = 1;
  var ancho = $(window).width() > 360 ? 360 : $(window).width();
  var alto = $(window).height() > 360 ? 360 : $(window).height();

  var margin = {
      top: 10,
      right: 24,
      bottom: 170,
      left: 34
    },
    margin2 = {
      top: 230,
      right: 24,
      bottom: 40,
      left: 34
    },
    width = ancho - margin.left - margin.right,
    height = alto - margin.top - margin.bottom,
    height2 = alto - margin2.top - margin2.bottom;

  var color = d3.scale.category10();

  var parseDate = d3.time.format("%d/%m/%Y %H:%M").parse;

  var x = d3.time.scale().range([0, width]),
    x2 = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]);

  var xAxis = d3.svg.axis().scale(x).ticks(4).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).ticks(4).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).ticks(4).orient("left");

  var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brush);

  var line = d3.svg.line()
    .defined(function (d) {
      return !isNaN(d.temperatura);
    })
    .interpolate("cubic")
    .x(function (d) {
      return x(d.fecha);
    })
    .y(function (d) {
      return y(d.temperatura);
    });

  var line2 = d3.svg.line()
    .defined(function (d) {
      return !isNaN(d.humedad);
    })
    .interpolate("cubic")
    .x(function (d) {
      return x2(d.fecha);
    })
    .y(function (d) {
      return y2(d.humedad);
    });

  var svg = d3.select(".marco-grafico").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  var focus = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var context = svg.append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
  
  var data = this.config.data;
  if(!data || data.length==0) return;

  color.domain(d3.keys(data[0]).filter(function (key) {
    return key !== "fecha";
  }));

  data.forEach(function (d) {
    d.fecha = parseDate(d.fecha);
  });
  
  var sources = color.domain().map(function (name) {
    return {
      name: name,
      values: data.map(function (d) {
        return {
          fecha: d.fecha,
          temperatura: +d[name],
          humedad: +d[name]
        };
      })
    };
  });

  x.domain(d3.extent(data, function (d) {
    return d.fecha;
  }));
  
  y.domain([
    d3.min(sources, function (c) {
      return d3.min(c.values, function (v) {
        return -10;
      });
    }),
    d3.max(sources, function (c) {
      return d3.max(c.values, function (v) {
        return 100;
      });
    })]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  var focuslineGroups = focus.selectAll("g")
    .data(sources)
    .enter().append("g");

  var focuslines = focuslineGroups.append("path")
    .attr("class", "line")
    .attr("d", function (d) {
      return line(d.values);
    })
    .style("stroke", function (d) {
      return color(d.name);
    })
    .attr("clip-path", "url(#clip)");

  focus.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")	
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("font-size", "14px")
    .attr("transform", function(d) {
        return "rotate(-34)" 
    });

  focus.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  var contextlineGroups = context.selectAll("g")
    .data(sources)
    .enter().append("g");

  var contextLines = contextlineGroups.append("path")
    .attr("class", "line")
    .attr("d", function (d) {
      return line2(d.values);
    })
    .style("stroke", function (d) {
      return color(d.name);
    })
    .attr("clip-path", "url(#clip)");

  context.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2)
    .selectAll("text")	
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("font-size", "10px")
    .attr("transform", function(d) {
        return "rotate(-34)" 
    });

  context.append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("y", -6)
    .attr("height", height2 + 7);




  function brush() {
    x.domain(brush.empty() ? x2.domain() : brush.extent());
    focus.selectAll("path.line").attr("d", function (d) {
      return line(d.values);
    });
    focus.select(".x.axis").call(xAxis).selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("font-size", "10px")
            .attr("transform", function(d) {
                return "rotate(-34)" 
                });
    focus.select(".y.axis").call(yAxis);
  }
}
