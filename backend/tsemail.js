const enviarCorreo = require("./src/services/email.services");

enviarCorreo(
  "germanbango@gmail.com", // pon tu propio correo para probar
  "Prueba desde Node",
  "Esto funciona 🔥",
);
