relojes = [];

crearReloj = function (id, nodo) {
  relojes["RELOJ-" + id] = new Reloj(id, nodo);
}

function Reloj(id, nodo) {
  var self = this;
  this.id = id;

  this.render = function () {
    var div = nodo.append('div')
      .attr("class", "contenedor-d3js")
      .append("div")
      .attr("class", "dispositivo contenedor-reloj")
      .attr("dispositivo", this.id);
    
    
    var ctext = div.append("div")
      .attr("id", "hora" + this.id)
      .attr("class", "reloj display-4");
      
    ctext.append("div")
      .attr("class", "reloj-hora")
      .text(this.hora);
    
    ctext.append("div")
      .attr("class", "reloj-segundos");
    
    ctext.append("div")
      .attr("class", "reloj-fecha");
  }

  this.actualizar = function (hora) {
    this.hora = hora;
    var f = moment(hora).format("dddd DD/MM/YY");
    var h = moment(hora).format("HH:mm");
    var s = moment(hora).format("ss");
    d3.selectAll("#hora" + this.id + " .reloj-hora").text(h+ ":");
    d3.selectAll("#hora" + this.id + " .reloj-hora").append("small").text(s);
    d3.selectAll("#hora" + this.id + " .reloj-fecha").text(f);
  }

  this.render();
}