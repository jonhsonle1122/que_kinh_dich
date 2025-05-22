// models/Token.js
import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  refreshToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "15d" }, // Tự xóa sau 15 ngày
});

export default mongoose.model("Token", tokenSchema);
