import { Schema, model } from "mongoose";

const QueSchema = new Schema({
  ma_hexagram: { type: String, required: true, unique: true },
  ten_que: { type: String, required: true },
  dien_giai: { type: String },
});

const Que = model("Que", QueSchema);
export default Que;
