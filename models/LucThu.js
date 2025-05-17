import { Schema, model } from "mongoose";
const lucThuSchema = new Schema({
  ten: { type: String, required: true }, // Ví dụ: "Giáp Tý"
});

export default model("LucThu", lucThuSchema);
