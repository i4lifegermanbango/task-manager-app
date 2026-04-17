const nodemailer = require("nodemailer");

const enviarCorreo = async (destinatario, asunto, mensaje) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "germanbango@gmail.com",
        pass: "glctjcsswyswgaql",
      },
    });

    const mailOptions = {
      from: "germanbango@gmail.com",
      to: destinatario,
      subject: asunto,
      text: mensaje,
    };

    await transporter.sendMail(mailOptions);

    console.log("Correo enviado correctamente");
  } catch (error) {
    console.error("Error al enviar correo:", error);
  }
};

module.exports = enviarCorreo;
