// models/TruongSinhPhase.js
import mongoose from "mongoose";

const TruongSinhPhaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
});

const TruongSinhPhase = mongoose.model(
  "TruongSinhPhase",
  TruongSinhPhaseSchema
);
export default TruongSinhPhase;
