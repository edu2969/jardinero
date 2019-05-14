Termometro = function(id, rangos, nodo) {
  var self = this;
  var HEIGHT = 120, WIDTH = 90;
  this.config = {
    id: id,
    width: WIDTH,
    height: HEIGHT,
    maxTemp: 30,
    minTemp: 15,
    currentTemp: 0,
    xoffset: 52,
    bottomY: HEIGHT,
    topY: 20,
    bulbRadius: 17,
    tubeWidth: 13,
    tubeBorderWidth: 2,
    mercuryColor: "#D3D74D",
    innerBulbColor: "white",
    tubeBorderColor: "#F2EEDD",
    bulb_cy: 92,
    bulb_cx: 30,
    top_cy: 13,
    nodo: nodo,
    codigo: "TERMOMETRO" + id,
    habilitado: true
  }

  this.render = function () {
    var div = this.config.nodo.append("div")
      .attr("class", "dispositivo contenedor-termometro")
      .attr("dispositivo", this.config.id);


    div.append("h2")
      .text("Temperatura");

    div.append("h1")
      .attr("id", "valorTemperatura" + this.config.codigo)
      .attr("class", "display-4")
      .text(this.config.currentTemp);

    div.append("span")
      .attr("class", "temperatura-grados")
      .text("°C");

    div.append("h4")
      .attr("id", "textoTemperatura" + this.config.codigo)
      .text((this.config.currentTemp < this.config.minTemp
             ? "Bajo"
             : (this.config.currentTemp > this.config.maxTemp ? "Caluroso" : "Óptimo")));

    var svg = div.append("svg")
      .attr("width", this.config.width)
      .attr("height", this.config.height);

    var defs = svg.append("defs");

    // Define the radial gradient for the bulb fill colour
    var bulbGradient = defs.append("radialGradient")
      .attr("id", "bulbGradient" + this.config.codigo)
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%")
      .attr("fx", "50%")
      .attr("fy", "50%");

    bulbGradient.append("stop")
      .attr("offset", "0%")
      .style("stop-color", (this.config.habilitado ? this.config.innerBulbColor : "#FFF"));

    bulbGradient.append("stop")
      .attr("offset", "90%")
      .style("stop-color", (this.config.habilitado ? this.config.mercuryColor : "#DDD"));




    // Circle element for rounded tube top
    svg.append("circle")
      .attr("r", this.config.tubeWidth / 2)
      .attr("cx", this.config.xoffset)
      .attr("cy", this.config.top_cy)
      .style("fill", this.config.tubeBorderColor)
      .style("stroke", this.config.tubeBorderColor)
      .style("stroke-width", this.config.tubeBorderWidth + "px");


    // Rect element for tube
    svg.append("rect")
      .attr("x", this.config.xoffset - this.config.tubeWidth / 2)
      .attr("y", this.config.top_cy)
      .attr("height", this.config.bulb_cy - this.config.top_cy)
      .attr("width", this.config.tubeWidth)
      .style("shape-rendering", "crispEdges")
      .style("fill", this.config.tubeBorderColor)
      .style("stroke", this.config.tubeBorderColor)
      .style("stroke-width", this.config.tubeBorderWidth + "px");


    // White fill for rounded tube top circle element
    // to hide the border at the top of the tube rect element
    svg.append("circle")
      .attr("r", this.config.tubeWidth / 2 - this.config.tubeBorderWidth / 2)
      .attr("cx", this.config.xoffset)
      .attr("cy", this.config.top_cy)
      .style("fill", this.config.tubeBorderColor)
      .style("stroke", "none")



    // Main bulb of thermometer (empty), white fill
    svg.append("circle")
      .attr("r", this.config.bulbRadius)
      .attr("cx", this.config.xoffset)
      .attr("cy", this.config.bulb_cy)
      .style("fill", this.config.tubeBorderColor)
      .style("stroke", this.config.tubeBorderColor)
      .style("stroke-width", this.config.tubeBorderWidth + "px");


    // Rect element for tube fill colour
    svg.append("rect")
      .attr("x", this.config.xoffset - (this.config.tubeWidth - this.config.tubeBorderWidth) / 2)
      .attr("y", this.config.top_cy)
      .attr("height", this.config.bulb_cy - this.config.top_cy)
      .attr("width", this.config.tubeWidth - this.config.tubeBorderWidth)
      .style("shape-rendering", "crispEdges")
      .style("fill", this.config.tubeBorderColor)
      .style("stroke", "none");


    // Scale step size
    var step = 20;

    // Determine a suitable range of the temperature scale
    var domain = [ -10, 50];

    if (this.config.minTemp - domain[0] < 0.66 * step)
      domain[0] -= step;

    if (domain[1] - this.config.maxTemp < 0.66 * step)
      domain[1] += step;


    // D3 scale object
    var scale = d3.scale.linear()
      .range([this.config.bulb_cy - this.config.bulbRadius / 2 - 8.5, this.config.top_cy])
      .domain(domain);

    // Max and min temperature lines
    var config = this.config;
    [this.config.minTemp, this.config.maxTemp].forEach(function (t) {
      var isMax = (t == config.maxTemp),
        label = (isMax ? "C" : "F"),
        textCol = (isMax ? "#F7CA18" : "#3498DB"),
        textOffset = (isMax ? -4 : 4);

      svg.append("line")
        .attr("id", label + "Line")
        .attr("x1", config.xoffset - config.tubeWidth / 2)
        .attr("x2", config.xoffset + config.tubeWidth / 2 + 8)
        .attr("y1", scale(t))
        .attr("y2", scale(t))
        .style("stroke", config.tubeBorderColor)
        .style("stroke-width", "2px")
        .style("shape-rendering", "crispEdges");

      svg.append("text")
        .attr("x", config.xoffset + config.tubeWidth / 2 + 2)
        .attr("y", scale(t) + textOffset)
        .attr("dy", isMax ? null : "0.75em")
        .text(label)
        .style("fill", textCol)
        .style("font-size", "16px")

    });


    var tubeFill_bottom = this.config.bulb_cy,
      tubeFill_top = scale(this.config.currentTemp);

    // Rect element for the red mercury column
    svg.append("rect")
      .attr("x", this.config.xoffset - (this.config.tubeWidth) / 2 + 2)
      .attr("y", tubeFill_top)
      .attr("width", this.config.tubeWidth - 4)
      .attr("height", tubeFill_bottom - tubeFill_top)
      .attr("id", "temperaturaTubo" + this.config.codigo)
      .style("shape-rendering", "crispEdges")
      .style("fill", this.config.mercuryColor);


    // Main thermometer bulb fill
    svg.append("circle")
      .attr("r", this.config.bulbRadius - 3)
      .attr("cx", this.config.xoffset)
      .attr("cy", this.config.bulb_cy)
      .style("fill", "url(#bulbGradient" + this.config.codigo + ")")
      .style("stroke", this.config.mercuryColor)
      .style("stroke-width", "2px");


    // Values to use along the scale ticks up the thermometer
    var tickValues = d3.range((domain[1] - domain[0]) / step + 1).map(function (v) {
      return domain[0] + v * step;
    });


    // D3 axis object for the temperature scale
    var axis = d3.svg.axis()
      .scale(scale)
      .innerTickSize(3)
      .outerTickSize(3)
      .tickValues(tickValues)
      .orient("left");

    // Add the axis to the image
    var svgAxis = svg.append("g")
      .attr("id", "tempScale")
      .attr("transform", "translate(" + (this.config.xoffset - this.config.tubeWidth / 2) + ",0)")
      .call(axis);

    // Format text labels
    svgAxis.selectAll(".tick text")
      .style("fill", "#2D3A52")
      .style("font-size", "14px");

    // Set main axis line to no stroke or fill
    svgAxis.select("path")
      .style("stroke", "none")
      .style("fill", "none")

    // Set the style of the ticks
    svgAxis.selectAll(".tick line")
      .style("stroke", this.config.tubeBorderColor)
      .style("shape-rendering", "crispEdges")
      .style("stroke-width", "2px");
  }

  this.redraw = function (valor) {
    this.config.currentTemp = valor;
    var step = 10;

    // Determine a suitable range of the temperature scale
    var domain = [
      -10,
      50
    ];

    if (this.config.minTemp - domain[0] < 0.66 * step)
      domain[0] -= step;

    if (domain[1] - this.config.maxTemp < 0.66 * step)
      domain[1] += step;

    // D3 scale object
    var scale = d3.scale.linear()
      .range([this.config.bulb_cy - this.config.bulbRadius / 2 - 8.5, this.config.top_cy])
      .domain(domain);

    var tubeFill_bottom = this.config.bulb_cy,
      tubeFill_top = scale(this.config.currentTemp);

    // Rect element for the red mercury column
    d3.select("#temperaturaTubo" + this.config.codigo)
      .attr("y", tubeFill_top)
      .attr("height", tubeFill_bottom - tubeFill_top);

    d3.select("#textoTemperatura" + this.config.codigo)
      .text((this.config.currentTemp < this.config.minTemp
             ? "Bajo"
             : (this.config.currentTemp > this.config.maxTemp ? "Caluroso" : (this.config.currentTemp > this.config.maxTemp ? "Óptimo" : "Frío" ))));

    d3.selectAll("#valorTemperatura" + this.config.codigo)
      .text(this.config.currentTemp);
  }

  this.render();
}
