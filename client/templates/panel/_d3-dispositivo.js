dispositivos = [];

crearDispositivo = function (id, tipo, nodo) {
  dispositivos["DISPOSITIVO" + id] = new Dispositivo(id, tipo, nodo);
}

function Dispositivo(id, tipo, nodo) {
  this.id = id;
  this.nodo = nodo;
  this.tipo = tipo;
  this.etiqueta = tipo=="FOCO" ? "LUZ" :
              tipo=="AIRE" ? "A/C" : 
              tipo=="PULV" ? "Pulverizador" : 
              tipo=="HUM" ? "Humidificador" : 
              tipo=="VENT_REC" ? "Recirculación" : 
              tipo=="VENT_OUT" ? "Salida de aire" : 
              tipo=="VENT_IN" ? "Entrada de aire" : 
	 tipo=="CO2" ? "CO2" :
	tipo=="RIEGO" ? "Riego" :
	tipo=="LLAVE" ? "Cerrojo" : 
		"Desconocido";  
  
  
  this.imagen = "/imagenes/" + tipo.replace("_IN", "").replace("_OUT", "").replace("_REC", "") + "_ON.png";
  
  var div = nodo
    .append("div")
    .attr("class", "contenedor-d3js")
    .append("div")
    .attr("class", "dispositivo contenedor-dispositivo")
    .attr("dispositivo", this.id);
  
  div.append("h3").text(this.etiqueta)
  div.append("h2").text("- - - -")
  div.append("h4").attr("rol", "condicion")
    .append("span").attr("rol", "detalle").text("...");
  var h4 = div.append("h4").attr("rol", "hora");
  h4.append("span").attr("class", "glyphicon glyphicon-time")
  h4.append("span").attr("rol", "detalle").text("...");
  
  h4 = div.append("h4").attr("rol", "fecha")
  h4.append("span").attr("class", "glyphicon glyphicon-calendar")
  h4.append("span").attr("rol", "detalle").text("...");
  
  h4 = div.append("h4").attr("rol", "intervalo")
  h4.append("span").attr("class", "glyphicon glyphicon-repeat")
  h4.append("span").attr("rol", "detalle").text("...");
  
  div.append("div")
    .attr("class", "marco-imagen")
    .attr("dispositivo", this.id)
    .append("div")
    .append("img")
    .attr("src", this.imagen);
  
  this.actualizar = function(reglaActiva) {
	  if(!reglaActiva.tipo) reglaActivo.tipo = "X";
    $(".dispositivo[dispositivo='"+ this.id +"'] h2").text(reglaActiva.tipo!="O" ? "ENCENDIDO" : "APAGADO" );
    if(this.tipo.indexOf("VENT")!=-1) {
      if(reglaActiva.tipo!="O") {
        $(".marco-imagen[dispositivo='"+ this.id +"'] div").attr("class", "rotating");
      } else {
        $(".marco-imagen[dispositivo='"+ this.id +"'] div").attr("class", "");
      }      
    } else if(this.tipo.indexOf("FOCO")!=-1) {
      if(reglaActiva.tipo!="O") {
        $(".marco-imagen[dispositivo='"+ this.id +"'] div img").attr("src", "/imagenes/FOCO_ON.png");
      } else {
        $(".marco-imagen[dispositivo='"+ this.id +"'] div img").attr("src", "/imagenes/FOCO_OFF.png");
      }  
    } else if(this.tipo.indexOf("PULV")!=-1) {
      if(reglaActiva.tipo!="O") {
        $(".marco-imagen[dispositivo='"+ this.id +"'] img").attr("class", "blink deshabilitado");
      } else {
        $(".marco-imagen[dispositivo='"+ this.id +"'] img").attr("class", "deshabilitado");
      }  
    } else if(this.tipo.indexOf("AIRE")!=-1) {
      if(reglaActiva.tipo!="O") {
        $(".marco-imagen[dispositivo='"+ this.id +"'] img").attr("class", "blink deshabilitado");
      } else {
        $(".marco-imagen[dispositivo='"+ this.id +"'] img").attr("class", "deshabilitado");
      }  
    } else if(this.tipo.indexOf("CO2")!=-1) {
	    if(reglaActiva.tipo!="O") {
		    $(".marco-imagen[dispositivo='" + this.id + "'] img").attr("class", "blink deshabilitado");
		} else {
			$(".marco-imagen[dispositivo='" + this.id + "'] img").attr("class", "deshabilitado");
		}
    } else if(this.tipo.indexOf("RIEGO")!=-1) {
	    if(reglaActiva.tipo!="O") {
		    $(".marco-imagen[dispositivo'" + this.id + "'] img").attr("class", "blink deshabilitado");
	    } else {
		$(".marco-imagen[dispositivo'" + this.id + "'] img").attr("class", "deshabilitado");	
	    }
    } else if(this.tipo.indexOf("LLAVE")!=-1) {
	    if(reglaActiva.tipo!="O") {
		    $(".marco-imagen[dispositivo'" + this.id + "'] img").attr("class", "blink deshabilitado");
	    } else {
		    $(".marco-imagen[dispositivo'" + this.id + "'] img").attr("class", "deshabilitado");
	    }
    }


        

    $(".dispositivo[dispositivo='"+ this.id +"'] h4[rol='condicion'] span[rol='detalle']")
      .text(reglaActiva.expresion ? reglaActiva.expresion : "SIEMPRE");
    
    $(".dispositivo[dispositivo='"+ this.id +"'] h4[rol='fecha'] span[rol='detalle']")
      .text(reglaActiva.fechaDesde ? " " + reglaActiva.fechaDesde + " hasta " + reglaActiva.fechaHasta : " - - -");
    
    $(".dispositivo[dispositivo='"+ this.id +"'] h4[rol='hora'] span[rol='detalle']")
      .text(reglaActiva.desde ? " " + reglaActiva.desde + " a " + reglaActiva.hasta : " Toda hora");
    
    $(".dispositivo[dispositivo='"+ this.id +"'] h4[rol='intervalo'] span[rol='detalle']")
      .text(reglaActiva.intervalo ? " " + reglaActiva.intervalo + " cada " + reglaActiva.cada + "s" : " - - -");
  }
}
