// models/ElementCycle.js
import mongoose from "mongoose";

const ElementCycleSchema = new mongoose.Schema({
  hanh: { type: String, required: true },
  truongSinhStart: { type: String, required: true }, // Địa chi bắt đầu Trường Sinh
  cycle: [
    {
      diaChi: { type: String, required: true }, // Tý, Sửu, Dần,...
      phase: { type: String, required: true }, // Trường Sinh, Mộc Dục,...
    },
  ],
});

export default mongoose.model("ElementCycle", ElementCycleSchema);
