const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    completed: {
      type: String,
      enum: ["pendiente", "en_proceso", "completada"],
      default: "pendiente",
    },
    image: {
      type: String,
      default: null,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    userRol: {
      type: String,
      enum: ["user", "administrador"],
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
