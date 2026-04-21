const express = require("express");
const router = express.Router();
const Invitacion = require("../models/Invitacion");
const Task = require("../models/Task");
const auth = require("../middleware/auth.midleware");
const Tag = require("../models/Tag");
const multer = require("multer");
const User = require("../models/user.model");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ============ POST ============

router.post("/invitaciones", auth, upload.single("image"), async (req, res) => {
  try {
    if (req.userRol !== "administrador") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const { title, userId, tags, mensaje } = req.body; // 👈 añadido mensaje

    if (!title)
      return res.status(400).json({ error: "El titulo es obligatorio" });

    const destinatario = await User.findById(userId);
    if (!destinatario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    if (destinatario.rol !== "user") {
      return res
        .status(400)
        .json({ error: "Solo se pueden asignar tareas a usuarios" });
    }

    let tagIds = [];
    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim().toLowerCase());
      for (const name of tagArray) {
        let tag = await Tag.findOne({ name });
        if (!tag) tag = await Tag.create({ name });
        tagIds.push(tag._id);
      }
    }

    const tarea = new Task({
      title,
      userId: req.userId,
      userRol: req.userRol,
      image: req.file ? req.file.filename : null,
      tags: tagIds,
      asignada: "limbo",
    });
    await tarea.save();

    const invitacion = new Invitacion({
      taskId: tarea._id,
      userId,
      estado: "pendiente",
      mensaje: mensaje || null, // 👈 añadido mensaje
    });
    await invitacion.save();

    const populated = await Invitacion.findById(invitacion._id)
      .populate("taskId")
      .populate("userId", "name email");

    res.json(populated);
  } catch (error) {
    console.log("ERROR INVITACION:", error);
    res.status(500).json({ error: "Error al crear invitación" });
  }
});

// ============ GET ============

router.get("/invitaciones", auth, async (req, res) => {
  try {
    let invitaciones;

    if (req.userRol === "administrador") {
      // 👈 nueva implementación más limpia
      const tareasAdmin = await Task.find({
        userId: req.userId,
        asignada: "limbo",
      }).select("_id");

      const tareaIds = tareasAdmin.map((t) => t._id);

      invitaciones = await Invitacion.find({ taskId: { $in: tareaIds } })
        .populate("taskId")
        .populate("userId", "name email");
    } else {
      invitaciones = await Invitacion.find({ userId: req.userId })
        .populate("taskId")
        .populate("userId", "name email");
    }

    res.json(invitaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener invitaciones" });
  }
});

// ============ PUT ============

router.put("/invitaciones/:id", auth, async (req, res) => {
  try {
    const invitacion = await Invitacion.findById(req.params.id);
    if (!invitacion) {
      return res.status(404).json({ error: "Invitación no encontrada" });
    }

    const { aceptar } = req.body;

    if (aceptar) {
      await Task.findByIdAndUpdate(invitacion.taskId, {
        userId: req.userId,
        userRol: "user",
        asignada: "si",
      });
      await Invitacion.findByIdAndDelete(req.params.id);
      res.json({ message: "Invitación aceptada" });
    } else {
      await Task.findByIdAndDelete(invitacion.taskId);
      await Invitacion.findByIdAndDelete(req.params.id);
      res.json({ message: "Invitación rechazada y tarea eliminada" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al gestionar invitación" });
  }
});

module.exports = router;
