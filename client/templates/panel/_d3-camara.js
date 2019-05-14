camaras = [];

crearCamara = function (indice, nodo) {
  camaras["CAMARA" + indice] = new Camara(indice, nodo);
}

function Camara(indice, nodo) {
  this.indice = indice;
  this.nodo = nodo;
  
  var div = nodo.append("div")
    .attr("class", "contenedor-d3js")
    .append("div")
    .attr("class", "dispositivo contenedor-camara")
    .attr("dispositivo", indice)
    .attr("id", "_camaraCAMARA" + indice);
  
  div.append("h4").text("Encendido");
  div.append("span").text("de 19:00 a 20:00");
  
  div.append("div")
    .attr("class", "marco-imagen")
    .append("img")
    .attr("src", "/imagenes/durmiendo.png")
    .attr("id", "_camaraCAMARA" + indice);
  
  div.append("div").attr("id", "_switch" + this.indice).attr("class", "marco-switch").append("input").attr("type", "checkbox").attr("class", "swithOnOff");
  $("#_switch" + this.indice + " input").simpleSwitch();
  
  this.actualizar = function (estado) {
    d3.selectAll("#_camaraCAMARA" + this.indice)
      .attr("src", "/imagenes/" + ( estado ? "despierto" : "durmiendo") + ".png");
  }
}
