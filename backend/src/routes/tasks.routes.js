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

// ============ GET ============

router.get("/tasks/deleted", auth, async (req, res) => {
  try {
    let tasks;
    if (req.userRol === "administrador") {
      tasks = await Task.find({ deleted: true })
        .populate("tags")
        .populate("userId", "name");
    } else {
      tasks = await Task.find({ userId: req.userId, deleted: true })
        .populate("tags")
        .populate("userId", "name");
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

router.get("/tasks/asignadas", auth, async (req, res) => {
  try {
    let tasks;
    if (req.userRol === "administrador") {
      tasks = await Task.find({ deleted: false, asignada: "limbo" })
        .populate("tags")
        .populate("userId", "name");
    } else {
      tasks = await Task.find({
        userId: req.userId,
        deleted: false,
        asignada: "limbo",
      })
        .populate("tags")
        .populate("userId", "name");
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tareas asignadas" });
  }
});

router.get("/tasks", auth, async (req, res) => {
  try {
    let tasks;
    if (req.userRol === "administrador") {
      tasks = await Task.find({
        deleted: false,
        asignada: { $in: ["no", "si"] },
      })
        .populate("tags")
        .populate("userId", "name");
    } else {
      tasks = await Task.find({
        userId: req.userId,
        deleted: false,
        asignada: { $in: ["no", "si"] },
      })
        .populate("tags")
        .populate("userId", "name");
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

// ============ POST ============

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
      asignada: "no",
    });

    await newTask.save();

    const taskPopulated = await Task.findById(newTask._id)
      .populate("tags")
      .populate("userId", "name");

    res.json(taskPopulated);
  } catch (error) {
    res.status(500).json({ error: "Error al crear tarea" });
  }
});

// ============ PUT estáticas ============

router.put("/tasks/restore-selected", auth, async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await Task.updateMany(
      { _id: { $in: ids } },
      { deleted: false },
    );

    res.json({
      message: "Tareas restauradas",
      modified: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al restaurar tareas" });
  }
});

router.put("/tasks/restore-all", auth, async (req, res) => {
  try {
    let restore;
    if (req.userRol === "administrador") {
      restore = await Task.updateMany({ deleted: true }, { deleted: false });
    } else {
      restore = await Task.updateMany(
        { deleted: true, userId: req.userId },
        { deleted: false },
      );
    }

    res.json({
      message: "Todas las tareas restauradas",
      modified: restore.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al restaurar tareas" });
  }
});

router.put("/tasks/move-to-delete", auth, async (req, res) => {
  try {
    if (req.userRol !== "administrador") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const deleteAll = await Task.updateMany(
      { deleted: false },
      { deleted: true },
    );

    res.json({
      message: "Tareas cambiadas a borrar",
      modified: deleteAll.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al cambiar las tareas" });
  }
});

// ============ PUT dinámicas ============

router.put("/tasks/:id/add-tag", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { tagId } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

    if (
      req.userRol !== "administrador" &&
      task.userId.toString() !== req.userId
    ) {
      return res.status(403).json({ error: "No autorizado" });
    }

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

    if (
      req.userRol !== "administrador" &&
      task.userId.toString() !== req.userId
    ) {
      return res.status(403).json({ error: "No autorizado" });
    }

    task.tags.pull(tagId);

    await task.save();
    const updatedTask = await Task.findById(id).populate("tags");

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar tag" });
  }
});

router.put("/tasks/:id/change-deleted-state", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    task.deleted = !task.deleted;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la tarea" });
  }
});

router.put("/tasks/:id", auth, async (req, res) => {
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

// ============ DELETE estáticas ============

router.delete("/tasks/delete-selected", auth, async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await Task.deleteMany({
      _id: { $in: ids },
    });

    res.json({
      message: "Tareas eliminadas",
      deleted: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar tareas seleccionadas" });
  }
});

router.delete("/tasks", auth, async (req, res) => {
  try {
    if (req.userRol !== "administrador") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const result = await Task.deleteMany({ deleted: true });

    res.json({
      message: "Papelera vaciada",
      deleted: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar tareas" });
  }
});

// ============ DELETE dinámica ============

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

    if (!task.deleted) {
      return res.status(400).json({
        error: "Solo se pueden eliminar tareas que estén en la papelera",
      });
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

    res.json({ message: "Tarea eliminada definitivamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la tarea" });
  }
});

module.exports = router;
