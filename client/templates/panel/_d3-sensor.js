sensores = [];

crearSensor = function (id, rangos, nodo, nombre) {
  sensores["SENSOR" + id] = new Sensor(id, rangos, nodo, nombre);
}

Sensor = function (id, rangos, nodo, nombre) {
  var self = this;
  var nodoSensor = nodo.append("div")
    .attr("class", "contenedor-d3js-sensor")

  nodoSensor.append("div")
    .attr("class", "nombre-sensor")
    .append("h4").text(nombre);

  if(!rangos) {
    rangos = {
      temperatura: { min: 15, max: 25 },
      humedad: { min: 60, max: 80 }
    }
  }

  this.termometro = new Termometro(id, rangos.humedad, nodoSensor);
  this.higrometro = new Higrometro(id, rangos.temperatura, nodoSensor);

  this.redraw = function(temperatura, humedad, nombre) {
    d3.select(".nombre-sensor h4").text(nombre);
    this.higrometro.redraw(humedad);
    this.termometro.redraw(temperatura);
  }
}
