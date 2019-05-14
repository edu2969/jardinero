Template.modalConfig.rendered = function () {
  Session.set("MensajeError", false);
  Session.set("ReglaSeleccionada", false);
  Session.set("DispositivoSeleccionado", false);
  $('.timepicker-component').datetimepicker({
    format: 'HH:mm'
  });
  $('.datetimepicker-component').datetimepicker({
    format: 'DD/MM/YY'
  });
}

Template.modalConfig.helpers({
  error: function () {
    return Session.get("MensajeError");
  },
  dispositivo: function () {
    var d = Session.get("DispositivoSeleccionado");
    if (!d) return false;
    d.gpio = ConversorPin2GPIO(d.pin);
    if(d.tipo=="DHT11") {
      if(!d.tmin) d.tmin = 15;
      if(!d.tmax) d.tmax = 25;
      if(!d.hmin) d.hmin = 60;
      if(!d.hmax) d.hmax = 80;
    }
    return d;
  },
  reglaSeleccionada: function () {
    return Session.get("ReglaSeleccionada");
  },
  reglas: function () {
    var d = Session.get("DispositivoSeleccionado");
    if (!d) return false;
    return Reglas.find({
      dispositivoId: d._id
    }).map(function (o, indice) {
      o.indice = indice + 1;
      if (o.expresion) {
        o.exp = conversorExpresion(o.expresion);
      } else {
        o.exp = false;
      }
      o.textoAccion = (o.tipo == "I" ? "Encender" : (o.tipo == "O" ? "Apargar" : "Intervalo"));
      return o;
    });
  },
  tipos: function () {
    return TraductorTipos("*");
  },
  glosaDispositivo: function () {
    var dispositivo = Session.get("DispositivoSeleccionado");
    if (!dispositivo) return "NO DEFINIDO!";
    return TraductorTipos(dispositivo.tipo);
  },
  isSensor: function () {
    var d = Session.get("DispositivoSeleccionado");
    if (!d) return false;
    return d.tipo.indexOf("DHT11") != -1;
  },
  isReglamentado: function () {
    var d = Session.get("DispositivoSeleccionado");
    if (!d || !d.tipo || d.tipo=="DHT11") return false;
    return !(d.modo && d.modo.manual);
  },
  isModoManual: function () {
    var d = Session.get("DispositivoSeleccionado");
    if (!d) return false;
    return d.modo && d.modo.manual;
  },
  reglaTieneHorario: function() {
    return Session.get("ReglaSeleccionada") && Session.get("ReglaSeleccionada").desde;
  }
});

var timer = false;
Template.modalConfig.events({
  "click .simple-switch-outter": function (e) {
    var d = Session.get("DispositivoSeleccionado");
    var modo = $("#input-modo").attr("data-switch") == "true" ? {
      manual: true,
      encendido: $("#input-onoff").attr("data-switch") == "true" ? true : false
    } : false;
    if (!d.modo || d.modo.manual != modo.manual || d.modo.encendido != modo.encendido) {
      Dispositivos.update({ _id: d._id }, { $set: { modo: modo }});
    } else {
      Dispositivos.update({ _id: d._id }, { $unset: { modo: "" }});
    }
    d.modo = modo;
    Session.set("DispositivoSeleccionado", d);
  },
  "click #btn-agregar-regla": function () {
    $(".selector-fecha").hide();
    $(".selector-desde").hide();
    $(".selector-cada").hide();
    var dId = Session.get("DispositivoSeleccionado")._id;
    Session.set("ReglaSeleccionada", {
      dispositivoId: dId,
      indice: Reglas.find({ dispositivoId: dId }).count() + 1
    });
  },
  "click .checkbox": function (e) {
    //e.preventDefault();
    var div = e.currentTarget.id.split('-')[1];
    $(".selector-" + div).fadeToggle();
  },
  "click .editor-regla-cruz": function (e) {
    e.preventDefault();

    // Se actualizan los datos del dispositivo
    var dispositivo = Session.get("DispositivoSeleccionado");

    // Guarda la regla finalmente
    var regla = Session.get("ReglaSeleccionada");
    var docSet = regla._id ? {} : regla;
    var docUnset = {};

	  if($("#select-accion").find(":selected").attr("id")!=regla.tipo) {
	  	docSet.tipo = $("#select-accion").find(":selected").attr("id");
	  }

    if ($("#chk-fecha label input").is(":checked")) {
      var fechaDesde = moment($("#input-fechaDesde").val(), "DD/MM/YY").toDate();
      var fechaHasta = moment($("#input-fechaHasta").val(), "DD/MM/YY").toDate();
      if (fechaDesde != regla.fechaDesde && !IsEmpty(fechaDesde)) {
        docSet.fechaDesde = fechaDesde;
      }
      if (fechaHasta != regla.fechaHasta && !IsEmpty(fechaHasta)) {
        docSet.fechaHasta = fechaHasta;
      }
    } else {
      if (regla.fechaDesde) {
        docUnset.fechaDesde = "";
        docUnset.fechaHasta = "";
      }
    }

    // CHECK HORARIO
    if ($("#chk-horario label input").is(":checked")) {
      var desde = $("#input-desde").val();
      var hasta = $("#input-hasta").val();
      if (desde != regla.desde) {
        if(!IsEmpty(desde)) {
          docSet.desde = desde;
          docUnset.horaInicio = "";
        }
      }
      if (hasta != regla.hasta) {
        if(!IsEmpty(hasta)) {
          docSet.hasta = hasta;
          docUnset.horaInicio = "";
        }
      }
    } else {
      if(regla.desde) {
        docUnset.desde = "";
        docUnset.hasta = "";
      }
    }
    // CHECK CICLO
    if ($("#chk-ciclo label input").is(":checked")) {
      var intervalo = $("#input-intervalo").val();
      var cada = $("#input-cada").val();
      if (intervalo != regla.intervalo) {
        if(!IsEmpty(intervalo)) {
          docSet.intervalo = intervalo;
          docUnset.horaInicio = "";
        }
      }
      if (cada != regla.cada) {
        if(!IsEmpty(cada)) {
          docSet.cada = cada;
          docUnset.horaInicio = "";
        }
      }
    } else {
      if (regla.intervalo) {
        docUnset.cada = "";
        docUnset.intervalo = "";
        docUnset.horaInicio = "";
      }
    }

    // Se almacenan los datos de REGLA
    if (!regla._id) {
      Meteor.call("AgregarRegla", docSet);
    } else {
      if(!IsEmpty(docSet) || !IsEmpty(docUnset)) {
        var doc = {};
        if (!IsEmpty(docSet)) doc.$set = docSet;
        if (!IsEmpty(docUnset)) doc.$unset = docUnset;
        Meteor.call("ActualizarRegla", regla._id, doc);
      }
    }

    // Se cierra la edicion de la regla de forma reactiva
    Session.set("ReglaSeleccionada", false);
  },
  "click .btn-editar-regla": function (e) {
    e.preventDefault();
    var id = e.currentTarget.parentNode.id;
    var regla = Reglas.findOne({
      _id: id
    });
    regla.exp = conversorExpresion(regla.expresion);
    if (!regla.fechaDesde) {
      $(".selector-fecha").hide();
    } else {
      $(".selector-fecha").show();
    }
    if (!regla.desde) {
      $(".selector-horario").hide();
    } else {
      $(".selector-horario").show();
    }
    if (!regla.cada) {
      $(".selector-ciclo").hide();
    } else {
      $(".selector-ciclo").show();
    }
    Session.set("ReglaSeleccionada", regla);
  },
  "click .btn-eliminar-regla": function(e) {
    var id = e.currentTarget.parentNode.id;
    Meteor.call("EliminarRegla", id);
  },
  "click .btn-cerrar-dispositivo": function() {
    var dispositivo = Session.get("DispositivoSeleccionado");

    var nombre = $("#input-nombre").val();
    var docSet = dispositivo._id ? {} : dispositivo;
    var docUnset = {};
    if(dispositivo.nombre != nombre || !IsEmpty(nombre)) {
      docSet.nombre = nombre;
    } else if(IsEmpty(nombre)) {
      docUnset.nombre = "";
    }

    var tipo = $("#select-tipo").find(":selected").attr("id");
    if (dispositivo.tipo != tipo)
      docSet.tipo = tipo;

    var pin = Number($("#input-pin").val());
    var ocupado = false;
    Dispositivos.find().forEach(function(reg) {
      if(reg._id != dispositivo._id && reg.pin==pin) {
        Session.set("MensajeError", {
          mensaje: "El GPIO se encuentra ocupado"
        });
        ocupado = true;
      }
    });
    if(ocupado) return;
	  if(dispositivo.pin!=pin) {
		  docSet.pin = pin;
	  }
    if(dispositivo.pin != pin && pin > 0) {
      var gpio = ConversorPin2GPIO(pin);
      if(gpio.indexOf("GPIO")==-1) {
        Session.set("MensajeError", {
          mensaje: "El pin " + pin + " (" + gpio + ") no es un GPIO"
        });
        return false;
      }
    } else if(!pin) {
      $("#input-pin").parent().addClass("has-error");
      Session.set("MensajeError", {
        mensaje: "El PIN es obligatorio"
      });
      return false;
    } else if(dispositivo.pin != pin){
      docSet.pin = pin;
    }

    if(tipo=="DHT11") {
      var tmin = Number($("#input-tmin").val());
      var tmax= Number($("#input-tmax").val());
      var hmin = Number($("#input-hmin").val());
      var hmax = Number($("#input-hmax").val());
      if(dispositivo.tmin != tmin) {
        docSet.tmin;
      }
      if(dispositivo.tmax != tmax) {
        docSet.tmax;
      }
      if(dispositivo.hmin != hmin) {
        docSet.hmin;
      }
      if(dispositivo.hmax != hmax) {
        docSet.hmax;
      }
    }

    // ACTUALIZACION DE DISPOSITIVO
    if (!dispositivo._id) {
      Meteor.call("AgregarDispositivo", docSet, function() {
        $("#modal-config").modal("hide");
      });
    } else {
      if(!IsEmpty(docSet) || !IsEmpty(docUnset)) {
        var doc = {};
        if (!IsEmpty(docSet)) doc.$set = docSet;
        if (!IsEmpty(docUnset)) doc.$unset = docUnset;
        Meteor.call("ActualizarDispositivo",
          dispositivo._id, doc,
          function(err, resp) {
            if(!err) {
              $("#modal-config").modal("hide");
            }
          });
      }
    }
    $(".form-group").removeClass("has-error");
    Session.set("MensajeError", false);
  }
});

conversorExpresion = function (exp) {
  if (!exp) return false;
  var partes = exp.split(" ");
  return {
    variable: partes[0],
    operacion: partes[1],
    valor: partes[2]
  };
}
