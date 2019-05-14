var timer = false;
var horaOffset, timerHoraServer;

Template.panel.rendered = function () {
  Session.set("PlantaSeleccionada", false);
  Session.set("BitacoraSeleccionada", false);
  Session.set("GraficoCargado", false);

  iniciarLayout();

  Dispositivos.find().observeChanges({
    changed: function(id, fields) {
      var dispositivo = Dispositivos.findOne(id);
      actualizarPanel(dispositivo);
    },
    added: function(id) {
      var dispositivo = Dispositivos.findOne(id);
      agregarDispositivo(dispositivo);
      actualizarPanel(dispositivo);
    }
  });

  Tracker.autorun(function() {
    if(FlowRouter.subsReady("plantas") && !Session.get("PlantaSeleccionada")) {
      var planta = Plantas.findOne();
      if(planta) {
        Session.set("PlantaSeleccionada", planta);
      } else {
        Session.set("PlantaSeleccionada", {
          fechaCero: new Date()
        });
      }
    }

    if(FlowRouter.subsReady("logs") && !Session.get("GraficoCargado")) {
      Session.set("GraficoCargado", true);
      crearGrafico({ nodo: d3.select("#div-grafico"), data: getDataGrafico() });
    }
  });

  $('.datetimepicker-component').datetimepicker({
    format: 'DD/MM/YY'
  });

  $(".simple-switch").simpleSwitch();

  /*setInterval(function() {
    var tiempo = new Date().getTime().toString(10);
    $("#div-camara .imagen-01").attr("src", "http://192.168.1.108/cgi-bin/snapshot.cgi?loginuse=admin&loginpas=admin&dummy=" + tiempo);
  }, 1000);*/
}

Template.panel.helpers({
  plantas: function() {
    return Plantas.find();
  },
  planta: function() {
    return Session.get("PlantaSeleccionada");
  },
  bitacora: function() {
    return Session.get("BitacoraSeleccionada");
  },
  error: function() {
    return Session.get("MensajeError");
  },
  rangoFechasGrafico: function() {
    var desde = moment().subtract(3, 'months');
    return {
      desde: desde.format('DD MMM/YY'),
      hasta: moment().format('DD MMM/YY')
    };
  },
  anotaciones: function() {
    var planta = Session.get("PlantaSeleccionada");
    return Bitacoras.find({ plantaId: planta && planta._id }).map(function(reg) {
      reg.fecha = moment(planta.fechaCero).add(reg.dia, "days").toDate();
      return reg;
    });
  }
})

Template.panel.events({
  "click .btn-editar": function() {
    $(".dispositivo").each(function(i, o) {
        $(this).toggleClass("shake-slow-" + (i%4 + 1) + " shake-constant shake-constant--hover editable");
    });
    $(".marco-btn-agregar-dispositivo").toggleClass("activo");
  },
  "click #btn-nueva": function() {
    $("#modal-nueva").modal("show");
  },
  "click #btn-poda": function() {
    $("#modal-poda").modal("show");
  },
  "change #select-planta": function(e) {
    e.preventDefault();
    var id = e.currentTarget.options[e.currentTarget.selectedIndex].id;
    Session.set("PlantaSeleccionada", Plantas.findOne({ _id: id }));
    console.log(JSON.stringify(Session.get("PlantaSeleccionada")));
    return false;
  },
  "focusout #input-fechaCero": function() {
    var planta = Session.get("PlantaSeleccionada");
    if(!planta) return false;
    var valor = $("#input-fechaCero").val();
    var doc = { fechaCero: moment(valor, 'DD/MM/YY').toDate() };
    console.log("Actualizando planta: " + JSON.stringify(doc));
    Meteor.call("ActualizarPlanta", planta._id, doc);
  },
  "focusin #input-dia": function(e) {
    $("#input-dia").select();
  },
  "keyup #input-dia": function(e) {
    console.log("Haber..");
    var planta = Session.get("PlantaSeleccionada");
    if(!planta) return;
    var dia = Number($("#input-dia").val());
    if(isNaN(dia)) {
      Session.set("MensajeError", {
        mensaje: "Debe ingresa un número para ver la bitácora del día"
      });
      $(".alert").fadeIn();
      if(timer) clearTimeout(timer);
      timer = setTimeout(function() {
        $(".alert").fadeOut();
        Session.set("MensajeError", false);
      }, 3000);
      return;
    }
    var b = Bitacoras.findOne({ plantaId: planta._id, dia: dia });
    Session.set("BitacoraSeleccionada", b);
  },
  "focusout #input-nota": function() {
    var planta = Session.get("PlantaSeleccionada");
    if(!planta) return false;
    var dia = $("#input-dia").val();
    if(!dia) {
      Session.set("MensajeError", {
        mensaje: "Debe primero ingresar el día de ésta nota"
      });
      $(".alert").fadeIn();
      if(timer) clearTimeout(timer);
      timer = setTimeout(function() {
        $(".alert").fadeOut();
        Session.set("MensajeError", false);
      }, 3000);
      return false;
    }
    var nota = $("#input-nota").val();
    var bitacora = Bitacoras.findOne({ plantaId: planta._id, dia: dia });
    var doc = { plantaId: planta._id, dia: Number(dia), nota: nota, ultimaModificacion: new Date() };
    console.log("Setenado bitacora: " + JSON.stringify(doc));
    Meteor.call("SetearBitacora", doc, function(error, result) {
      if(error) {
        Session.set("MensajeError", { mensaje: "Hubo un error al insertar la bitacora: " + error});
        $(".alert").fadeIn();
        if(timer) clearTimeout(timer);
        timer = setTimeout(function() {
          $(".alert").fadeOut();
          Session.set("MensajeError", false);
        }, 3000);
        return false;
      } else {
        console.log("Salio todo bien...")
        var bitacora = Bitacoras.findOne({ plantaId: planta._id, dia: dia });
        Session.set("BitacoraSeleccionada", bitacora);
      }
    });
  },
  "click .shake-constant": function(e) {
    var config = Configuraciones.findOne();
    e.preventDefault();
    var id = e.currentTarget.attributes.dispositivo.value;
    Session.set("DispositivoSeleccionado", Dispositivos.findOne(id));
    $("#modal-config").modal("show");
  },
  "click .btn-agregar-dispositivo": function() {
    var id = $(".nav").find(".active").children()[0].href.split("#")[1];
    Session.set("DispositivoSeleccionado", {
      tipo: id=="div-sensores" ? "DHT11" : false,
      nombre: ""
    });
    $("#modal-config").modal("show");
  }
});

function iniciarLayout() {
  $('#panel *').remove();

  sensores = [];
  ventiladores = [];
  focos = [];
  aires = [];
  humidificadores = [];
  pulverizadores = [];
  camaras = [];
}

function agregarDispositivo(dispositivo) {
  var tipo = dispositivo.tipo;
  if(tipo=="DHT11") {
    var n = d3.selectAll("#div-sensores");
    crearSensor(dispositivo._id, false, n, dispositivo.nombre);
  } else if(tipo=="RELOJ") {
    var n = d3.selectAll("#div-sensores");
    crearReloj(dispositivo._id, n);
  } else {
    var n = d3.selectAll("#div-dispositivos");
    crearDispositivo(dispositivo._id, dispositivo.tipo, n);
  }
}

function actualizarPanel(dispositivo) {
  if(!dispositivo) return false;
  var tipo = dispositivo.tipo;
  //console.log("Actualizando: " + tipo + ":" + dispositivo.accion);
  if(tipo.indexOf("DHT11")!=-1) {
    if(!sensores["SENSOR" + dispositivo._id]) return false;
    sensores["SENSOR" + dispositivo._id].redraw(
      dispositivo.temperatura,
      dispositivo.humedad,
      dispositivo.nombre
    );
  } else if(tipo.indexOf("RELOJ")!=-1) {
    if(!relojes["RELOJ-" + dispositivo._id]) return false;
    Meteor.call("ObtenerHoraServer", function(err, resp) {
      if(!err) {
        if(!timerHoraServer) {
          horaOffset = 0; //moment().subtract(resp).milliseconds();
          timerHoraServer = setInterval(function() {
            relojes["RELOJ-" + dispositivo._id].actualizar(moment().add(horaOffset, 'ms').toDate());
          }, 1000);
        }
      }
    });
  } else {
    dispositivos["DISPOSITIVO" + dispositivo._id].actualizar(dispositivo.reglaActiva);
  }
}

function getDataGrafico() {
  return Logs.find().map(function(o, i) {
    o.fecha = moment(o.fecha).format("DD/MM/YYYY HH:mm");
    o.temperatura = o.promedio.temperatura;
    o.humedad = o.promedio.humedad;
    return o;
  });
}

function agregarBotonera(nodo) {
  var div = nodo.append("div").attr("class", "botonera");
  div.append("button").attr("class", "btn btn-primary btn-editar").append("span").text(" ");
}
