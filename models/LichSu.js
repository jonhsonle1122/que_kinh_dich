import { Schema, model } from "mongoose";

const LichSuSchema = new Schema({
  hao: [
    {
      am_duong: Number, // 0 = âm, 1 = dương
      dong: Boolean,
    },
  ],
  ma_que: String,
  ma_que_bien: String,
  createdAt: { type: Date, default: Date.now },
});

export default model("LichSu", LichSuSchema);
