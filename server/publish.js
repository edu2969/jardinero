Meteor.publish('logs', function() {
  var desde = moment().subtract(3, "months");
  return Logs.find({ fecha: { $gt: desde.toDate() }}, { sort: { fecha: -1 }});
});
 
Meteor.publishComposite("config", function() {
  return {
    find: function() {
      return Configuraciones.find({}, { sort: { fecha: -1 }, limit: 1 });
    },
    children: [{
      find: function(c) {
        return Dispositivos.find({ configuracionId: c._id });
      },
      children: [{
        find: function(d) {
          return Reglas.find({ dispositivoId: d._id });
        },
        children: []
      }]
    }]
  }
});
 
Meteor.publishComposite('plantas', function() {
  return {
    find: function() {
      return Plantas.find({ poda: { $exists: false }});
    },
    children: [{
      find: function(p) {
        return Bitacoras.find({ plantaId: p._id });
      },
      children: []
    }]
  }
});