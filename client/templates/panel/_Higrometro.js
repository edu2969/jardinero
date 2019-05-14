Higrometro = function(id, rangos, nodoSensor) {
  var self = this; // for internal d3 functions

  var nodo = nodoSensor.append("div")
    .attr("class", "dispositivo contenedor-aguja")
    .attr("dispositivo", id);

  this.config = {
    id: id,
    nodo: nodo,
    size: 110,
    min: 0,
    max: 100,
    minorTicks: 6,
    habilitado: true,
    codigo: "HIGROMETRO" + id
  }

  this.config.nodo.append("h1").attr("id", "_valor-humedad" + this.config.codigo);
  this.config.nodo.append('h2').text("Humedad");
  this.config.nodo.append("h4").text("Seco");
  this.config.nodo.append("span").text("%");

  this.config.range = this.config.max - this.config.min;
  this.config.redZones = [{
    from: this.config.min,
    to: this.config.min + this.config.range * 0.6
  }];
  this.config.yellowZones = [{
    from: this.config.min + this.config.range * 0.6,
    to: this.config.min + this.config.range * 0.8
  }];
  this.config.greenZones = [{
    from: this.config.min + this.config.range * 0.8,
    to: this.config.max
  }];

  this.config.raduis = this.config.size * 0.97 / 2;
  this.config.cx = this.config.size / 2;
  this.config.cy = this.config.size / 2;
  this.config.greenColor = this.config.habilitado ?  "#F2EEDD" : "#dddddd";
  this.config.yellowColor = this.config.habilitado ? "#D5DA4D" : "#bbbbbb";
  this.config.redColor = this.config.habilitado ?  "#403251" : "#999999";
  this.config.transitionDuration = 500;

  this.render = function () {
    this.body = d3.select(".contenedor-aguja")
      .append("svg:svg")
      .attr("class", "aguja")
      .attr("id", this.id)
      .attr("width", this.config.size)
      .attr("height", this.config.size + 36);

    for (var index in this.config.greenZones) {
      this.drawBand(this.config.greenZones[index].from, this.config.greenZones[index].to, self.config.greenColor);
    }

    for (var index in this.config.yellowZones) {
      this.drawBand(this.config.yellowZones[index].from, this.config.yellowZones[index].to, self.config.yellowColor);
    }

    for (var index in this.config.redZones) {
      this.drawBand(this.config.redZones[index].from, this.config.redZones[index].to, self.config.redColor);
    }

    var fontSize = Math.round(this.config.size / 14);
    for (var linea = this.config.min; linea <= this.config.max; linea += 5) {
      var point1 = this.valueToPoint(linea, 0.65);
      var point2 = this.valueToPoint(linea, 1);

      this.body.append("svg:line")
        .attr("x1", point1.x)
        .attr("y1", point1.y)
        .attr("x2", point2.x)
        .attr("y2", point2.y)
        .style("stroke", "#9DC699")
        .style("stroke-width", "2px");

      if (linea == this.config.min
          || linea == this.config.max * 0.6
          || linea == this.config.max * 0.8
          || linea == this.config.max) {

        var point = this.valueToPoint(linea, 0.49);

        this.body.append("svg:text")
          .attr("x", point.x)
          .attr("y", point.y)
          .attr("dy", fontSize / 3)
          .attr("text-anchor", linea == this.config.min ? "start" : "end")
          .text(linea)
          .style("font-size", fontSize + "px")
          .style("fill", ( this.config.habilitado ? "#293849" : "#DDD" ));
      }
    }


    var pointerContainer = this.body.append("svg:g").attr("class", "pointerContainer");

    var midValue = (this.config.min + this.config.max) / 2;

    var pointerPath = this.buildPointerPath(midValue);

    var pointerLine = d3.svg.line()
      .x(function (d) {
        return d.x
      })
      .y(function (d) {
        return d.y
      })
      .interpolate("basis");

    pointerContainer.selectAll("path")
      .data([pointerPath])
      .enter()
      .append("svg:path")
      .attr("d", pointerLine)
      .style("fill", ( this.config.habilitado ? "#FFFFFF" : "#9DC699" ));

    this.redraw(this.config.min, 0);
  }

  this.buildPointerPath = function (value) {
    var delta = this.config.range / 3;

    var head = valueToPoint(value, 0.85);
    var head1 = valueToPoint(value - delta, -0.12);
    var head2 = valueToPoint(value + delta, -0.12);

    var tailValue = value - (this.config.range * (1 / (120 / 360)) / 2);
    var tail = valueToPoint(tailValue, -0.48);
    var tail1 = valueToPoint(tailValue - delta, 0.12);
    var tail2 = valueToPoint(tailValue + delta, 0.12);

    return [head, head1, tail2, tail, tail1, head2, head];

    function valueToPoint(value, factor) {
      var point = self.valueToPoint(value, factor);
      point.x -= self.config.cx;
      point.y -= self.config.cy;
      return point;
    }
  }

  this.drawBand = function (start, end, color) {
    if (0 >= end - start) return;

    this.body.append("svg:path")
      .style("fill", color)
      .attr("d", d3.svg.arc()
        .startAngle(this.valueToRadians(start))
        .endAngle(this.valueToRadians(end))
        .innerRadius(0.65 * this.config.raduis)
        .outerRadius(1 * this.config.raduis))
      .attr("transform", function () {
        return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(270)"
      });
  }

  this.redraw = function (value) {
    var pointerContainer = this.body.select(".pointerContainer");
    d3.selectAll("#_valor-humedad" + this.config.codigo).text(Math.round(value));

    var pointer = pointerContainer.selectAll("path");
    if (value != 'NaN') {
      pointer.transition()
        .duration(1500)
        //.delay(0)
        //.ease("linear")
        //.attr("transform", function(d)
        .attrTween("transform", function () {
          var pointerValue = value;
          if (value > self.config.max) pointerValue = self.config.max + 0.02 * self.config.range;
          else if (value < self.config.min) pointerValue = self.config.min - 0.02 * self.config.range;
          var targetRotation = (self.valueToDegrees(pointerValue) - 15);
          var currentRotation = self._currentRotation || targetRotation;
          self._currentRotation = targetRotation;

          return function (step) {
            var rotation = currentRotation + (targetRotation - currentRotation) * step;
            return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(" + rotation + ")";
          }
        });
    }
  }

  this.valueToDegrees = function (value) {
    return value / this.config.range * 120 - (this.config.min / this.config.range * 120 + 45);
  }

  this.valueToRadians = function (value) {
    return this.valueToDegrees(value) * Math.PI / 180;
  }

  this.valueToPoint = function (value, factor) {
    return {
      x: this.config.cx - this.config.raduis * factor * Math.cos(this.valueToRadians(value)),
      y: this.config.cy - this.config.raduis * factor * Math.sin(this.valueToRadians(value))
    };
  }

  this.render();
}
