const jwt = require("jsonwebtoken");
const SECRET_KEY = "mi_secreto";

module.exports = (req, res, next) => {
  //prettier-ignore
  let token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Acceso denegado" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    req.userRol = decoded.rol;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token no valido" });
  }
};
