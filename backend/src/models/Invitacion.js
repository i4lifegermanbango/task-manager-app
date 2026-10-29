const mongoose = require("mongoose");

const invitacionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "aceptada", "rechazada"],
      default: "pendiente",
    },
    mensaje: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const Invitacion = mongoose.model("Invitacion", invitacionSchema);
module.exports = Invitacion;
