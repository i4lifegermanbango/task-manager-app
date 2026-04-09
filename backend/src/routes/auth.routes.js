const express = require("express");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();
const SECRET_KEY = "mi_secreto";

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();

    res.status(201).json({ message: "Usuario creado" });
  } catch (error) {
    res.status(400).json({ error: "El nuevo usuario ya existe" });
  }
});

router.post(`/login`, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ usernae });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Creedenciales incorrectas" });
    }
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error en el serivdor" });
  }
});

module.exports = router;
