import { model, Schema } from "mongoose";
const haoDongSchema = new Schema({
  nhiPhanGoc: String, // Ví dụ: "111000"
  viTriHaoDong: [Number], // [1, 4] nếu có 2 hào động ở vị trí đó
  nhiPhanBien: String, // Kết quả sau khi đổi các hào
});

export default model("HaoDong", haoDongSchema);
