Meteor.methods({
  ProcesarLectura: function (temperatura, humedad) {
    // @TODO Corregir. Las lecturas son cada 5 segs, pero se almacena Logs cada 1 hora.
    var registro = Logs.findOne({}, { sort: { fecha: -1 }, limit: 1 });

    var ahora = moment();
    var desde = moment(ahora).startOf('hour');
    var hasta = moment(ahora).endOf('hour');
    /*console.log("Comparado: "
                + (registro ? moment(registro.fecha).format("dd/MM/YY HH:mm:ss") : "?")
                + " " + desde.format("dd/MM/YY HH:mm:ss")
                + " " + hasta.format("dd/MM/YY HH:mm:ss"));*/
    if(registro && moment(registro.fecha).isAfter(desde) && moment(registro.fecha).isBefore(hasta)) {
      Logs.update({ _id: registro._id }, { $set: {
        fecha: ahora.toDate(),
        promedio: {
          temperatura: ( registro.promedio.temperatura * registro.muestras + temperatura ) / ( registro.muestras + 1 ),
          humedad: ( registro.promedio.humedad * registro.muestras + humedad ) / ( registro.muestras + 1 )
        },
        actual: {
          temperatura: temperatura,
          humedad: humedad
        },
        muestras: registro.muestras + 1
      }});
      return;
    }

    if(registro && registro._id)
      Logs.update({ _id: registro._id }, { $unset: { actual: "", muestras: "" }});

    Logs.insert({
      fecha: ahora.toDate(),
      actual: {
        temperatura: temperatura,
        humedad: humedad
      },
      promedio: {
        temperatura: temperatura,
        humedad: humedad
      },
      muestras: 1
    });
  },
  AgregarNuevaPlanta: function(nombre) {
    Plantas.insert({ nombre: nombre });
  },
  ActualizarPlanta: function(plantaId, doc) {
    Plantas.update({ _id: plantaId }, { $set: doc });
  },
  SetearBitacora: function(doc) {
    var bitacora = Bitacoras.findOne({ plantaId: doc.plantaId, dia: doc.dia });
    if(!bitacora) {
      if(doc.nota && doc.nota.length > 0) {
        console.log("Insert omitido");
        var id = Bitacoras.insert(doc);
        return Bitacoras.findOne(id);
      }
    } else {
      Bitacoras.update({ plantaId: doc.plantaId, dia: doc.dia }, { $set: doc });
    }
  },
  AgregarRegla: function(doc) {
    Reglas.insert(doc);
  },
  ActualizarRegla: function(rId, doc) {
    Reglas.update({ _id: rId }, doc);
  },
  AgregarDispositivo: function(doc) {
	  var configId = Dispositivos.findOne({ configuracionId: { $exists: true }}).configuracionId;
	doc.configuracionId = configId;
    Dispositivos.insert(doc);
  },
  ActualizarDispositivo: function(id, doc) {
    Dispositivos.update({ _id: id }, doc)
  },
  EliminarRegla: function(id) {
    Reglas.remove(id);
  },
  ObtenerHoraServer() {
    return moment().toDate();
  }
});
