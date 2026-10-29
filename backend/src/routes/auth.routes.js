const express = require("express");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();
const SECRET_KEY = "mi_secreto";

const auth = require("../middleware/auth.midleware");

router.get("/users", auth, async (req, res) => {
  try {
    if (req.userRol !== "administrador") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const users = await User.find({ rol: "user" }, "name email _id");

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, password, rol, name, email } = req.body;
    const user = new User({ username, password, rol, name, email });
    await user.save();

    res.status(201).json({ message: "Usuario creado" });
  } catch (error) {
    res.status(400).json({ error: "El nuevo usuario ya existe" });
  }
});

router.post(`/login`, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Creedenciales incorrectas" });
    }
    const token = jwt.sign({ userId: user._id, rol: user.rol }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error en el serivdor" });
  }
});

module.exports = router;
