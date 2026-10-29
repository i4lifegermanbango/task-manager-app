require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;
const connectDB = require("./config/db");
const tasksRoutes = require("./routes/tasks.routes");
const authRoutes = require("./routes/auth.routes");
const tagRoutes = require("./routes/tags.routes");
const invitacionRoutes = require("./routes/invitacion.routes");
const multer = require("multer");

fs.mkdirSync("uploads", { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.use(cors(FRONTEND_URL ? { origin: FRONTEND_URL } : {}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
connectDB();

app.use("/api", tasksRoutes);
app.use("/auth", authRoutes);
app.use("/api", tagRoutes);
app.use("/api", invitacionRoutes);

app.get("/", (req, res) => {
  res.send("¡Servidor ha fucnionado!");
});

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    image: req.file.filename,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
