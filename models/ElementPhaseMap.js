// models/ElementPhaseMap.js
import mongoose from "mongoose";

const ElementPhaseMapSchema = new mongoose.Schema({
  hanh: {
    type: String,
    enum: ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"],
    required: true,
  },
  can: {
    type: [String],
    required: true,
  },
  truongSinhChi: {
    type: String,
    required: true,
  },
});

const ElementPhaseMap = mongoose.model(
  "ElementPhaseMap",
  ElementPhaseMapSchema
);
export default ElementPhaseMap;
