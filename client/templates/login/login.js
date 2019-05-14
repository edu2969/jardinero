// @TODO llamar methos server con encriptacion md5
Template.login.rendered = function () {
  var anchoPantalla = $(window).width();
  var ancho = anchoPantalla > 320 ? 320 : anchoPantalla;
  $("#gesturepwd").GesturePasswd({
    backgroundColor: "transparent",
    color: "#81CFE0",
    roundRadii: ancho / 10,
    pointRadii: 12,
    space: ancho / 7.5,
    width: ancho,
    height: ancho,
    lineColor: "#336E7B",
    zindex: 100
  });
  $("#gesturepwd").on("hasPasswd", function (e, passwd) {
    var result;

    if (passwd == "1235789") {
      result = true;
    } else {
      result = false;
    }

    if (result == true) {
      $("#gesturepwd").trigger("passwdRight");
      setTimeout(function () {
        FlowRouter.go("/panel")
      }, 500);
    } else {
      $("#gesturepwd").trigger("passwdWrong");
      console.log("Password equivocado");
    }
  });
}