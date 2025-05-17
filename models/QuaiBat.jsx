import { Schema, model } from "mongoose";
const quaiBatSchema = new Schema({
  ten: String, // Ví dụ: "Càn"
  hanh: String, // "Kim"
  huong: String, // "Tây Bắc"
  dacTinh: String, // "Cứng rắn, mạnh mẽ..."
  nhiPhan: String, // "111"
});

export default model("QuaiBat", quaiBatSchema);
