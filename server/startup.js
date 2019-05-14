var sensorLib = false;//Meteor.npmRequire("node-dht-sensor");
var gpio = false;//Meteor.npmRequire("rpi-gpio");
Fiber = Meteor.npmRequire("fibers");

ConfiguracionDefecto = function () {
  return {
    nombre: "Ramiro",
    dispositivos: [
      {
        tipo: "DHT11",
        pin: 4
      },
      {
        tipo: "VENT_IN",
        pin: 11,
        reglas: [
          {
            tipo: "I",
            expresion: "T > 23"
          },
          {
            tipo: "X",
            expresion: "T < 20",
            desde: "09:00",
            hasta: "19:00",
            intervalo: "5s",
            cada: "10s"
          },
          {
            tipo: "X",
            expresion: "T < 20",
            desde: "19:00",
            hasta: "09:00",
            intervalo: "5s",
            cada: "15s"
          }
        ]
      },
      {
        tipo: "PULV",
        pin: 13,
        reglas: [
          {
            tipo: "O",
            expresion: "H > 39"
          },
          {
            tipo: "X",
            expresion: "H < 40",
            desde: "09:00",
            hasta: "17:00",
            intervalo: "5s",
            cada: "10s"
          }
        ]
      },
      {
        tipo: "VENT_REC",
        pin: 15,
        reglas: [
          {
            tipo: "I",
            expresion: "T > 25"
          },
          {
            tipo: "O",
            expresion: "T < 26"
          }
        ]
      },
      {
        tipo: "VENT_OUT",
        pin: 16,
        reglas: [
          {
            tipo: "I",
            expresion: "T > 20"
          },
          {
            tipo: "O",
            expresion: "T < 21"
          }
        ]
      },
      {
        tipo: "FOCO",
        pin: 13,
        reglas: [
          {
            tipo: "I",
            desde: "09:00",
            hasta: "17:00"
          },
          {
            tipo: "O",
            desde: "17:00",
            hasta: "09:00"
          }
        ]
      },
      {
        tipo: "AIRE",
        pin: 15,
        reglas: [
          {
            tipo: "I",
            desde: "09:00",
            hasta: "17:00"
          },
          {
            tipo: "O",
            desde: "17:00",
            hasta: "09:00"
          }
        ]
      },
      {
        tipo: "HUM",
        pin: 18,
        reglas: [
          {
            tipo: "I",
            desde: "09:00",
            hasta: "17:00"
          },
          {
            tipo: "O",
            desde: "17:00",
            hasta: "09:00"
          }
        ]
      }
    ]
  };
}

var INTERVALO_LECTURA_DHT = 10000;

SetearGPIOS = function () {
  var config = Configuraciones.findOne();
  if (!config) return false;
  var dispositivos = Dispositivos.find({
    configuracionId: config._id
  });
  dispositivos.forEach(function (dispositivo) {
    var reglas = Reglas.find({
      dispositivoId: dispositivo._id
    });
    if (reglas && dispositivo.accion != dispositivo.anterior) {
      if (dispositivo.accion != "X" && dispositivo.accion != dispositivo.anterior) {
        var datapin = dispositivo.accion == "O";
        //console.log("Seteando GPIO-PIN " + dispositivo.pin + " (" + dispositivo.codigo + ") SET-> " + dispositivo.accion + " GPIO:" + datapin);
        if (gpio) {
          gpio.setup(dispositivo.pin, gpio.DIR_OUT, function () {
            gpio.write(dispositivo.pin, datapin, function (err) {
              if (err) throw err;
            });
          });
          bandera = true;
        } else {
          //console.log("Modo demo: zzzzz");
        }
      }
    }
    if (reglas && dispositivo.accion == dispositivo.anterior) {
      //console.log(dispositivo.tipo + " omitido por repeticion de estado");
    }
  });
}

EvaluarCondiciones = function (temperatura, humedad) {
  var config = Configuraciones.findOne();
  if (!config) {
    //console.log("No fue posible encontrar configuracion inicial v1.1");
    var config = ConfiguracionDefecto();
    var configid = Configuraciones.insert({
      nombre: config.nombre
    });
    config.dispositivos.forEach(function (d) {
      var reglas = d.reglas;
      delete d.reglas;
      d.configuracionId = configid;
      var dId = Dispositivos.insert(d);
      //console.log(JSON.stringify(d));
      for (var indice = 0; indice < (reglas ? reglas.length : 0); indice++) {
        var r = reglas[indice];
        r.dispositivoId = dId;
        r.numero = indice;
        Reglas.insert(r);
        //console.log(JSON.stringify(r));
      }
    });
    return false;
  }

  // CEREBRO. Revisa una a una las reglas
  //console.log("T: " + temperatura + " H:" + humedad);
  var dispositivos = Dispositivos.find({
    configuracionId: config._id
  });
  dispositivos.forEach(function (dispositivo) {
    dispositivo.anterior = dispositivo.accion;
    var reglas = Reglas.find({
      dispositivoId: dispositivo._id
    });
    
    
    
    // Incinsion para modo manual on-off
    if(dispositivo.modo && dispositivo.modo.manual) {
      dispositivo.accion = dispositivo.modo.encendido;
      reglas = [];  // Condicion simple de salida
    }
    // Fin incision
    
    
    
    var finbloque = false;
    reglas.forEach(function (regla) {
      regla.anterior = regla.accion;
      regla.accion = "X";
      if (!finbloque) {
        var resultado = true;
        
        if (regla.expresion) {
          var partes = regla.expresion.split(" ");
          resultado = eval((partes[0] == "T" ? "temperatura" : "humedad") + partes[1] + partes[2]);
        }
        if (resultado) {
          regla.accion = (regla.tipo == "I" ? (resultado ? "I" : "O") : (resultado ? "O" : "I"));
          dispositivo.accion = regla.accion;
          var desde = moment().startOf("day");
          var hasta = moment().endOf("day");
          if (regla.desde) {
            var temps = regla.desde.split(":");
            desde = moment()
              .hours(Number(temps[0]))
              .minutes(Number(temps[1]))
              .seconds(temps[2] ? Number(temps[2]) : 0);

            temps = regla.hasta.split(":");
            hasta = moment()
              .hours(Number(temps[0]))
              .minutes(Number(temps[1]))
              .seconds(temps[2] ? Number(temps[2]) : 0);
            //console.log("Compara " + desde.format("HH:mm:ss") + " - " + hasta.format("HH:mm:ss"));
          }
          if(hasta.isBefore(desde)) {
	    hasta = hasta.add(1, "day");
	  }
          var ahora = moment().subtract(3, "hour");
          if (ahora.isBefore(hasta) && ahora.isAfter(desde)) {
            if (!regla.horaInicio) regla.horaInicio = new Date();
            if (regla.intervalo) {
              var intervalo = {
                cantidad: Number(regla.intervalo.substring(0, regla.intervalo.length - 1)),
                unidad: regla.intervalo.substring(regla.intervalo.length - 1)
              };
              var cada = {
                cantidad: Number(regla.cada.substring(0, regla.cada.length - 1)),
                unidad: regla.cada.substring(regla.cada.length - 1)
              };
              var horaIntervalo = moment(regla.horaInicio).add(intervalo.cantidad, intervalo.unidad);
              var ahora = moment();
              //console.log("I:" + JSON.stringify(intervalo) + " C:" + JSON.stringify(cada));
              //console.log("Compara: " + horaIntervalo.format("HH:mm:ss") + " con " + ahora.format("HH:mm:ss"));
              //console.log(" / Antes? " + ahora.isBefore(horaIntervalo));
              if (ahora.isBefore(horaIntervalo)) {
                regla.accion = "I";
                dispositivo.accion = regla.accion;
                dispositivo.reglaActiva = regla;
                finbloque = true;
              }
              //console.log(" / Despues?" + ahora.isAfter(horaIntervalo));
              if (ahora.isAfter(horaIntervalo)) {
                regla.accion = "O";
                //console.log("Nueva hora inicio: " + regla.horaInicio);
                dispositivo.accion = regla.accion;
                dispositivo.reglaActiva = regla;
                finbloque = true;
              }

              var horaCada = moment(regla.horaInicio).add(cada.cantidad, cada.unidad);
              if (ahora.isAfter(horaCada)) {
                regla.horaInicio = false;
              }
            } else {
              dispositivo.reglaActiva = regla;
              finbloque = true;
            }
          } else {
            //console.log("No se cumple el horario desde/hasta");
            regla.accion = "O";
            dispositivo.accion = "O";
            dispositivo.reglaActiva = regla;
          }
        }
        //console.log("Regla tipo=" + regla.tipo + ": " + regla.expresion + ": " + regla.accion);
        Reglas.update({
          _id: regla._id
        }, {
          $set: regla
        });
      }
    });
    //console.log("Dispositivo " + dispositivo.tipo + ": " + dispositivo.anterior + " > > " + dispositivo.accion);
    Dispositivos.update({
      _id: dispositivo._id
    }, {
      $set: dispositivo
    });
  });

  var dht = Dispositivos.findOne({
    tipo: "DHT11"
  });
  Dispositivos.update({
    _id: dht._id
  }, {
    $set: {
      temperatura: temperatura,
      humedad: humedad
    }
  });
}


var sensor = {
  sensors: [{
      name: "Indoor",
      type: 11,
      pin: 4
    }
    ],
  read: function () {
    for (var a in this.sensors) {
      var b = {};
      if (sensorLib) {
        b = sensorLib.read(this.sensors[a].type, this.sensors[a].pin);
      } else {
        b = {
          temperature: Math.floor(Math.random() * 30) + 10,
          humidity: Math.floor(Math.random() * 90) + 10
        }
      }
      var temp = Number(b.temperature.toFixed(1));
      var hum = Number(b.humidity.toFixed(1));

      //

      // var temp = 36, hum = 30;

      Fiber(function () {
        Meteor.call('ProcesarLectura', temp, hum);
      }).run();

      //console.log("Nuevo set................................................");
      nuevaConfig = EvaluarCondiciones(temp, hum);
      SetearGPIOS();
    }
    Meteor.setTimeout(function () {
      sensor.read();
    }, INTERVALO_LECTURA_DHT);
  }
};
sensor.read();
