Handlebars.registerHelper("FormatoFecha", function (fecha, mascara) {
  return moment(fecha ? fecha : new Date()).format(mascara);
});

Handlebars.registerHelper("selectedEval", function (id1, id2) {
  if(id1==id2) return 'selected';
  return '';
});

ConversorPin2GPIO = function (pin) {
  var mapa = ["X", "3.3v", "5v", "GPIO 2", "5v", "GPIO 3", "GND", "GPIO 4",
             "GPIO 14", "GND", "GPIO 15", "GPIO 17", "GPIO 18", "GPIO 27", "GND",
             "GPIO 22", "GPIO 23", "3.3v", "GPIO 24", "GPIO 10", "GND", "GPIO 9",
             "GPIO25", "GPIO11", "GPIO8", "GND", "GPIO7",
	     "ID_SD", "ID_SC",
	     "GPIO 5", "GND", "GPIO 6", "GPIO 12", "GPIO 13", "GND",
             "GPIO 19", "GPIO 16", "GPIO 26", "GPIO 20", "GND", "GPIO 21"];
  return mapa[pin];
}

TraductorTipos = function (llave) {
  var glosas =  [
    {
      id: "DHT11",
      glosa: "Termohigrometro"
    },
    {
      id: "VENT_IN",
      glosa: "Aire entrada"
    },
    {
      id: "VENT_OUT",
      glosa: "Aire salida"
    },
    {
      id: "VENT_REC",
      glosa: "Ventilador recirculaci&oacute;n"
    },
    {
      id: "FOCO",
      glosa: "Foco"
    },
    {
      id: "HUM",
      glosa: "Humidificador"
    },
    {
      id: "AIRE",
      glosa: "A / C"
    },
    {
      id: "PULV",
      glosa: "Pulverizador"
    },
	  { id: "CO2", glosa: "CO2" },
	  { id: "RIEGO", glosa: "Riego" },
	{ id: "LLAVE", glosa: "Cerrojo" }
  ];
  return llave=="*" ? glosas : glosas.find(function(a) { return a.id==llave }).glosa;
}

IsEmpty = function(obj) {
  for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
          return false;
  }
  return JSON.stringify(obj) === JSON.stringify({});
}
