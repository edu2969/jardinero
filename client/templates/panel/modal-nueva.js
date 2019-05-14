Template.modalNueva.rendered = function() {
  Session.set("MensajeError", false);
}

Template.modalNueva.helpers({
  error: function() {
    return Session.get("MensajeError");
  }
});

var timer = false;
Template.modalNueva.events({
  "click #btn-ok": function() {
    var nombre = $("#input-nombre").val();
    $(".alert").fadeIn();
    if(nombre.trim().length==0) {
      Session.set("MensajeError", {
        mensaje: "Debe ingresar un nombre"
      });
      if(timer) clearTimeout(timer);
      timer = setTimeout(function() {
        $(".alert").fadeOut();
        Session.set("MensajeError", false);
      }, 3000);
      return false;
    }
    Meteor.call("AgregarNuevaPlanta", nombre);
    $("#modal-nueva").modal("hide");
    $("#input-nombre").val("");
  }
});