Template.modalPoda.helpers({
  nombrePlanta: function() {
    var planta = Session.get("PlantaSeleccionada");
    return planta ? planta.nombre : false;
  }
});

Template.modalPoda.events({
  "click #btn-ok": function() {
    var planta = Session.get("PlantaSeleccionada");
    $("#modal-poda").modal("hide");
    if(!planta) return false;
    Meteor.call("ActualizarPlanta", planta._id, { poda: true });
  }
});