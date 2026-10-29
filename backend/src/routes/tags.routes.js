const express = require("express");
const router = express.Router();
const Tag = require("../models/Tag");
const auth = require("../middleware/auth.midleware");

router.get("/tags", async (req, res) => {
  try {
    const tags = await Tag.find();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tags" });
  }
});

router.post("/tags", auth, async (req, res) => {
  try {
    if (req.userRol !== "administrador") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const { name } = req.body;

    const tag = new Tag({ name: name.toLowerCase() });
    await tag.save();

    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: "Error al crear tag" });
  }
});

router.put("/tags/:id", auth, async (req, res) => {
  try {
    if (req.userRol !== "administrador") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const { id } = req.params;
    const { name } = req.body;

    const tag = await Tag.findById(id);
    if (!tag) return res.status(404).json({ error: "Tag no encontrado" });

    tag.name = name.toLowerCase();
    await tag.save();

    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar tag" });
  }
});

router.delete("/tags/:id", auth, async (req, res) => {
  try {
    if (req.userRol !== "administrador") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const { id } = req.params;

    await Tag.findByIdAndDelete(id);

    const Task = require("../models/Task");

    await Task.updateMany({ tags: id }, { $pull: { tags: id } });

    res.json({ message: "Tag eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar tag" });
  }
});
module.exports = router;
