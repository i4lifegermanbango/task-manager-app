const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth.midleware");
const multer = require("multer");
const Tag = require("../models/Tag");
const User = require("../models/user.model");
const enviarCorreo = require("../services/email.services");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.get("/tasks", auth, async (req, res) => {
  try {
    let tasks;
    if (req.userRol === "administrador") {
      tasks = await Task.find().populate("tags");
    } else {
      tasks = await Task.find({ userId: req.userId }).populate("tags");
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

router.post("/tasks", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, tags } = req.body;

    if (!title)
      return res.status(400).json({ error: "El titulo es obligatorio" });

    let tagIds = [];

    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim().toLowerCase());

      for (const name of tagArray) {
        let tag = await Tag.findOne({ name });

        if (!tag) {
          tag = await Tag.create({ name });
        }

        tagIds.push(tag._id);
      }
    }

    const newTask = new Task({
      title,
      userId: req.userId,
      image: req.file ? req.file.filename : null,
      tags: tagIds,
      userRol: req.userRol,
    });

    await newTask.save();
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ error: "Error al crear tarea" });
  }
});

router.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
    if (task.completed === "pendiente") {
      task.completed = "en_proceso";
    } else if (task.completed === "en_proceso") {
      task.completed = "completada";
    }
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la tarea" });
  }
});

router.put("/tasks/:id/add-tag", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { tagId } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

    if (!task.tags.includes(tagId)) {
      task.tags.push(tagId);
    }

    await task.save();
    const updatedTask = await Task.findById(id).populate("tags");
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Error al añadir tag" });
  }
});

router.put("/tasks/:id/remove-tag", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { tagId } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

    task.tags.pull(tagId);

    await task.save();
    const updatedTask = await Task.findById(id).populate("tags");
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar tag" });
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { avisar } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    if (
      req.userRol !== "administrador" &&
      task.userId.toString() !== req.userId
    ) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const user = await User.findById(task.userId);

    await Task.findByIdAndDelete(id);

    if (
      req.userRol === "administrador" &&
      avisar &&
      task.userRol === "user" &&
      user?.email
    ) {
      await enviarCorreo(
        user.email,
        "Tarea eliminada",
        `Hola ${user.name}, tu tarea "${task.title}" ha sido eliminada por un administrador.`,
      );
    }

    res.json({ message: "Tarea eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la tarea" });
  }
});

router.delete("/tasks", auth, async (req, res) => {
  try {
    if (req.userRol !== "administrador") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    await Task.deleteMany();

    res.json({ message: "Todas las tareas eliminadas" });
  } catch (error) {}
});

module.exports = router;
